import type { ReactNode } from "react";
import type { Opcao } from "~/utils/formulario-suplementar2";

const BASE = "w-full rounded border px-3 py-2";
const COM_ERRO = "border-red-500";

export function Erro({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-500">
      {mensagem}
    </p>
  );
}

interface CampoProps {
  label: string;
  name: string;
  erro?: string;
  dica?: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  mascara?: (valor: string) => string;
  inputMode?: "numeric" | "tel" | "text";
  maxLength?: number;
  autoComplete?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

export function Campo({
  label, name, erro, dica, type = "text", required, textarea, mascara, inputMode, maxLength,
  autoComplete = "off", placeholder, min, max,
}: CampoProps) {
  const comum = {
    name,
    id: name,
    required,
    maxLength,
    placeholder,
    autoComplete,
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": erro ? `${name}-erro` : dica ? `${name}-dica` : undefined,
    className: `${BASE} ${erro ? COM_ERRO : ""}`,
  };
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      {textarea ? (
        <textarea {...comum} />
      ) : (
        <input
          {...comum}
          type={type}
          inputMode={inputMode}
          min={min}
          max={max}
          onInput={mascara ? (e) => (e.currentTarget.value = mascara(e.currentTarget.value)) : undefined}
        />
      )}
      {dica && !erro && (
        <p id={`${name}-dica`} className="mt-1 text-xs text-gray-500">
          {dica}
        </p>
      )}
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}

export function Selecao({
  label, name, erro, opcoes, vazio = "Selecione", defaultValue = "",
}: {
  label: string;
  name: string;
  erro?: string;
  opcoes: readonly (string | Opcao)[];
  vazio?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${name}-erro` : undefined}
        className={`${BASE} ${erro ? COM_ERRO : ""}`}
      >
        <option value="">{vazio}</option>
        {opcoes.map((o) => {
          const v = typeof o === "string" ? o : String(o.value);
          return (
            <option key={v} value={v}>
              {typeof o === "string" ? o : o.label}
            </option>
          );
        })}
      </select>
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}

export function GrupoOpcoes({
  legenda, name, opcoes, tipo, erro, dica, defaultValue,
}: {
  legenda: ReactNode;
  name: string;
  opcoes: Opcao[];
  tipo: "radio" | "checkbox";
  erro?: string;
  dica?: string;
  defaultValue?: string;
}) {
  return (
    <fieldset aria-describedby={erro ? `${name}-erro` : undefined} className="space-y-1">
      <legend className="text-sm font-medium mb-1">{legenda}</legend>
      {dica && <p className="text-xs text-gray-500 mb-1">{dica}</p>}
      {opcoes.map((o) => (
        <label key={o.value} className="flex items-start gap-2 text-sm py-0.5">
          <input
            type={tipo}
            name={name}
            value={o.value}
            defaultChecked={defaultValue === String(o.value)}
            className="mt-1 h-4 w-4"
          />
          <span>{o.label}</span>
        </label>
      ))}
      <Erro id={`${name}-erro`} mensagem={erro} />
    </fieldset>
  );
}

export function Marca({ label, name, erro }: { label: string; name: string; erro?: string }) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name={name} className="mt-1 h-4 w-4" aria-invalid={erro ? true : undefined} />
        <span>{label}</span>
      </label>
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}
