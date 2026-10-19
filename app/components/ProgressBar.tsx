// Indicador de etapas no estilo Stripe: títulos com sublinhado de progresso a partir de 640 px;
// no celular, texto "Etapa X de N" e barra contínua.
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
        <div className="mb-2 flex justify-between text-sm text-gray-700 dark:text-gray-200">
          <span>
            Etapa {step} de {totalSteps}
          </span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-2 rounded-full bg-emerald-700 transition-all" style={{ width: `${percent}%` }} />
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
                  ? "border-gray-300 text-gray-600 dark:border-gray-700 dark:text-gray-300"
                  : "border-emerald-700 font-medium text-gray-900 dark:text-gray-100"
              }`}
            >
              <span className="block text-[11px] uppercase tracking-wide text-gray-600 dark:text-gray-300">
                {estado === "feita" ? "Concluída" : `Etapa ${n}`}
              </span>
              {titulo}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
