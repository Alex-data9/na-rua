import type { ButtonHTMLAttributes } from "react";

export type VarianteBotao = "primario" | "secundario" | "destaque" | "poste";

// Também serve para <Link>: <Link className={classeBotao("primario")}>.
export const classeBotao = (variante: VarianteBotao = "primario", extra = "") =>
  `btn btn-${variante} ${extra}`.trim();

// Seta de direção usada em botões e links ("seguir").
export function Seta({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25"
      strokeLinecap="square" className={className}>
      <path d="M4 12h15m-6-6 6 6-6 6" />
    </svg>
  );
}

export function Spinner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBotao;
  carregando?: boolean;
  textoCarregando?: string;
}

// Botão com estado de carregamento; enquanto carrega fica desabilitado (evita envios duplicados).
export function Botao({
  variante = "primario", carregando, textoCarregando, children, className = "", disabled, type = "button", ...resto
}: BotaoProps) {
  return (
    <button
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={classeBotao(variante, className)}
      {...resto}
    >
      {carregando && <Spinner />}
      {carregando && textoCarregando ? textoCarregando : children}
    </button>
  );
}
