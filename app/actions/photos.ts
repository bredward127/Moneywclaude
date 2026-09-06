"use server";

import { randomBytes } from "node:crypto";
import { getSupabaseServiceClient, PROPERTY_PHOTOS_BUCKET } from "@/lib/supabase/server";
import { isPhotoCategory } from "@/lib/photo-categories";
import { MAX_FILE_SIZE_BYTES } from "@/lib/photo-processing";
import { assertLeadAccessible } from "@/lib/dashboard/access";

const SIGNED_VIEW_URL_TTL_SECONDS = 15 * 60; // 15 minutes, per spec
const UPLOAD_LINK_VALIDITY_DAYS = 14;

export interface LeadPhoto {
  id: string;
  path: string;
  category: string;
  originalFilename: string;
  url: string | null;
}

function buildStoragePath(leadId: string, category: string, filename: string): string {
  const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
  const unique = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  return `${leadId}/${category}/${unique}-${safeName}`;
}

export async function createUploadTicket({
  leadId,
  category,
  filename,
  fileSize,
}: {
  leadId: string;
  category: string;
  filename: string;
  fileSize: number;
}): Promise<{ ok: true; path: string; token: string; signedUrl: string } | { ok: false; error: string }> {
  if (!leadId) return { ok: false, error: "Missing lead reference." };
  if (!isPhotoCategory(category)) return { ok: false, error: "Unknown photo category." };
  if (fileSize > MAX_FILE_SIZE_BYTES) return { ok: false, error: "Photo is over the 10MB limit." };

  const supabase = getSupabaseServiceClient();
  const path = buildStoragePath(leadId, category, filename);

  const { data, error } = await supabase.storage.from(PROPERTY_PHOTOS_BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    console.error("[photos] failed to create signed upload url", error);
    return { ok: false, error: "Could not start the upload. Please try again." };
  }

  return { ok: true, path, token: data.token, signedUrl: data.signedUrl };
}

export async function confirmUpload({
  leadId,
  path,
  category,
  originalFilename,
  mimeType,
  fileSize,
}: {
  leadId: string;
  path: string;
  category: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
}): Promise<{ ok: true; id: string; url: string | null } | { ok: false; error: string }> {
  if (!leadId || !path) return { ok: false, error: "Missing upload reference." };
  if (!isPhotoCategory(category)) return { ok: false, error: "Unknown photo category." };

  const supabase = getSupabaseServiceClient();

  const { data: row, error } = await supabase
    .from("lead_media")
    .insert({
      lead_id: leadId,
      file_path: path,
      category,
      original_filename: originalFilename,
      mime_type: mimeType,
      size_bytes: fileSize,
    })
    .select("id")
    .single();

  if (error || !row) {
    console.error("[photos] failed to record uploaded photo", error);
    return { ok: false, error: "Photo uploaded, but we couldn't save its details. Please try again." };
  }

  const preview = await getSignedPhotoUrl(path);
  return { ok: true, id: row.id as string, url: "url" in preview ? preview.url : null };
}

export async function getSignedPhotoUrl(path: string): Promise<{ url: string } | { error: string }> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase.storage
    .from(PROPERTY_PHOTOS_BUCKET)
    .createSignedUrl(path, SIGNED_VIEW_URL_TTL_SECONDS);

  if (error || !data) {
    console.error("[photos] failed to create signed view url", error);
    return { error: "Could not load this photo." };
  }
  return { url: data.signedUrl };
}

export async function listLeadPhotos(leadId: string): Promise<LeadPhoto[]> {
  const supabase = getSupabaseServiceClient();

  const { data: rows, error } = await supabase
    .from("lead_media")
    .select("id, file_path, category, original_filename")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (error || !rows || rows.length === 0) return [];

  const paths = rows.map((row) => row.file_path as string);
  const { data: signedUrls } = await supabase.storage
    .from(PROPERTY_PHOTOS_BUCKET)
    .createSignedUrls(paths, SIGNED_VIEW_URL_TTL_SECONDS);

  return rows.map((row, index) => ({
    id: row.id as string,
    path: row.file_path as string,
    category: row.category as string,
    originalFilename: row.original_filename as string,
    url: signedUrls?.[index]?.signedUrl ?? null,
  }));
}

export async function deletePhoto({
  mediaId,
  path,
}: {
  mediaId: string;
  path: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseServiceClient();

  const { error: storageError } = await supabase.storage.from(PROPERTY_PHOTOS_BUCKET).remove([path]);
  if (storageError) {
    console.error("[photos] failed to remove photo from storage", storageError);
    return { ok: false, error: "Could not remove this photo. Please try again." };
  }

  const { error: dbError } = await supabase.from("lead_media").delete().eq("id", mediaId);
  if (dbError) {
    console.error("[photos] failed to delete lead_media row", dbError);
    return { ok: false, error: "Could not remove this photo. Please try again." };
  }

  return { ok: true };
}

export async function createUploadLink(
  leadId: string
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (!leadId) return { ok: false, error: "Missing lead reference." };

  const supabase = getSupabaseServiceClient();
  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + UPLOAD_LINK_VALIDITY_DAYS * 24 * 60 * 60 * 1000);

  const { error } = await supabase.from("upload_tokens").insert({
    token,
    lead_id: leadId,
    expires_at: expiresAt.toISOString(),
  });

  if (error) {
    console.error("[photos] failed to create upload link", error);
    return { ok: false, error: "Could not create your upload link. Please try again." };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return { ok: true, url: `${baseUrl}/upload-photos/${token}` };
}

/**
 * Dashboard-facing entry point for viewing a lead's photos: unlike
 * listLeadPhotos (used by the public upload flow, which trusts possession
 * of the leadId itself), this checks the caller's own session against RLS
 * first, so only staff/partners actually permitted to see this lead can
 * reach the service-role-backed signed URL generation.
 */
export async function listLeadPhotosForStaff(leadId: string): Promise<LeadPhoto[]> {
  if (!(await assertLeadAccessible(leadId))) return [];
  return listLeadPhotos(leadId);
}

export async function validateUploadToken(
  token: string
): Promise<{ ok: true; leadId: string } | { ok: false; error: string }> {
  const supabase = getSupabaseServiceClient();

  const { data: row, error } = await supabase
    .from("upload_tokens")
    .select("lead_id, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (error || !row) {
    return { ok: false, error: "This upload link isn't valid." };
  }
  if (new Date(row.expires_at as string).getTime() < Date.now()) {
    return { ok: false, error: "This upload link has expired." };
  }

  return { ok: true, leadId: row.lead_id as string };
}
