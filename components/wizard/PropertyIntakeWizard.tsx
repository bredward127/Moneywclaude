"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/forms/ProgressSteps";
import { SuccessPanel } from "@/components/forms/SuccessPanel";
import { useSpeechRecognition, useSpeechSynthesis } from "@/lib/wizard-speech";
import { VoiceControlBar } from "./VoiceControlBar";
import { AudioOptInPrompt } from "./AudioOptInPrompt";
import { ReviewStep } from "./ReviewStep";
import {
  buildSellerSteps,
  buildSellerReviewSections,
  INITIAL_SELLER_DATA,
  INITIAL_PHOTO_STATE,
  type SellerData,
  type PhotoStepState,
} from "./sellerSteps";
import {
  buildBuyerSteps,
  buildBuyerReviewSections,
  INITIAL_BUYER_DATA,
  type BuyerData,
} from "./buyerSteps";

type Status = "idle" | "submitting" | "success" | "error";

function idToLabel(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function PropertyIntakeWizard({ mode }: { mode: "seller" | "buyer" }) {
  const [sellerData, setSellerData] = useState<SellerData>(INITIAL_SELLER_DATA);
  const [buyerData, setBuyerData] = useState<BuyerData>(INITIAL_BUYER_DATA);
  const [photoState, setPhotoState] = useState<PhotoStepState>(INITIAL_PHOTO_STATE);
  const [currentStep, setCurrentStep] = useState(0);
  const [visitId, setVisitId] = useState(0);
  const [cameFromReview, setCameFromReview] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [hasChosenAudio, setHasChosenAudio] = useState(false);

  const recognition = useSpeechRecognition();
  const synthesis = useSpeechSynthesis();

  function handleAudioChoice(wantsAudio: boolean) {
    synthesis.setMuted(!wantsAudio);
    setHasChosenAudio(true);
  }

  function updateSeller<K extends keyof SellerData>(key: K, value: SellerData[K]) {
    setSellerData((prev) => ({ ...prev, [key]: value }));
  }
  function updateBuyer<K extends keyof BuyerData>(key: K, value: BuyerData[K]) {
    setBuyerData((prev) => ({ ...prev, [key]: value }));
  }

  const handlePhotoLeadCreated = useCallback((leadId: string) => {
    setPhotoState((prev) => (prev.leadId === leadId ? prev : { ...prev, leadId }));
  }, []);
  const handlePhotoChoiceChange = useCallback((choice: "now" | "later") => {
    setPhotoState((prev) => (prev.choice === choice ? prev : { ...prev, choice }));
  }, []);
  const handlePhotoCountChange = useCallback((photoCount: number) => {
    setPhotoState((prev) => (prev.photoCount === photoCount ? prev : { ...prev, photoCount }));
  }, []);

  const steps =
    mode === "seller"
      ? buildSellerSteps({
          data: sellerData,
          update: updateSeller,
          photoState,
          onPhotoLeadCreated: handlePhotoLeadCreated,
          onPhotoChoiceChange: handlePhotoChoiceChange,
          onPhotoCountChange: handlePhotoCountChange,
        })
      : buildBuyerSteps({ data: buyerData, update: updateBuyer });

  const isReview = currentStep >= steps.length;
  const activeStep = isReview ? null : steps[currentStep];
  const consent = mode === "seller" ? sellerData.consent : buyerData.consent;
  const marketingOptIn = mode === "seller" ? sellerData.marketingOptIn : buyerData.marketingOptIn;

  const reviewVoicePrompt =
    "Here's a summary of what you told us. Review it, and submit when you're ready.";

  useEffect(() => {
    synthesis.speak(isReview ? reviewVoicePrompt : (steps[currentStep]?.voicePrompt ?? ""));
    return () => synthesis.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, mode]);

  function handleContinue() {
    recognition.reset();
    setVisitId((v) => v + 1);
    if (cameFromReview) {
      setCameFromReview(false);
      setCurrentStep(steps.length);
    } else {
      setCurrentStep((s) => s + 1);
    }
  }

  function handleBack() {
    recognition.reset();
    setVisitId((v) => v + 1);
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function handleEdit(stepIndex: number) {
    recognition.reset();
    setVisitId((v) => v + 1);
    setCameFromReview(true);
    setCurrentStep(stepIndex);
  }

  function handleApplyTranscript(text: string) {
    activeStep?.applyTranscript?.(text);
    recognition.reset();
  }

  async function handleSubmit() {
    if (!consent) return;
    setStatus("submitting");
    try {
      const payload =
        mode === "seller"
          ? { type: "seller", leadId: photoState.leadId, ...sellerData }
          : { type: "buyer", ...buyerData };
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <SuccessPanel
          title={
            mode === "seller"
              ? "Thanks — we've got your details"
              : "Thanks — we've got your criteria"
          }
          description="A member of our team will review what you shared and reach out using your preferred contact method, usually within one business day."
        />
      </div>
    );
  }

  const progressLabels = [...steps.map((step) => idToLabel(step.id)), "Review"];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <ProgressSteps steps={progressLabels} currentStep={currentStep} />

      <div className="mt-8">
        {!isReview && currentStep === 0 && !hasChosenAudio && synthesis.isSupported && (
          <AudioOptInPrompt onChoose={handleAudioChoice} />
        )}

        {isReview || !activeStep ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Review your answers</h2>
                <p className="mt-1 text-slate-600">
                  Everything looks right? Submit below, or edit any answer above.
                </p>
              </div>
              <VoicePromptControls synthesis={synthesis} prompt={reviewVoicePrompt} />
            </div>

            <div className="mt-6">
              <ReviewStep
                sections={
                  mode === "seller"
                    ? buildSellerReviewSections(sellerData, photoState)
                    : buildBuyerReviewSections(buyerData)
                }
                onEdit={handleEdit}
                consent={consent}
                onConsentChange={(v) =>
                  mode === "seller" ? updateSeller("consent", v) : updateBuyer("consent", v)
                }
                marketingOptIn={marketingOptIn}
                onMarketingOptInChange={(v) =>
                  mode === "seller"
                    ? updateSeller("marketingOptIn", v)
                    : updateBuyer("marketingOptIn", v)
                }
                consentLabel={
                  mode === "seller"
                    ? "I understand my property details will be reviewed by a real person before anyone reaches out."
                    : "I understand my buying criteria will be reviewed by a real person before anyone reaches out."
                }
                status={status}
                onSubmit={handleSubmit}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{activeStep.title}</h2>
                {activeStep.subtitle && (
                  <p className="mt-1 text-slate-600">{activeStep.subtitle}</p>
                )}
              </div>
              <VoicePromptControls synthesis={synthesis} prompt={activeStep.voicePrompt} />
            </div>

            {activeStep.allowVoiceInput && activeStep.applyTranscript && (
              <div className="mt-6">
                <VoiceControlBar
                  key={visitId}
                  isSupported={recognition.isSupported}
                  isListening={recognition.isListening}
                  transcript={recognition.transcript}
                  permissionDenied={recognition.permissionDenied}
                  onStart={recognition.start}
                  onStop={recognition.stop}
                  onApply={handleApplyTranscript}
                  previewMatch={activeStep.previewMatch}
                  placeholder={activeStep.voicePlaceholder}
                />
              </div>
            )}

            <div className="mt-6">{activeStep.content}</div>
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
        {currentStep > 0 ? (
          <Button
            type="button"
            variant="ghost"
            icon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}
            iconPosition="left"
            onClick={handleBack}
          >
            Back
          </Button>
        ) : (
          <span />
        )}

        {!isReview && activeStep && (
          <Button
            type="button"
            disabled={!activeStep.canProceed}
            icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            onClick={handleContinue}
          >
            {cameFromReview ? "Save & Return to Review" : "Continue"}
          </Button>
        )}
      </div>
    </div>
  );
}

function VoicePromptControls({
  synthesis,
  prompt,
}: {
  synthesis: ReturnType<typeof useSpeechSynthesis>;
  prompt: string;
}) {
  if (!synthesis.isSupported) return null;

  return (
    <div className="flex shrink-0 items-center gap-3">
      <button
        type="button"
        onClick={() => synthesis.speak(prompt, { force: true })}
        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
      >
        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
        Replay
      </button>
      <button
        type="button"
        onClick={synthesis.toggleMuted}
        aria-pressed={synthesis.isMuted}
        aria-label={synthesis.isMuted ? "Unmute voice prompts" : "Mute voice prompts"}
        className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        {synthesis.isMuted ? (
          <VolumeX className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
