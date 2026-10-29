import { doisDigitos } from "~/utils/numeros";
// Progresso do cadastro como linha de metrô: estações numeradas ligadas por uma linha âmbar que avança com a etapa.
// Estação concluída ganha o "carimbo" verde com ✓. No celular, só os números; os nomes aparecem a partir de 640 px.
export function ProgressBar({ step, totalSteps, titulos }: { step: number; totalSteps: number; titulos: string[] }) {
  const fracao = totalSteps > 1 ? (step - 1) / (totalSteps - 1) : 1;
  const meiaColuna = `calc(100% / ${totalSteps * 2})`;

  return (
    <div>
      <div
        role="progressbar"
        aria-label="Progresso do cadastro"
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-valuenow={step}
        aria-valuetext={`Etapa ${step} de ${totalSteps}: ${titulos[step - 1]}`}
        className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-mono text-xs font-semibold tracking-[0.12em] uppercase text-asfalto-600 dark:text-asfalto-200"
      >
        <span>
          Etapa {doisDigitos(step)} / {doisDigitos(totalSteps)}
        </span>
        <span>
          {step < totalSteps ? (
            <>
              Próxima parada: <span className="text-tinta dark:text-white">{titulos[step]}</span>
            </>
          ) : (
            "Última parada"
          )}
        </span>
      </div>

      <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${totalSteps}, minmax(0, 1fr))` }}>
        <span
          aria-hidden="true"
          className="absolute top-[15px] h-1.5 rounded-full bg-linha dark:bg-asfalto-800"
          style={{ left: meiaColuna, right: meiaColuna }}
        />
        <span
          aria-hidden="true"
          className="absolute top-[15px] h-1.5 rounded-full bg-poste-500 transition-[width] duration-500 ease-out"
          style={{ left: meiaColuna, width: `calc((100% - 100% / ${totalSteps}) * ${fracao})` }}
        />
        {titulos.map((titulo, i) => {
          const n = i + 1;
          const estado = n < step ? "feita" : n === step ? "atual" : "pendente";
          return (
            <li
              key={titulo}
              aria-current={estado === "atual" ? "step" : undefined}
              className="relative flex flex-col items-center gap-2 px-1 text-center"
            >
              <span
                className={`relative z-10 grid h-9 w-9 place-items-center rounded-full font-mono text-xs font-bold ${
                  estado === "feita"
                    ? "carimbo-estacao bg-placa-600 text-white"
                    : estado === "atual"
                      ? "bg-tinta text-white ring-4 ring-poste-400/70 dark:bg-poste-400 dark:text-tinta"
                      : "border-2 border-asfalto-400 bg-caderno text-asfalto-600 dark:border-asfalto-600 dark:bg-noite-campo dark:text-asfalto-200"
                }`}
              >
                {estado === "feita" ? (
                  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="m3 8.5 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  doisDigitos(n)
                )}
              </span>
              <span
                className={`hidden text-xs leading-tight sm:block ${
                  estado === "pendente" ? "text-asfalto-600 dark:text-asfalto-400" : "font-semibold text-tinta dark:text-white"
                }`}
              >
                {titulo}
                {estado === "feita" && <span className="sr-only"> (concluída)</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
