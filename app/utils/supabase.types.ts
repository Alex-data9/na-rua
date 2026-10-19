// Tipos manuais alinhados ao schema em supabase/migrations (0001 + 0002).
// Substitua por `supabase gen types typescript` quando conveniente.
export type StatusAcompanhamento =
  | "novo"
  | "em_acompanhamento"
  | "busca_familiar"
  | "vinculado_a_servico";

export interface PessoaRow {
  id: string;

  // Bloco 1 — identificação e controle
  codigo_familiar: number; // 1.01
  modalidade_operacao: number; // 1.07
  forma_coleta: number; // 1.08
  data_entrevista: string; // 1.10 (AAAA-MM-DD)
  agente: string | null; // 1.11 nome do entrevistador
  entrevistador_cpf: string | null; // 1.12 (só dígitos)
  uf: string | null; // 1.02
  municipio: string | null; // 1.03
  distrito: string | null;
  subdistrito: string | null;
  setor_censitario: string | null;
  referencia: string; // equipamento de referência (RF04)
  obs: string | null; // 1.13

  // Bloco 2 — identificação da pessoa
  ordem: number; // 2.01
  nome: string; // 2.02
  nis: string | null; // 2.03 (só dígitos)
  apelido: string | null;
  idade: number | null;
  cidade_nascimento: string | null;
  estado_nascimento: string | null;
  estado_civil: string | null;
  nome_pais: string | null;
  cpf: string | null; // só dígitos
  rg: string | null;
  telefone: string | null; // DDD + número, só dígitos
  foto_url: string | null;

  dorme_rua_dias: number | null; // 2.04
  dorme_albergue_dias: number | null;
  dorme_domicilio_dias: number | null;
  dorme_outro_dias: number | null;
  tempo_rua_faixa: number | null; // 2.05
  tempo_cidade_faixa: number | null; // 2.07
  motivos: number[] | null; // 2.06
  vive_familia_na_rua: boolean | null; // 2.08
  contato_parente: number | null; // 2.09
  atividades_comunitarias: number[] | null; // 2.10
  atendimentos_6m: number[] | null; // 2.11
  carteira_assinada: boolean | null; // 2.12
  atividades_renda: number[] | null; // 2.13
  moradia_anterior: string | null;
  moradia_atual: string | null;
  redes_apoio: string | null;

  // Fechamento
  assinatura_rf: string | null;
  assinatura_entrevistador: string | null;
  assinatura_representante: string | null;
  assinatura_confirmada: boolean;
  campanha_pop_rua: boolean;
  consentimento_lgpd: boolean;

  status: StatusAcompanhamento;
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
