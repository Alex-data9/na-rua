import type { StatusAcompanhamento } from "./supabase.types";

export const STATUS_ROTULO: Record<StatusAcompanhamento, string> = {
  novo: "Novo",
  em_acompanhamento: "Em acompanhamento",
  busca_familiar: "Busca familiar",
  vinculado_a_servico: "Vinculado a serviço",
};

export const STATUS_OPCOES = Object.keys(STATUS_ROTULO) as StatusAcompanhamento[];
