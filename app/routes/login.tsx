import { Form, Link, redirect, useActionData, useNavigation, useSearchParams } from "react-router";
import type { Route } from "./+types/login";
import { Alerta } from "~/components/Alerta";
import { Botao } from "~/components/Botao";
import { Campo, CampoSenha } from "~/components/campos";
import { destinoSeguro, entrar, obterSessao } from "~/utils/sessao.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Acesso restrito — NaRua" }, { name: "robots", content: "noindex" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const { admin } = await obterSessao(request);
  if (admin) throw redirect("/painel");
  return null;
}

const MENSAGEM_ERRO = "E-mail ou senha incorretos, ou esta conta não tem acesso de administrador.";

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  const proximo = destinoSeguro(String(form.get("proximo") ?? ""));

  if (!email || !senha) return { erro: "Informe o e-mail e a senha.", email, tentativa: Date.now() };

  const sessao = await entrar(email, senha);
  if (!sessao) {
    await new Promise((r) => setTimeout(r, 600)); // desacelera tentativas em sequência
    return { erro: MENSAGEM_ERRO, email, tentativa: Date.now() };
  }
  return redirect(proximo, { headers: { "Set-Cookie": sessao.setCookie } });
}

export default function Login() {
  const dados = useActionData<typeof action>();
  const [params] = useSearchParams();
  const enviando = useNavigation().state === "submitting";

  return (
    <main className="malha-ruas-clara">
      <div className="mx-auto max-w-md px-4 py-10 md:py-16">
      {/* placa de regulamentação: sinaliza a área restrita */}
      <p className="mb-5 inline-flex items-center gap-2 rounded-[6px] bg-asfalto-800 px-3 py-2 font-mono text-[11px] font-bold tracking-[0.14em] text-white uppercase shadow-[inset_0_0_0_2px_rgb(255_255_255/0.85)]">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="7" width="10" height="7" rx="1" />
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
        </svg>
        Acesso restrito
      </p>
      <h1 className="titulo-display mb-2 text-4xl">
        Entrar<span aria-hidden="true" className="text-poste-500">.</span>
      </h1>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Área para administradores: consulta, acompanhamento e exclusão de cadastros. O cadastro de pessoas é aberto a
        todos em <Link to="/cadastro" className="link">Novo cadastro</Link>.
      </p>

      <div className="cartao">
        <Form method="post" noValidate className="space-y-5">
          <input type="hidden" name="proximo" value={params.get("proximo") ?? ""} />
          {dados?.erro && <Alerta tipo="erro">{dados.erro}</Alerta>}
          <Campo label="E-mail" name="email" type="email" autoComplete="username" obrigatorio defaultValue={dados?.email} />
          {/* nova chave a cada tentativa falha: limpa a senha digitada e devolve o foco ao campo */}
          <CampoSenha key={dados?.tentativa ?? 0} label="Senha" name="senha" autoFocus={Boolean(dados?.erro)} />
          <Botao type="submit" className="w-full" carregando={enviando} textoCarregando="Entrando...">
            Entrar
          </Botao>
        </Form>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Sem acesso? As contas são criadas pela administração do sistema.
      </p>
      </div>
    </main>
  );
}
