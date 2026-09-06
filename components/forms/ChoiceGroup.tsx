"use client";

export interface ChoiceOption {
  value: string;
  label: string;
}

export function ChoiceGroup({
  options,
  value,
  onChange,
  multiple = false,
}: {
  options: ChoiceOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
}) {
  function handleClick(optionValue: string) {
    if (multiple) {
      onChange(
        value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue]
      );
    } else {
      onChange([optionValue]);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleClick(option.value)}
            aria-pressed={selected}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              selected
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
