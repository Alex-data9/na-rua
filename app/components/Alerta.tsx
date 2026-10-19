import type { ReactNode } from "react";

type Tipo = "erro" | "sucesso" | "info";

const ICONES: Record<Tipo, ReactNode> = {
  erro: <path d="M12 8v5m0 3.5h.01M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />,
  sucesso: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  info: <path d="M12 11v5m0-8.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
};

export function IconeAlerta({ tipo, className = "h-5 w-5 shrink-0" }: { tipo: Tipo; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className}>
      {ICONES[tipo]}
    </svg>
  );
}

// Erros usam role="alert" (anunciado na hora); sucesso e informação usam role="status".
export function Alerta({ tipo, children }: { tipo: Tipo; children: ReactNode }) {
  return (
    <div role={tipo === "erro" ? "alert" : "status"} className={`alerta alerta-${tipo}`}>
      <IconeAlerta tipo={tipo} />
      <div>{children}</div>
    </div>
  );
}
