import { ImageOff } from "lucide-react";
import { listLeadPhotosForStaff } from "@/app/actions/photos";
import { PHOTO_CATEGORIES } from "@/lib/photo-categories";

function categoryLabel(value: string): string {
  return PHOTO_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export async function PhotoGallery({ leadId }: { leadId: string }) {
  const photos = await listLeadPhotosForStaff(leadId);

  if (photos.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
        <ImageOff className="h-4 w-4" aria-hidden="true" />
        No photos uploaded for this lead yet.
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo) => (
        <li key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          {photo.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- private, short-lived signed URL
            <img
              src={photo.url}
              alt={`${categoryLabel(photo.category)} photo`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
              Preview unavailable
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-2 pt-4 pb-1.5">
            <p className="truncate text-[11px] font-medium text-white">{categoryLabel(photo.category)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
