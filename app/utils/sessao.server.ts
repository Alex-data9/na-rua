import { createClient, type User } from "@supabase/supabase-js";
import { createCookie, redirect } from "react-router";

// Sessão de administrador: cookie httpOnly com os tokens do Supabase Auth. Nada é confiado no cookie em si:
// o token é validado no Supabase a cada requisição (inclusive revogação) e o papel vem de app_metadata.role,
// que o usuário comum não consegue alterar. Cadastro de pessoas é aberto; painel e exclusão exigem admin.
const cookie = createCookie("narua_sessao", {
  httpOnly: true,
  sameSite: "lax", // não vai em POST vindo de outro site (proteção contra CSRF)
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
});

export interface Admin {
  id: string;
  email: string;
}

interface Tokens {
  a: string; // access token
  r: string; // refresh token
}

interface Sessao {
  admin: Admin | null;
  /** Presente quando a sessão foi renovada (novo cookie) ou o cookie era inválido (limpar). */
  setCookie?: string;
}

// Cliente só para autenticação, nunca para dados: depois do login ele passaria a usar o token do usuário.
function clienteAuth() {
  const url = process.env.SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos.");
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}

const comoAdmin = (u: User | null | undefined): Admin | null =>
  u && u.app_metadata?.role === "admin" && u.email ? { id: u.id, email: u.email } : null;

export async function entrar(email: string, senha: string) {
  const { data, error } = await clienteAuth().auth.signInWithPassword({ email, password: senha });
  const admin = comoAdmin(data.user);
  if (error || !data.session || !admin) return null;
  return { admin, setCookie: await cookie.serialize({ a: data.session.access_token, r: data.session.refresh_token }) };
}

export async function sairDaSessao(request: Request) {
  const chave = request.headers.get("Cookie");
  if (chave) emAndamento.delete(chave); // o logout vale na hora, sem esperar o cache expirar
  const tokens = (await cookie.parse(request.headers.get("Cookie"))) as Tokens | null;
  if (tokens?.a) await clienteAuth().auth.admin.signOut(tokens.a, "local").catch(() => {}); // revoga este login
  return cookie.serialize("", { maxAge: 0 });
}

// Várias loaders da mesma navegação consultam a sessão ao mesmo tempo: compartilha o resultado por poucos segundos
// para não renovar o refresh token duas vezes (ele é de uso único). Curto de propósito: é a janela em que uma
// sessão revogada ainda seria aceita.
const CACHE_MS = 3_000;
const emAndamento = new Map<string, Promise<Sessao>>();

async function verificar(chaveCookie: string | null): Promise<Sessao> {
  const tokens = (await cookie.parse(chaveCookie)) as Tokens | null;
  if (!tokens?.a || !tokens?.r) return { admin: null };

  const auth = clienteAuth().auth;
  const { data } = await auth.getUser(tokens.a);
  const admin = comoAdmin(data.user);
  if (admin) return { admin };

  const renovada = await auth.refreshSession({ refresh_token: tokens.r });
  const adminRenovado = comoAdmin(renovada.data.user);
  if (!renovada.error && renovada.data.session && adminRenovado) {
    return {
      admin: adminRenovado,
      setCookie: await cookie.serialize({ a: renovada.data.session.access_token, r: renovada.data.session.refresh_token }),
    };
  }
  return { admin: null, setCookie: await cookie.serialize("", { maxAge: 0 }) };
}

export function obterSessao(request: Request): Promise<Sessao> {
  const chave = request.headers.get("Cookie");
  if (!chave) return Promise.resolve({ admin: null });
  let promessa = emAndamento.get(chave);
  if (!promessa) {
    promessa = verificar(chave);
    emAndamento.set(chave, promessa);
    setTimeout(() => emAndamento.delete(chave), CACHE_MS).unref?.();
  }
  return promessa;
}

function origemPermitida(request: Request) {
  const origem = request.headers.get("Origin");
  if (!origem) return true;
  const aceitos = [new URL(request.url).host, request.headers.get("Host"), request.headers.get("X-Forwarded-Host")];
  try {
    return aceitos.includes(new URL(origem).host);
  } catch {
    return false;
  }
}

// Use no início de toda loader/action da área restrita.
export async function exigirAdmin(request: Request): Promise<Admin> {
  const url = new URL(request.url);
  if (request.method !== "GET" && request.method !== "HEAD" && !origemPermitida(request)) {
    throw new Response("Origem não permitida.", { status: 403 });
  }

  const { admin, setCookie } = await obterSessao(request);
  const cabecalhos = setCookie ? { "Set-Cookie": setCookie } : undefined;

  if (!admin) {
    const proximo = encodeURIComponent(url.pathname + url.search);
    throw redirect(`/login?proximo=${proximo}`, { headers: cabecalhos });
  }
  // Sessão renovada: grava o novo cookie e refaz a navegação (uma ação POST precisa ser repetida pelo usuário).
  if (setCookie) throw redirect(url.pathname + url.search, { status: 303, headers: cabecalhos });
  return admin;
}

// Destino pós-login: só caminhos internos da área restrita (evita redirecionamento para sites externos).
export function destinoSeguro(valor: string | null) {
  return valor && /^\/painel(\/[A-Za-z0-9-]+)?(\?[A-Za-z0-9=&_%-]*)?$/.test(valor) ? valor : "/painel";
}
