import { requireSupabase } from "../lib/supabase";

const IMAGE_BUCKET = "designbook-images";
const SIGNED_URL_TTL_SECONDS = 60 * 5;

export class ImageDownloadError extends Error {
  constructor(message = "Could not download image. Please try again.") {
    super(message);
    this.name = "ImageDownloadError";
  }
}

function extensionFromBlob(blob: Blob) {
  const ext = blob.type.split("/")[1]?.replace("jpeg", "jpg");
  return ext || "jpg";
}

export async function createSignedImageUrl(storagePath: string) {
  if (!storagePath) throw new ImageDownloadError();

  const client = requireSupabase();
  const { data, error } = await client.storage
    .from(IMAGE_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) throw new ImageDownloadError();

  return data.signedUrl;
}

export async function downloadPrivateImage(storagePath: string, filenameBase: string) {
  try {
    const signedUrl = await createSignedImageUrl(storagePath);
    const response = await fetch(signedUrl);

    if (!response.ok) throw new ImageDownloadError();

    const blob = await response.blob();
    const filename = `${filenameBase}.${extensionFromBlob(blob)}`;
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    if (error instanceof ImageDownloadError) throw error;
    throw new ImageDownloadError();
  }
}

export async function openPrivateImage(storagePath: string) {
  try {
    const signedUrl = await createSignedImageUrl(storagePath);
    window.open(signedUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    if (error instanceof ImageDownloadError) throw error;
    throw new ImageDownloadError("Could not open image. Please try again.");
  }
}
