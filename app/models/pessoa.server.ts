import { getSupabaseClient } from "~/utils/supabase.server";
import type { NotaRow, PessoaRow, StatusAcompanhamento } from "~/utils/supabase.types";

const ATUALIZACAO_LIMITE_DIAS = 30;
const ATUALIZACAO_LIMITE_MESES = 24; // RF13 — Guia de Cadastramento MDS / Decreto 6.135

export type NovaPessoa = Omit<
  PessoaRow,
  "id" | "data_cadastro" | "ultima_atualizacao" | "status"
> & { status?: StatusAcompanhamento };

export async function criarPessoa(dados: NovaPessoa) {
  const supabase = getSupabaseClient();
  const agora = new Date().toISOString();

  const { data, error } = await supabase
    .from("pessoa")
    .insert({
      ...dados,
      status: dados.status ?? "novo",
      data_cadastro: agora,
      ultima_atualizacao: agora,
    })
    .select()
    .single();

  if (error) throw new Error(`Falha ao criar cadastro: ${error.message}`);
  return data as unknown as PessoaRow;
}

export async function listarPessoas(filtro?: {
  nome?: string;
  status?: StatusAcompanhamento;
}) {
  const supabase = getSupabaseClient();
  let query = supabase
    .from("pessoa")
    .select("*")
    .order("data_cadastro", { ascending: false });

  if (filtro?.nome) {
    query = query.ilike("nome", `%${filtro.nome}%`);
  }
  if (filtro?.status) {
    query = query.eq("status", filtro.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar cadastros: ${error.message}`);
  return data as unknown as PessoaRow[];
}

export async function obterPessoa(id: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("pessoa")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Cadastro não encontrado: ${error.message}`);
  return data as unknown as PessoaRow;
}

export async function atualizarStatusPessoa(
  id: string,
  status: StatusAcompanhamento,
) {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from("pessoa")
    .update({ status, ultima_atualizacao: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(`Falha ao atualizar status: ${error.message}`);
}

export async function adicionarNota(pessoaId: string, texto: string, autor: string) {
  const supabase = getSupabaseClient();
  const { error: notaError } = await supabase
    .from("nota")
    .insert({ pessoa_id: pessoaId, texto, autor });
  if (notaError) throw new Error(`Falha ao registrar anotação: ${notaError.message}`);

  const { error: pessoaError } = await supabase
    .from("pessoa")
    .update({ ultima_atualizacao: new Date().toISOString() })
    .eq("id", pessoaId);
  if (pessoaError) throw new Error(`Falha ao atualizar cadastro: ${pessoaError.message}`);
}

export async function listarNotas(pessoaId: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("nota")
    .select("*")
    .eq("pessoa_id", pessoaId)
    .order("ts", { ascending: false });

  if (error) throw new Error(`Falha ao listar anotações: ${error.message}`);
  return data as unknown as NotaRow[];
}

// RF07 — indicadores agregados do painel
export async function obterIndicadores() {
  const pessoas = await listarPessoas();
  const agora = Date.now();
  const seteDias = 7 * 24 * 60 * 60 * 1000;
  const trintaDias = ATUALIZACAO_LIMITE_DIAS * 24 * 60 * 60 * 1000;

  return {
    totalCadastrados: pessoas.length,
    novosNaSemana: pessoas.filter(
      (p) => agora - new Date(p.data_cadastro).getTime() < seteDias,
    ).length,
    buscasFamiliaresAtivas: pessoas.filter((p) => p.status === "busca_familiar")
      .length,
    semAtualizacao30Dias: pessoas.filter(
      (p) => agora - new Date(p.ultima_atualizacao).getTime() > trintaDias,
    ).length,
  };
}

// RF13 — sinaliza cadastros sem atualização há mais de 24 meses
export function precisaReentrevista(pessoa: PessoaRow) {
  const limite = ATUALIZACAO_LIMITE_MESES * 30 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(pessoa.ultima_atualizacao).getTime() > limite;
}
