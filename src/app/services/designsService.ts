import { requireSupabase } from "../lib/supabase";
import type { Company, Design, Dye } from "../types";

const IMAGE_BUCKET = "designbook-images";
const SIGNED_URL_TTL_SECONDS = 60 * 60;

interface DesignRow {
  id: string;
  owner_id: string;
  design_name: string;
  design_number: string;
  company_id: string;
  dye_id: string;
  description: string | null;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface DesignImageRow {
  id: string;
  owner_id: string;
  design_id: string;
  image_url: string;
  storage_path: string;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

interface CompanyRow {
  id: string;
  company_name: string;
  company_number: string;
}

interface DyeRow {
  id: string;
  dye_name: string;
  dye_number: string;
}

export interface DesignInput {
  designName: string;
  designNumber: string;
  companyId: string;
  dyeId: string;
  description?: string;
  coverImage?: string;
}

export interface DesignWithRelations extends Design {
  companyName?: string;
  companyNumber?: string;
}

export class DesignsServiceError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "DesignsServiceError";
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

  if (error) throw new DesignsServiceError(error.message, error.name);
  if (!data.user) throw new DesignsServiceError("You must be signed in to manage designs.", "not_authenticated");

  return data.user.id;
}

function normalizeError(error: unknown): DesignsServiceError {
  const err = error as { message?: string; code?: string };

  if (err.code === "23505") {
    return new DesignsServiceError("Design number is already used. Choose a different number.", "duplicate_design_number");
  }

  if (err.code === "23503") {
    return new DesignsServiceError("Please select a valid company and dye.", "missing_relation");
  }

  if (error instanceof DesignsServiceError) return error;

  return new DesignsServiceError(err.message ?? "Something went wrong while saving the design.", err.code);
}

export function getDesignErrorMessage(error: unknown) {
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

async function rowsToDesign(
  row: DesignRow,
  imageRows: DesignImageRow[],
  company?: CompanyRow,
  dye?: DyeRow
): Promise<DesignWithRelations> {
  const sortedImages = [...imageRows].sort((a, b) => a.sort_order - b.sort_order);
  const signedUrls = await signedUrlsByPath(sortedImages.map((img) => img.storage_path));
  const images = sortedImages.map((img) => signedUrls.get(img.storage_path) || img.image_url).filter(Boolean);
  const coverRow = sortedImages.find((img) => img.is_cover) ?? sortedImages[0];
  const coverImage = coverRow ? signedUrls.get(coverRow.storage_path) || coverRow.image_url : "";

  return {
    id: row.id,
    designName: row.design_name,
    designNumber: row.design_number,
    companyId: row.company_id,
    dyeId: row.dye_id,
    dyeName: dye?.dye_name ?? "",
    dyeNumber: dye?.dye_number ?? "",
    description: row.description ?? "",
    images,
    coverImage,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    companyName: company?.company_name,
    companyNumber: company?.company_number,
  };
}

async function uploadDesignImage(ownerId: string, designId: string, dataUrl: string, sortOrder: number) {
  const client = requireSupabase();
  const file = dataUrlToFile(dataUrl, `${Date.now()}-${sortOrder}-${crypto.randomUUID()}`);
  const storagePath = `${ownerId}/designs/${designId}/${file.filename}`;

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

async function getDesignImageRows(designId: string) {
  const client = requireSupabase();
  const { data, error } = await client
    .from("design_images")
    .select("*")
    .eq("design_id", designId)
    .order("sort_order", { ascending: true });

  if (error) throw normalizeError(error);
  return (data ?? []) as DesignImageRow[];
}

async function replaceDesignImages(ownerId: string, designId: string, images: string[], coverImage?: string) {
  const client = requireSupabase();
  const existingRows = await getDesignImageRows(designId);
  const existingByPath = new Map(existingRows.map((row) => [row.storage_path, row]));
  const keptPaths = new Set<string>();
  const coverStoragePath = coverImage ? extractStoragePath(coverImage) : "";

  const nextRows = await Promise.all(
    images.map(async (image, index) => {
      const existingPath = isDataUrl(image) ? "" : extractStoragePath(image);
      const existing = existingPath ? existingByPath.get(existingPath) : undefined;
      const uploaded = existing ?? await uploadDesignImage(ownerId, designId, image, index);

      keptPaths.add(uploaded.storage_path);

      return {
        owner_id: ownerId,
        design_id: designId,
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
    .from("design_images")
    .delete()
    .eq("design_id", designId)
    .eq("owner_id", ownerId);

  if (deleteRowsError) throw normalizeError(deleteRowsError);

  if (nextRows.length > 0) {
    const { error: insertRowsError } = await client.from("design_images").insert(nextRows);
    if (insertRowsError) throw normalizeError(insertRowsError);
  }

  if (pathsToDelete.length > 0) {
    await client.storage.from(IMAGE_BUCKET).remove(pathsToDelete);
  }

  const coverRow = nextRows.find((row) => row.is_cover) ?? nextRows[0];
  const { error: updateCoverError } = await client
    .from("designs")
    .update({ cover_image_url: coverRow?.image_url ?? null })
    .eq("id", designId)
    .eq("owner_id", ownerId);

  if (updateCoverError) throw normalizeError(updateCoverError);
}

async function loadCompanyRows(ids: string[]) {
  if (ids.length === 0) return new Map<string, CompanyRow>();
  const client = requireSupabase();
  const { data, error } = await client
    .from("companies")
    .select("id, company_name, company_number")
    .in("id", Array.from(new Set(ids)));

  if (error) throw normalizeError(error);
  return new Map(((data ?? []) as CompanyRow[]).map((row) => [row.id, row]));
}

async function loadDyeRows(ids: string[]) {
  if (ids.length === 0) return new Map<string, DyeRow>();
  const client = requireSupabase();
  const { data, error } = await client
    .from("dyes")
    .select("id, dye_name, dye_number")
    .in("id", Array.from(new Set(ids)));

  if (error) throw normalizeError(error);
  return new Map(((data ?? []) as DyeRow[]).map((row) => [row.id, row]));
}

export async function listDesigns() {
  const client = requireSupabase();
  const ownerId = await getCurrentUserId();
  const { data: designRows, error: designsError } = await client
    .from("designs")
    .select("*")
    .order("created_at", { ascending: false });

  if (designsError) throw normalizeError(designsError);

  const designs = (designRows ?? []) as DesignRow[];
  const designIds = designs.map((design) => design.id);
  const { data: imageRows, error: imagesError } = designIds.length
    ? await client
      .from("design_images")
      .select("*")
      .eq("owner_id", ownerId)
      .in("design_id", designIds)
      .order("sort_order", { ascending: true })
    : { data: [], error: null };

  if (imagesError) throw normalizeError(imagesError);

  const companies = await loadCompanyRows(designs.map((design) => design.company_id));
  const dyes = await loadDyeRows(designs.map((design) => design.dye_id));

  return Promise.all(
    designs.map((design) =>
      rowsToDesign(
        design,
        ((imageRows ?? []) as DesignImageRow[]).filter((image) => image.design_id === design.id),
        companies.get(design.company_id),
        dyes.get(design.dye_id)
      )
    )
  );
}

export async function getDesignById(id: string) {
  const client = requireSupabase();
  await getCurrentUserId();
  const { data, error } = await client
    .from("designs")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw normalizeError(error);
  if (!data) return null;

  const design = data as DesignRow;
  const companies = await loadCompanyRows([design.company_id]);
  const dyes = await loadDyeRows([design.dye_id]);

  return rowsToDesign(
    design,
    await getDesignImageRows(id),
    companies.get(design.company_id),
    dyes.get(design.dye_id)
  );
}

export async function createDesign(input: DesignInput, images: string[]) {
  const client = requireSupabase();
  const ownerId = await getCurrentUserId();

  const { data, error } = await client
    .from("designs")
    .insert({
      owner_id: ownerId,
      design_name: input.designName.trim(),
      design_number: input.designNumber.trim(),
      company_id: input.companyId,
      dye_id: input.dyeId,
      description: optionalText(input.description),
      cover_image_url: null,
    })
    .select("*")
    .single();

  if (error) throw normalizeError(error);

  const design = data as DesignRow;
  await replaceDesignImages(ownerId, design.id, images, input.coverImage);

  return getDesignById(design.id);
}

export async function updateDesign(id: string, input: DesignInput, images: string[]) {
  const client = requireSupabase();
  const ownerId = await getCurrentUserId();

  const { error } = await client
    .from("designs")
    .update({
      design_name: input.designName.trim(),
      design_number: input.designNumber.trim(),
      company_id: input.companyId,
      dye_id: input.dyeId,
      description: optionalText(input.description),
    })
    .eq("id", id)
    .eq("owner_id", ownerId);

  if (error) throw normalizeError(error);

  await replaceDesignImages(ownerId, id, images, input.coverImage);

  return getDesignById(id);
}

export async function deleteDesign(id: string) {
  const client = requireSupabase();
  await getCurrentUserId();
  const imageRows = await getDesignImageRows(id);
  const { error } = await client.from("designs").delete().eq("id", id);

  if (error) throw normalizeError(error);

  const pathsToDelete = imageRows.map((row) => row.storage_path).filter(Boolean);
  if (pathsToDelete.length > 0) {
    await client.storage.from(IMAGE_BUCKET).remove(pathsToDelete);
  }
}

export function companyNameForDesign(design: DesignWithRelations, companies: Company[]) {
  return design.companyName ?? companies.find((company) => company.id === design.companyId)?.companyName;
}

export function dyeForDesign(design: DesignWithRelations, dyes: Dye[]) {
  return dyes.find((dye) => dye.id === design.dyeId);
}
