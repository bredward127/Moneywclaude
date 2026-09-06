export function ProgressSteps({
  steps,
  currentStep,
}: {
  steps: string[];
  currentStep: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-500">
        <span>
          Step {currentStep + 1} of {steps.length}
        </span>
        <span className="text-blue-600">{steps[currentStep]}</span>
      </div>
      <div className="flex gap-1.5">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              index <= currentStep ? "bg-blue-600" : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
