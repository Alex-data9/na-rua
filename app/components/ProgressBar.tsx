export function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const percent = Math.round((step / totalSteps) * 100);
  return (
    <div className="w-full" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
        <span>
          Etapa {step} de {totalSteps}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-800">
        <div
          className="h-2 rounded-full bg-emerald-600 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
