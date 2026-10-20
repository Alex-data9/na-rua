import { STATUS_ROTULO } from "~/utils/status";
import type { StatusAcompanhamento } from "~/utils/supabase.types";

// "Novo" ganha o bloco vermelho; os demais, contorno. O texto sempre diz o status (não depende só da cor).
export function StatusEtiqueta({ status }: { status: StatusAcompanhamento }) {
  return (
    <span
      className={`inline-flex items-center gap-2 justify-self-start px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.1em] uppercase ${
        status === "novo" ? "bg-sinal-500 text-tinta" : "border border-tinta dark:border-gray-400"
      }`}
    >
      {STATUS_ROTULO[status]}
    </span>
  );
}
