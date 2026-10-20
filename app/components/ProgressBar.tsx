const dois = (n: number) => String(n).padStart(2, "0");

// Indicador de etapas: barra contínua em vermelho-sinal e, a partir de 640 px, as etapas numeradas (01–05)
// com régua superior; no celular, só "Etapa X de N" e a barra.
export function ProgressBar({ step, totalSteps, titulos }: { step: number; totalSteps: number; titulos: string[] }) {
  const percent = Math.round((step / totalSteps) * 100);
  return (
    <div>
      <div
        role="progressbar"
        aria-label="Progresso do cadastro"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={step}
        aria-valuetext={`Etapa ${step} de ${totalSteps}: ${titulos[step - 1]}`}
      >
        <div className="mb-2 flex justify-between font-mono text-xs font-medium tracking-[0.12em] uppercase text-gray-700 dark:text-gray-300">
          <span>
            Etapa {dois(step)} / {dois(totalSteps)}
          </span>
          <span>{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-linha dark:bg-gray-800">
          <div className="h-1.5 bg-sinal-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <ol className="mt-4 hidden gap-3 sm:grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
        {titulos.map((titulo, i) => {
          const n = i + 1;
          const estado = n < step ? "feita" : n === step ? "atual" : "pendente";
          return (
            <li
              key={titulo}
              aria-current={estado === "atual" ? "step" : undefined}
              className={`border-t-2 pt-2 text-xs leading-tight ${
                estado === "pendente"
                  ? "border-linha text-gray-600 dark:border-gray-700 dark:text-gray-400"
                  : estado === "atual"
                    ? "border-sinal-500 font-semibold text-tinta dark:text-white"
                    : "border-tinta font-medium text-tinta dark:border-gray-300 dark:text-gray-100"
              }`}
            >
              <span className="mb-0.5 block font-mono text-[11px] tracking-[0.12em] uppercase text-gray-600 dark:text-gray-400">
                {estado === "feita" ? "✓ Feita" : dois(n)}
              </span>
              {titulo}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
