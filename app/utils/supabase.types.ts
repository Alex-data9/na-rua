// Tipos manuais alinhados ao schema em supabase/migrations/0001_init.sql.
// Substitua por `supabase gen types typescript` quando o projeto Supabase real existir.
export type StatusAcompanhamento =
  | "novo"
  | "em_acompanhamento"
  | "busca_familiar"
  | "vinculado_a_servico";

export interface PessoaRow {
  id: string;
  nome: string;
  apelido: string | null;
  idade: number | null;
  cidade_nascimento: string | null;
  estado_nascimento: string | null;
  estado_civil: string | null;
  nome_pais: string | null;
  documentos: string[] | null;
  nis: string | null;
  foto_url: string | null;
  dorme: string | null;
  tempo_rua: string | null;
  motivo: string[] | null;
  contato_familia: string | null;
  renda: string[] | null;
  moradia_anterior: string | null;
  moradia_atual: string | null;
  redes_apoio: string | null;
  referencia: string;
  agente: string | null;
  telefone: string | null;
  status: StatusAcompanhamento;
  campanha_pop_rua: boolean;
  consentimento_lgpd: boolean;
  assinatura_confirmada: boolean;
  obs: string | null;
  data_cadastro: string;
  ultima_atualizacao: string;
}

export interface NotaRow {
  id: string;
  pessoa_id: string;
  texto: string;
  autor: string;
  ts: string;
}
