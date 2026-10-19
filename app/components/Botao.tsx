import type { ButtonHTMLAttributes } from "react";

export type VarianteBotao = "primario" | "secundario";

// Também serve para <Link>: <Link className={classeBotao("primario")}>.
export const classeBotao = (variante: VarianteBotao = "primario", extra = "") =>
  `btn btn-${variante} ${extra}`.trim();

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
