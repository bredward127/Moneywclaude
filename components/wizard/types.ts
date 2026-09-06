import type { ReactNode } from "react";

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  voicePrompt: string;
  voicePlaceholder?: string;
  allowVoiceInput: boolean;
  applyTranscript?: (transcript: string) => void;
  previewMatch?: (transcript: string) => string | null;
  canProceed: boolean;
  content: ReactNode;
}

export interface ReviewItem {
  label: string;
  value: string;
  stepIndex: number;
}

export interface ReviewSection {
  title: string;
  items: ReviewItem[];
}
