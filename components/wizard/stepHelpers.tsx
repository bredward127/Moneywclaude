import { ChoiceGroup, type ChoiceOption } from "@/components/forms/ChoiceGroup";
import { matchChoice } from "@/lib/wizard-match";
import type { WizardStep } from "./types";

export function labelFor(options: ChoiceOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? "";
}

export function choiceStep({
  id,
  title,
  subtitle,
  voicePrompt,
  voicePlaceholder,
  options,
  value,
  onChange,
}: {
  id: string;
  title: string;
  subtitle?: string;
  voicePrompt: string;
  voicePlaceholder: string;
  options: ChoiceOption[];
  value: string;
  onChange: (value: string) => void;
}): WizardStep {
  return {
    id,
    title,
    subtitle,
    voicePrompt,
    voicePlaceholder,
    allowVoiceInput: true,
    applyTranscript: (transcript) => {
      const match = matchChoice(transcript, options);
      if (match) onChange(match);
    },
    previewMatch: (transcript) => {
      const match = matchChoice(transcript, options);
      return match ? labelFor(options, match) : null;
    },
    canProceed: value !== "",
    content: (
      <ChoiceGroup
        options={options}
        value={value ? [value] : []}
        onChange={(v) => onChange(v[0] ?? "")}
      />
    ),
  };
}
