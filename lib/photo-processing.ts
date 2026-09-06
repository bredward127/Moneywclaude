export const MAX_PHOTOS = 10;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.82;

export interface ProcessedPhoto {
  blob: Blob;
  filename: string;
  mimeType: string;
}

function fileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function isHeic(file: File): boolean {
  if (file.type === "image/heic" || file.type === "image/heif") return true;
  const ext = fileExtension(file.name);
  return ext === "heic" || ext === "heif";
}

export function isAcceptedPhotoType(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  // Some browsers/OSes report an empty MIME type for HEIC files.
  const ext = fileExtension(file.name);
  return ext === "heic" || ext === "heif" || ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp";
}

function replaceExtension(filename: string, newExt: string): string {
  const dot = filename.lastIndexOf(".");
  const base = dot === -1 ? filename : filename.slice(0, dot);
  return `${base}.${newExt}`;
}

export function validatePhotoSelection(
  files: File[],
  existingCount: number
): { accepted: File[]; errors: string[] } {
  const errors: string[] = [];
  const accepted: File[] = [];
  let remainingSlots = MAX_PHOTOS - existingCount;

  for (const file of files) {
    if (remainingSlots <= 0) {
      errors.push(`"${file.name}" was skipped — you can add up to ${MAX_PHOTOS} photos.`);
      continue;
    }
    if (!isAcceptedPhotoType(file)) {
      errors.push(`"${file.name}" isn't a supported image type.`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      errors.push(`"${file.name}" is over the 10MB limit.`);
      continue;
    }
    accepted.push(file);
    remainingSlots--;
  }

  return { accepted, errors };
}

async function drawToCompressedJpeg(bitmap: ImageBitmap): Promise<Blob> {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is not available in this browser.");

  ctx.scale(scale, scale);
  ctx.drawImage(bitmap, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode compressed image."))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/**
 * Normalizes any accepted photo (JPEG/PNG/WebP/HEIC/HEIF) into a compressed,
 * upright JPEG ready to upload: HEIC/HEIF is transcoded first, then every
 * image is redrawn onto a canvas at a capped resolution. EXIF orientation is
 * intentionally left to the browser's own decoder — `createImageBitmap`
 * auto-rotates to the upright orientation during decode, so `bitmap.width`/
 * `bitmap.height` are already the correct, display-ready dimensions; adding
 * a manual EXIF-based rotation on top would rotate an already-upright image
 * a second time.
 */
export async function processPhotoFile(file: File): Promise<ProcessedPhoto> {
  let sourceBlob: Blob = file;

  if (isHeic(file)) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
    sourceBlob = Array.isArray(converted) ? converted[0] : converted;
  }

  const bitmap = await createImageBitmap(sourceBlob);
  try {
    const blob = await drawToCompressedJpeg(bitmap);
    return {
      blob,
      filename: replaceExtension(file.name, "jpg"),
      mimeType: "image/jpeg",
    };
  } finally {
    bitmap.close();
  }
}
