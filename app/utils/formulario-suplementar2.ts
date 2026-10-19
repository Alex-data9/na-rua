// Opções codificadas do Formulário Suplementar 2 (Cadastro Único / MDS) — pessoa em situação de rua.
// Os códigos numéricos são os do formulário oficial e são gravados como estão no banco.
export interface Opcao {
  value: number;
  label: string;
}

export const MODALIDADE_OPERACAO: Opcao[] = [
  { value: 1, label: "Inclusão" },
  { value: 2, label: "Alteração" },
];

export const FORMA_COLETA: Opcao[] = [
  { value: 1, label: "Sem visita domiciliar" },
  { value: 2, label: "Com visita domiciliar" },
];

// 2.04 — cada local tem um campo "quantas vezes por semana" (soma máxima 7)
export const LOCAIS_DORMIR = [
  { campo: "dorme_rua_dias", value: 1, label: "Rua" },
  { campo: "dorme_albergue_dias", value: 2, label: "Albergue" },
  { campo: "dorme_domicilio_dias", value: 3, label: "Domicílio particular" },
  { campo: "dorme_outro_dias", value: 4, label: "Outro" },
] as const;

// 2.05 e 2.07
export const FAIXAS_TEMPO: Opcao[] = [
  { value: 1, label: "Até seis meses" },
  { value: 2, label: "Entre seis meses e um ano" },
  { value: 3, label: "Entre um e dois anos" },
  { value: 4, label: "Entre dois e cinco anos" },
  { value: 5, label: "Entre cinco e dez anos" },
  { value: 6, label: "Mais de dez anos" },
];

// 2.06 — "não sabe" (10) e "não respondeu" (11) são exclusivos
export const MOTIVOS_RUA: Opcao[] = [
  { value: 1, label: "Perda de moradia" },
  { value: 2, label: "Ameaça/violência" },
  { value: 3, label: "Problemas com familiares/companheiro(a)" },
  { value: 4, label: "Alcoolismo/drogas" },
  { value: 5, label: "Desemprego" },
  { value: 6, label: "Trabalho" },
  { value: 7, label: "Tratamento de saúde" },
  { value: 8, label: "Preferência/opção própria" },
  { value: 9, label: "Outro" },
  { value: 10, label: "Não sabe/não lembra" },
  { value: 11, label: "Não respondeu" },
];

// 2.09
export const CONTATO_PARENTE: Opcao[] = [
  { value: 1, label: "Todo dia" },
  { value: 2, label: "Toda semana" },
  { value: 3, label: "Todo mês" },
  { value: 4, label: "Todo ano" },
  { value: 5, label: "Quase nunca" },
  { value: 6, label: "Nunca" },
];

// 2.10 — 5 e 6 são exclusivos
export const ATIVIDADES_COMUNITARIAS: Opcao[] = [
  { value: 1, label: "Escola" },
  { value: 2, label: "Associação" },
  { value: 3, label: "Cooperativa" },
  { value: 4, label: "Movimento social" },
  { value: 5, label: "Não sabe/não lembra" },
  { value: 6, label: "Não respondeu" },
];

// 2.11 — 7 ("nenhum") é exclusivo
export const LOCAIS_ATENDIMENTO: Opcao[] = [
  { value: 1, label: "CRAS" },
  { value: 2, label: "CREAS" },
  { value: 3, label: "Centro de referência para população em situação de rua" },
  { value: 4, label: "Instituição de acolhimento governamental (albergue/abrigo/outro)" },
  { value: 5, label: "Instituição de acolhimento não governamental (beneficente privada/outro)" },
  { value: 6, label: "Hospital/clínica geral" },
  { value: 7, label: "Nenhum" },
];

// 2.13 — 9 ("não respondeu") é exclusivo
export const ATIVIDADES_RENDA: Opcao[] = [
  { value: 1, label: "Construção civil" },
  { value: 2, label: "Guardador de carro/flanelinha" },
  { value: 3, label: "Carregador/estivador" },
  { value: 4, label: "Catador de material reciclável" },
  { value: 5, label: "Serviços gerais/limpeza/outro" },
  { value: 6, label: "Pede dinheiro" },
  { value: 7, label: "Vendas" },
  { value: 8, label: "Outro" },
  { value: 9, label: "Não respondeu" },
];

export const EXCLUSIVOS = {
  motivos: [10, 11],
  atividades_comunitarias: [5, 6],
  atendimentos_6m: [7],
  atividades_renda: [9],
} as const;

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export function rotulo(opcoes: Opcao[], valor: number | null | undefined) {
  return opcoes.find((o) => o.value === valor)?.label ?? null;
}

export function rotulos(opcoes: Opcao[], valores: number[] | null | undefined) {
  return (valores ?? []).map((v) => rotulo(opcoes, v)).filter(Boolean) as string[];
}
