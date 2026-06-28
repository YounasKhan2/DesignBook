import { requireSupabase } from "../lib/supabase";
import type { Dye } from "../types";

const IMAGE_BUCKET = "designbook-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

interface DyeRow {
  id: string;
  owner_id: string;
  dye_name: string;
  dye_number: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DyeImageRow {
  id: string;
  owner_id: string;
  dye_id: string;
  image_url: string;
  storage_path: string;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export interface DyeInput {
  dyeName: string;
  dyeNumber: string;
  description?: string;
  coverImage?: string;
}

export class DyesServiceError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "DyesServiceError";
    this.code = code;
  }
}

function optionalText(value?: string) {
  const trimmed = value?.trim() ?? "";
  return trimmed || null;
}

async function getCurrentUserId() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();

  if (error) throw new DyesServiceError(error.message, error.name);
  if (!data.user) throw new DyesServiceError("You must be signed in to manage dyes.", "not_authenticated");

  return data.user.id;
}

function normalizeError(error: unknown): DyesServiceError {
  const err = error as { message?: string; code?: string };

  if (err.code === "23505") {
    return new DyesServiceError("Dye number is already used. Choose a different number.", "duplicate_dye_number");
  }

  if (err.code === "23503") {
    return new DyesServiceError("This dye is linked to existing designs and cannot be deleted.", "delete_blocked");
  }

  if (error instanceof DyesServiceError) return error;

  return new DyesServiceError(err.message ?? "Something went wrong while saving the dye.", err.code);
}

export function getDyeErrorMessage(error: unknown) {
  return normalizeError(error).message;
}

function isDataUrl(value: string) {
  return value.startsWith("data:");
}

function dataUrlToFile(dataUrl: string, fallbackName: string) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/^data:(.*?);base64$/)?.[1] ?? "image/jpeg";
  const ext = mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
  const bytes = atob(base64);
  const buffer = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i += 1) {
    buffer[i] = bytes.charCodeAt(i);
  }

  return {
    blob: new Blob([buffer], { type: mime }),
    filename: `${fallbackName}.${ext}`,
    contentType: mime,
  };
}

function extractStoragePath(urlOrPath: string) {
  if (!urlOrPath) return "";
  if (!/^https?:\/\//i.test(urlOrPath)) return urlOrPath;

  const marker = `/${IMAGE_BUCKET}/`;
  const idx = urlOrPath.indexOf(marker);
  if (idx === -1) return "";

  const pathWithQuery = urlOrPath.slice(idx + marker.length);
  return decodeURIComponent(pathWithQuery.split("?")[0]);
}

async function signedUrlsByPath(paths: string[]) {
  const uniquePaths = Array.from(new Set(paths.filter(Boolean)));
  if (uniquePaths.length === 0) return new Map<string, string>();

  const client = requireSupabase();
  const { data, error } = await client.storage
    .from(IMAGE_BUCKET)
    .createSignedUrls(uniquePaths, SIGNED_URL_TTL_SECONDS);

  if (error) throw normalizeError(error);

  return new Map(
    (data ?? []).map((item, index) => [
      uniquePaths[index],
      item.signedUrl ?? "",
    ])
  );
}

async function rowsToDye(row: DyeRow, imageRows: DyeImageRow[]) {
  const sortedImages = [...imageRows].sort((a, b) => a.sort_order - b.sort_order);
  const signedUrls = await signedUrlsByPath(sortedImages.map((img) => img.storage_path));
  const images = sortedImages.map((img) => signedUrls.get(img.storage_path) || img.image_url).filter(Boolean);
  const imagePaths = sortedImages.map((img) => img.storage_path);
  const coverRow = sortedImages.find((img) => img.is_cover) ?? sortedImages[0];
  const coverImage = coverRow ? signedUrls.get(coverRow.storage_path) || coverRow.image_url : "";

  return {
    id: row.id,
    dyeName: row.dye_name,
    dyeNumber: row.dye_number,
    description: row.description ?? undefined,
    images,
    coverImage,
    imagePaths,
    coverImagePath: coverRow?.storage_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } satisfies Dye;
}

async function uploadDyeImage(ownerId: string, dyeId: string, dataUrl: string, sortOrder: number) {
  const client = requireSupabase();
  const file = dataUrlToFile(dataUrl, `${Date.now()}-${sortOrder}-${crypto.randomUUID()}`);
  const storagePath = `${ownerId}/dyes/${dyeId}/${file.filename}`;

  const { error } = await client.storage
    .from(IMAGE_BUCKET)
    .upload(storagePath, file.blob, {
      contentType: file.contentType,
      upsert: false,
    });

  if (error) throw normalizeError(error);

  const { data } = client.storage.from(IMAGE_BUCKET).getPublicUrl(storagePath);

  return {
    image_url: data.publicUrl,
    storage_path: storagePath,
  };
}

async function getDyeImageRows(dyeId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("dye_images")
    .select("*")
    .eq("dye_id", dyeId)
    .order("sort_order", { ascending: true });

  if (error) throw normalizeError(error);
  return (data ?? []) as DyeImageRow[];
}

async function replaceDyeImages(ownerId: string, dyeId: string, images: string[], coverImage?: string) {
  const client = requireSupabase();
  const existingRows = await getDyeImageRows(dyeId);
  const existingByPath = new Map(existingRows.map((row) => [row.storage_path, row]));
  const keptPaths = new Set<string>();
  const coverStoragePath = coverImage ? extractStoragePath(coverImage) : "";

  const nextRows = await Promise.all(
    images.map(async (image, index) => {
      const existingPath = isDataUrl(image) ? "" : extractStoragePath(image);
      const existing = existingPath ? existingByPath.get(existingPath) : undefined;
      const uploaded = existing ?? await uploadDyeImage(ownerId, dyeId, image, index);

      keptPaths.add(uploaded.storage_path);

      return {
        owner_id: ownerId,
        dye_id: dyeId,
        image_url: uploaded.image_url,
        storage_path: uploaded.storage_path,
        is_cover: coverStoragePath
          ? uploaded.storage_path === coverStoragePath
          : image === coverImage || index === 0,
        sort_order: index,
      };
    })
  );

  const pathsToDelete = existingRows
    .map((row) => row.storage_path)
    .filter((path) => !keptPaths.has(path));

  const { error: deleteRowsError } = await client
    .from("dye_images")
    .delete()
    .eq("dye_id", dyeId)
    .eq("owner_id", ownerId);

  if (deleteRowsError) throw normalizeError(deleteRowsError);

  if (nextRows.length > 0) {
    const { error: insertRowsError } = await client.from("dye_images").insert(nextRows);
    if (insertRowsError) throw normalizeError(insertRowsError);
  }

  if (pathsToDelete.length > 0) {
    await client.storage.from(IMAGE_BUCKET).remove(pathsToDelete);
  }

  const coverRow = nextRows.find((row) => row.is_cover) ?? nextRows[0];
  const { error: updateCoverError } = await client
    .from("dyes")
    .update({ cover_image_url: coverRow?.image_url ?? null })
    .eq("id", dyeId)
    .eq("owner_id", ownerId);

  if (updateCoverError) throw normalizeError(updateCoverError);
}

export async function listDyes() {
  const client = requireSupabase();
  const ownerId = await getCurrentUserId();
  const { data: dyeRows, error: dyesError } = await client
    .from("dyes")
    .select("*")
    .order("created_at", { ascending: false });

  if (dyesError) throw normalizeError(dyesError);

  const dyes = (dyeRows ?? []) as DyeRow[];
  const dyeIds = dyes.map((dye) => dye.id);
  const { data: imageRows, error: imagesError } = dyeIds.length
    ? await client
      .from("dye_images")
      .select("*")
      .eq("owner_id", ownerId)
      .in("dye_id", dyeIds)
      .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (imagesError) throw normalizeError(imagesError);

  return Promise.all(
    dyes.map((dye) =>
      rowsToDye(
        dye,
        ((imageRows ?? []) as DyeImageRow[]).filter((image) => image.dye_id === dye.id)
      )
    )
  );
}

export async function getDyeById(id: string) {
  const client = requireSupabase();
  await getCurrentUserId();
  const { data, error } = await client
    .from("dyes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw normalizeError(error);
  if (!data) return null;

  return rowsToDye(data as DyeRow, await getDyeImageRows(id));
}

export async function createDye(input: DyeInput, images: string[]) {
  const client = requireSupabase();
  const ownerId = await getCurrentUserId();

  const { data, error } = await client
    .from("dyes")
    .insert({
      owner_id: ownerId,
      dye_name: input.dyeName.trim(),
      dye_number: input.dyeNumber.trim(),
      description: optionalText(input.description),
      cover_image_url: null,
    })
    .select("*")
    .single();

  if (error) throw normalizeError(error);

  const dye = data as DyeRow;
  await replaceDyeImages(ownerId, dye.id, images, input.coverImage);

  return getDyeById(dye.id);
}

export async function updateDye(id: string, input: DyeInput, images: string[]) {
  const client = requireSupabase();
  const ownerId = await getCurrentUserId();

  const { error } = await client
    .from("dyes")
    .update({
      dye_name: input.dyeName.trim(),
      dye_number: input.dyeNumber.trim(),
      description: optionalText(input.description),
    })
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) throw normalizeError(error);

  await replaceDyeImages(ownerId, id, images, input.coverImage);

  return getDyeById(id);
}

export async function deleteDye(id: string) {
  const client = requireSupabase();
  await getCurrentUserId();
  const imageRows = await getDyeImageRows(id);
  const { error } = await client.from("dyes").delete().eq("id", id);

  if (error) throw normalizeError(error);

  const pathsToDelete = imageRows.map((row) => row.storage_path).filter(Boolean);
  if (pathsToDelete.length > 0) {
    await client.storage.from(IMAGE_BUCKET).remove(pathsToDelete);
  }
}
