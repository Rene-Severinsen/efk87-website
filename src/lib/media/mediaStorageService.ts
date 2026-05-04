import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import prisma from "../db/prisma";
import { ClubMediaAssetDTO, UploadClubMediaInput } from "./mediaTypes";

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

function normalizeNullableText(value: string | null): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function toDto(asset: {
  id: string;
  clubId: string;
  title: string | null;
  altText: string | null;
  originalName: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: string;
  storageKey: string;
  publicUrl: string;
  isActive: boolean;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
  createdAt: Date;
  updatedAt: Date;
}): ClubMediaAssetDTO {
  return {
    id: asset.id,
    clubId: asset.clubId,
    title: asset.title,
    altText: asset.altText,
    originalName: asset.originalName,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    storageProvider: asset.storageProvider,
    storageKey: asset.storageKey,
    publicUrl: asset.publicUrl,
    isActive: asset.isActive,
    uploadedByName: asset.uploadedByName,
    uploadedByEmail: asset.uploadedByEmail,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
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
        ? "HEIC/HEIF kunne ikke behandles på denne installation. Prøv at uploade som JPG, eller installér HEIC-understøttelse til sharp/libvips."
        : "Billedet kunne ikke behandles.";

    throw new Error(message);
  }
}

export async function listClubMediaAssets(clubId: string): Promise<ClubMediaAssetDTO[]> {
  const assets = await prisma.clubMediaAsset.findMany({
    where: {
      clubId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return assets.map(toDto);
}

export async function uploadClubMediaAsset(
  input: UploadClubMediaInput,
): Promise<ClubMediaAssetDTO> {
  if (!allowedImageMimeTypes.has(input.file.type)) {
    throw new Error("Kun JPG, PNG, WebP, HEIC og HEIF kan uploades.");
  }

  if (input.file.size > maxUploadSizeBytes) {
    throw new Error("Billedet er for stort. Maksimal uploadstørrelse er 25 MB.");
  }

  const outputBuffer = await normalizeImageToWebp(input.file);

  const randomName = crypto.randomBytes(16).toString("hex");
  const fileName = `${randomName}${outputExtension}`;

  const publicRelativeDirectory = `uploads/${input.clubSlug}/media`;
  const storageKey = `${publicRelativeDirectory}/${fileName}`;
  const uploadDirectory = path.join(process.cwd(), "public", publicRelativeDirectory);
  const absoluteFilePath = path.join(uploadDirectory, fileName);
  const publicUrl = `/${storageKey}`;

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(absoluteFilePath, outputBuffer);

  const asset = await prisma.clubMediaAsset.create({
    data: {
      clubId: input.clubId,
      title: normalizeNullableText(input.title),
      altText: normalizeNullableText(input.altText),
      originalName: input.file.name,
      fileName,
      mimeType: outputMimeType,
      sizeBytes: outputBuffer.length,
      storageProvider: "LOCAL",
      storageKey,
      publicUrl,
      uploadedByName: normalizeNullableText(input.uploadedByName),
      uploadedByEmail: normalizeNullableText(input.uploadedByEmail),
    },
  });

  return toDto(asset);
}

export async function deactivateClubMediaAsset(
  clubId: string,
  assetId: string,
): Promise<void> {
  await prisma.clubMediaAsset.updateMany({
    where: {
      id: assetId,
      clubId,
    },
    data: {
      isActive: false,
    },
  });
}

export async function deleteLocalClubMediaAssetFile(
  storageKey: string,
): Promise<void> {
  if (!storageKey.startsWith("uploads/")) {
    return;
  }

  const absoluteFilePath = path.join(process.cwd(), "public", storageKey);

  try {
    await unlink(absoluteFilePath);
  } catch {
    // File may already be gone. DB deactivation is the source of truth for V1.
  }
}
