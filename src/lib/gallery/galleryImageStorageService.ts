import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const outputMimeType = "image/webp";
const outputExtension = ".webp";
const maxUploadSizeBytes = 25 * 1024 * 1024;
const maxLongestEdgePx = 2400;
const webpQuality = 85;

export interface StoredGalleryImage {
  originalName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: "LOCAL";
  storageKey: string;
  publicUrl: string;
}

async function normalizeImageToWebp(file: File): Promise<Buffer> {
  const inputBuffer = Buffer.from(await file.arrayBuffer());

  try {
    return await sharp(inputBuffer, {
      failOn: "error",
    })
      .rotate()
      .resize({
        width: maxLongestEdgePx,
        height: maxLongestEdgePx,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality: webpQuality,
      })
      .toBuffer();
  } catch {
    const message =
      file.type === "image/heic" || file.type === "image/heif"
        ? "HEIC/HEIF kunne ikke behandles på denne installation. Prøv at uploade som JPG."
        : "Billedet kunne ikke behandles.";

    throw new Error(message);
  }
}

export async function storeGalleryImageFile({
  clubSlug,
  albumId,
  file,
}: {
  clubSlug: string;
  albumId: string;
  file: File;
}): Promise<StoredGalleryImage> {
  if (!allowedImageMimeTypes.has(file.type)) {
    throw new Error("Kun JPG, PNG, WebP, HEIC og HEIF kan uploades.");
  }

  if (file.size > maxUploadSizeBytes) {
    throw new Error("Billedet er for stort. Maksimal uploadstørrelse er 25 MB.");
  }

  const outputBuffer = await normalizeImageToWebp(file);
  const randomName = crypto.randomBytes(16).toString("hex");
  const fileName = `${randomName}${outputExtension}`;

  const publicRelativeDirectory = `uploads/${clubSlug}/gallery/${albumId}`;
  const storageKey = `${publicRelativeDirectory}/${fileName}`;
  const uploadDirectory = path.join(process.cwd(), "public", publicRelativeDirectory);
  const absoluteFilePath = path.join(uploadDirectory, fileName);
  const publicUrl = `/${storageKey}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(absoluteFilePath, outputBuffer);

  return {
    originalName: file.name,
    fileName,
    mimeType: outputMimeType,
    sizeBytes: outputBuffer.length,
    storageProvider: "LOCAL",
    storageKey,
    publicUrl,
  };
}

export async function deleteLocalGalleryImageFile(storageKey: string | null): Promise<void> {
  if (!storageKey || !storageKey.startsWith("uploads/")) {
    return;
  }

  const absoluteFilePath = path.join(process.cwd(), "public", storageKey);

  try {
    await unlink(absoluteFilePath);
  } catch {
    // DB status is source of truth in V1.
  }
}
