"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { ChoiceGroup } from "@/components/forms/ChoiceGroup";
import { PHOTO_CATEGORIES } from "@/lib/photo-categories";
import { MAX_PHOTOS, processPhotoFile, validatePhotoSelection } from "@/lib/photo-processing";
import { confirmUpload, createUploadTicket, deletePhoto, listLeadPhotos } from "@/app/actions/photos";
import { getSupabaseBrowserClient, PROPERTY_PHOTOS_BUCKET } from "@/lib/supabase/client";

interface UploadItem {
  id: string;
  filename: string;
  category: string;
  previewUrl: string | null;
  status: "processing" | "uploading" | "done" | "error";
  errorMessage?: string;
  mediaId?: string;
  path?: string;
}

function categoryLabel(value: string): string {
  return PHOTO_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function PhotoDropzone({
  leadId,
  onPhotoCountChange,
}: {
  leadId: string;
  onPhotoCountChange: (count: number) => void;
}) {
  const [category, setCategory] = useState<string>(PHOTO_CATEGORIES[0].value);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [selectionErrors, setSelectionErrors] = useState<string[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    listLeadPhotos(leadId)
      .then((photos) => {
        if (cancelled) return;
        setItems(
          photos.map((photo) => ({
            id: photo.id,
            filename: photo.originalFilename,
            category: photo.category,
            previewUrl: photo.url,
            status: "done",
            mediaId: photo.id,
            path: photo.path,
          }))
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoadingExisting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  useEffect(() => {
    onPhotoCountChange(items.filter((item) => item.status !== "error").length);
  }, [items, onPhotoCountChange]);

  const doneCount = items.filter((item) => item.status !== "error").length;

  const uploadOne = useCallback(
    async (id: string, file: File, itemCategory: string) => {
      try {
        const processed = await processPhotoFile(file);
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "uploading" } : i)));

        const ticket = await createUploadTicket({
          leadId,
          category: itemCategory,
          filename: processed.filename,
          fileSize: processed.blob.size,
        });
        if (!ticket.ok) throw new Error(ticket.error);

        const supabase = getSupabaseBrowserClient();
        const { error: uploadError } = await supabase.storage
          .from(PROPERTY_PHOTOS_BUCKET)
          .uploadToSignedUrl(ticket.path, ticket.token, processed.blob, {
            contentType: processed.mimeType,
          });
        if (uploadError) throw uploadError;

        const confirmed = await confirmUpload({
          leadId,
          path: ticket.path,
          category: itemCategory,
          originalFilename: file.name,
          mimeType: processed.mimeType,
          fileSize: processed.blob.size,
        });
        if (!confirmed.ok) throw new Error(confirmed.error);

        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "done",
                  mediaId: confirmed.id,
                  path: ticket.path,
                  previewUrl: confirmed.url ?? i.previewUrl,
                }
              : i
          )
        );
      } catch (err) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? {
                  ...i,
                  status: "error",
                  errorMessage: err instanceof Error ? err.message : "Upload failed.",
                }
              : i
          )
        );
      }
    },
    [leadId]
  );

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      const files = Array.from(fileList);
      const { accepted, errors } = validatePhotoSelection(files, doneCount);
      setSelectionErrors(errors);

      for (const file of accepted) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setItems((prev) => [
          ...prev,
          {
            id,
            filename: file.name,
            category,
            previewUrl: URL.createObjectURL(file),
            status: "processing",
          },
        ]);
        void uploadOne(id, file, category);
      }
    },
    [category, doneCount, uploadOne]
  );

  async function handleRemove(item: UploadItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (item.mediaId && item.path) {
      await deletePhoto({ mediaId: item.mediaId, path: item.path });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1.5 block text-sm font-medium text-slate-700">
          What&apos;s this photo of?
        </p>
        <ChoiceGroup
          options={PHOTO_CATEGORIES}
          value={[category]}
          onChange={(v) => setCategory(v[0] ?? PHOTO_CATEGORIES[0].value)}
        />
      </div>

      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={doneCount >= MAX_PHOTOS}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-6 w-6 text-slate-400" aria-hidden="true" />
          <span className="text-sm font-medium text-slate-700">
            Tap to add photos tagged{" "}
            <span className="text-blue-600">&ldquo;{categoryLabel(category)}&rdquo;</span>
          </span>
          <span className="text-xs text-slate-500">
            JPEG, PNG, WebP, or HEIC · up to 10MB each · {doneCount}/{MAX_PHOTOS} added
          </span>
        </button>
      </div>

      {selectionErrors.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {selectionErrors.map((message) => (
            <li key={message} className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {message}
            </li>
          ))}
        </ul>
      )}

      {isLoadingExisting ? (
        <p className="text-sm text-slate-500">Loading your photos…</p>
      ) : (
        items.length > 0 && (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
              >
                {item.previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element -- private, short-lived signed/blob URLs; next/image's remote optimizer doesn't apply here
                  <img
                    src={item.previewUrl}
                    alt={`${categoryLabel(item.category)} photo`}
                    className="h-full w-full object-cover"
                  />
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-4 pb-1.5">
                  <p className="truncate text-[11px] font-medium text-white">
                    {categoryLabel(item.category)}
                  </p>
                </div>

                {item.status !== "error" && (
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    aria-label={`Remove ${categoryLabel(item.category)} photo`}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}

                {(item.status === "processing" || item.status === "uploading") && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Loader2 className="h-5 w-5 animate-spin text-white" aria-hidden="true" />
                  </div>
                )}

                {item.status === "done" && (
                  <div className="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-white" aria-hidden="true" />
                  </div>
                )}

                {item.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-red-950/85 p-2 text-center">
                    <AlertCircle className="h-4 w-4 text-red-300" aria-hidden="true" />
                    <p className="text-[11px] text-red-100">{item.errorMessage}</p>
                    <button
                      type="button"
                      onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                      className="text-[11px] font-semibold text-white underline"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}
