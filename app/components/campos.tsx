import { useState, type ReactNode } from "react";
import type { Opcao } from "~/utils/formulario-suplementar2";
import { IconeAlerta } from "./Alerta";

export function Erro({ id, mensagem }: { id: string; mensagem?: string }) {
  if (!mensagem) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-sm text-sinal-700 dark:text-sinal-500">
      <IconeAlerta tipo="erro" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{mensagem}</span>
    </p>
  );
}

export function Rotulo({ children, obrigatorio }: { children: ReactNode; obrigatorio?: boolean }) {
  return (
    <>
      {children}
      {obrigatorio && (
        <>
          <span aria-hidden="true" className="text-sinal-700 dark:text-sinal-500"> *</span>
          <span className="sr-only"> (obrigatório)</span>
        </>
      )}
    </>
  );
}

// Agrupa campos curtos lado a lado a partir de 640 px.
export function Linha({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

interface CampoProps {
  label: string;
  name: string;
  erro?: string;
  dica?: string;
  type?: string;
  obrigatorio?: boolean;
  textarea?: boolean;
  mascara?: (valor: string) => string;
  inputMode?: "numeric" | "tel" | "text";
  maxLength?: number;
  autoComplete?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  defaultValue?: string;
}

export function Campo({
  label, name, erro, dica, type = "text", obrigatorio, textarea, mascara, inputMode, maxLength,
  autoComplete = "off", placeholder, min, max, defaultValue,
}: CampoProps) {
  const comum = {
    name,
    id: name,
    defaultValue,
    maxLength,
    placeholder,
    autoComplete,
    "aria-required": obrigatorio || undefined,
    "aria-invalid": erro ? true : undefined,
    "aria-describedby": erro ? `${name}-erro` : dica ? `${name}-dica` : undefined,
    className: "campo",
  };
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        <Rotulo obrigatorio={obrigatorio}>{label}</Rotulo>
      </label>
      {textarea ? (
        <textarea {...comum} rows={3} />
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
        <p id={`${name}-dica`} className="mt-1.5 text-xs text-gray-600 dark:text-gray-300">
          {dica}
        </p>
      )}
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}

// Senha com botão de mostrar/ocultar (o botão é focável e anuncia o estado para leitores de tela).
export function CampoSenha({
  label, name, erro, autoComplete = "current-password", autoFocus,
}: { label: string; name: string; erro?: string; autoComplete?: string; autoFocus?: boolean }) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        <Rotulo obrigatorio>{label}</Rotulo>
      </label>
      <div className="flex">
        <input
          id={name}
          name={name}
          type={visivel ? "text" : "password"}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          autoCapitalize="none"
          spellCheck={false}
          aria-required
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${name}-erro` : undefined}
          className="campo min-w-0 flex-1"
        />
        <button
          type="button"
          aria-pressed={visivel}
          onClick={() => setVisivel((v) => !v)}
          className="min-h-11 shrink-0 border border-l-0 border-gray-500 px-3 font-mono text-xs font-medium uppercase tracking-[0.12em] hover:bg-gray-100 dark:border-gray-500 dark:hover:bg-gray-800"
        >
          {visivel ? "Ocultar" : "Mostrar"}
          <span className="sr-only"> senha</span>
        </button>
      </div>
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}

export function Selecao({
  label, name, erro, opcoes, obrigatorio, vazio = "Selecione", defaultValue = "",
}: {
  label: string;
  name: string;
  erro?: string;
  opcoes: readonly (string | Opcao)[];
  obrigatorio?: boolean;
  vazio?: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold">
        <Rotulo obrigatorio={obrigatorio}>{label}</Rotulo>
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-required={obrigatorio || undefined}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${name}-erro` : undefined}
        className="campo"
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
  legenda, name, opcoes, tipo, erro, dica, defaultValue, obrigatorio,
}: {
  legenda: ReactNode;
  name: string;
  opcoes: Opcao[];
  tipo: "radio" | "checkbox";
  erro?: string;
  dica?: string;
  defaultValue?: string;
  obrigatorio?: boolean;
}) {
  return (
    <fieldset aria-describedby={erro ? `${name}-erro` : undefined} className="space-y-2">
      <legend className="mb-1 text-sm font-semibold">
        <Rotulo obrigatorio={obrigatorio}>{legenda}</Rotulo>
      </legend>
      {dica && <p className="text-xs text-gray-600 dark:text-gray-300">{dica}</p>}
      <div className="grid gap-2 sm:grid-cols-2">
        {opcoes.map((o) => (
          <label key={o.value} className="opcao">
            <input
              type={tipo}
              name={name}
              value={o.value}
              defaultChecked={defaultValue === String(o.value)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-sinal-500"
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <Erro id={`${name}-erro`} mensagem={erro} />
    </fieldset>
  );
}

export function Marca({
  label, name, erro, obrigatorio,
}: { label: string; name: string; erro?: string; obrigatorio?: boolean }) {
  return (
    <div>
      <label className="opcao">
        <input
          type="checkbox"
          name={name}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? `${name}-erro` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-sinal-500"
        />
        <span>
          <Rotulo obrigatorio={obrigatorio}>{label}</Rotulo>
        </span>
      </label>
      <Erro id={`${name}-erro`} mensagem={erro} />
    </div>
  );
}
