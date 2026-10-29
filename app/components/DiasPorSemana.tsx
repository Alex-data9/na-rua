import { useState } from "react";
import { LOCAIS_DORMIR } from "~/utils/formulario-suplementar2";
import { Erro, Rotulo } from "./campos";

const MAXIMO_DIAS = 7;

// Questão 2.04: dias por semana em cada local (soma máxima 7), com total em tempo real.
// A chave de erro "dorme_dias" é a mesma usada por validarCadastro.
export function DiasPorSemana({ erro }: { erro?: string }) {
  const [dias, setDias] = useState<Record<string, string>>({});
  const soma = LOCAIS_DORMIR.reduce((acc, l) => acc + (Number(dias[l.campo]) || 0), 0);

  return (
    <fieldset aria-describedby={erro ? "dorme_dias-erro" : undefined}>
      <legend className="mb-1 text-sm font-semibold">
        <Rotulo obrigatorio>2.04 Onde costuma dormir? Quantas vezes por semana?</Rotulo>
      </legend>
      <p className="mb-3 text-xs text-gray-600 dark:text-gray-300">
        Preencha os locais que se aplicam; a soma pode ser no máximo {MAXIMO_DIAS}.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LOCAIS_DORMIR.map((l) => (
          <label key={l.campo} className="text-sm">
            <span className="mb-1.5 block">{l.value} - {l.label}</span>
            <input
              type="number" name={l.campo} min={0} max={MAXIMO_DIAS} inputMode="numeric"
              value={dias[l.campo] ?? ""}
              aria-invalid={erro ? true : undefined}
              onChange={(e) => setDias((d) => ({ ...d, [l.campo]: e.target.value }))}
              className="campo"
            />
          </label>
        ))}
      </div>
      <p className={`mt-2 text-sm ${soma > MAXIMO_DIAS ? "text-sinal-700 dark:text-sinal-300" : "text-gray-600 dark:text-gray-300"}`}>
        Total: {soma} de {MAXIMO_DIAS} dias
      </p>
      <Erro id="dorme_dias-erro" mensagem={erro} />
    </fieldset>
  );
}
