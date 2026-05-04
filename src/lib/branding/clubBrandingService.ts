import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import prisma from "../db/prisma";

const allowedLogoMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/gif",
]);

const maxUploadSizeBytes = 25 * 1024 * 1024;

export interface ClubBrandingDTO {
  logoUrl: string | null;
  logoAltText: string | null;
  faviconUrl: string | null;
  appleIconUrl: string | null;
}

function normalizeNullableText(value: string | null): string | null {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

async function toInputBuffer(file: File): Promise<Buffer> {
  if (!allowedLogoMimeTypes.has(file.type)) {
    throw new Error("Logo skal være JPG, PNG, WebP, HEIC, HEIF eller GIF.");
  }

  if (file.size > maxUploadSizeBytes) {
    throw new Error("Logoet er for stort. Maksimal størrelse er 25 MB.");
  }

  return Buffer.from(await file.arrayBuffer());
}

async function createLogoWebp(inputBuffer: Buffer): Promise<Buffer> {
  return sharp(inputBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: 900,
      height: 360,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 90,
    })
    .toBuffer();
}

async function createSquarePngIcon(inputBuffer: Buffer, size: number): Promise<Buffer> {
  return sharp(inputBuffer, { failOn: "error" })
    .rotate()
    .resize({
      width: size,
      height: size,
      fit: "contain",
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
      withoutEnlargement: false,
    })
    .png()
    .toBuffer();
}

export async function getClubBranding(clubId: string): Promise<ClubBrandingDTO> {
  const settings = await prisma.clubSettings.findUnique({
    where: {
      clubId,
    },
    select: {
      logoUrl: true,
      logoAltText: true,
      faviconUrl: true,
      appleIconUrl: true,
    },
  });

  return {
    logoUrl: settings?.logoUrl ?? null,
    logoAltText: settings?.logoAltText ?? null,
    faviconUrl: settings?.faviconUrl ?? null,
    appleIconUrl: settings?.appleIconUrl ?? null,
  };
}

export async function updateClubBrandingFromLogoUpload({
  clubId,
  clubSlug,
  logoFile,
  logoAltText,
}: {
  clubId: string;
  clubSlug: string;
  logoFile: File;
  logoAltText: string | null;
}): Promise<ClubBrandingDTO> {
  const inputBuffer = await toInputBuffer(logoFile);

  const publicDirectory = `uploads/${clubSlug}/branding`;
  const outputDirectory = path.join(process.cwd(), "public", publicDirectory);

  await mkdir(outputDirectory, { recursive: true });

  const logoBuffer = await createLogoWebp(inputBuffer);
  const favicon32Buffer = await createSquarePngIcon(inputBuffer, 32);
  const favicon48Buffer = await createSquarePngIcon(inputBuffer, 48);
  const appleIconBuffer = await createSquarePngIcon(inputBuffer, 180);

  const logoFileName = "logo.webp";
  const favicon32FileName = "favicon-32.png";
  const favicon48FileName = "favicon-48.png";
  const appleIconFileName = "apple-touch-icon.png";

  await Promise.all([
    writeFile(path.join(outputDirectory, logoFileName), logoBuffer),
    writeFile(path.join(outputDirectory, favicon32FileName), favicon32Buffer),
    writeFile(path.join(outputDirectory, favicon48FileName), favicon48Buffer),
    writeFile(path.join(outputDirectory, appleIconFileName), appleIconBuffer),
  ]);

  const logoUrl = `/${publicDirectory}/${logoFileName}`;
  const faviconUrl = `/${publicDirectory}/${favicon32FileName}`;
  const appleIconUrl = `/${publicDirectory}/${appleIconFileName}`;

  const settings = await prisma.clubSettings.upsert({
    where: {
      clubId,
    },
    create: {
      clubId,
      displayName: clubSlug,
      shortName: clubSlug.toUpperCase(),
      logoUrl,
      logoAltText: normalizeNullableText(logoAltText),
      faviconUrl,
      appleIconUrl,
    },
    update: {
      logoUrl,
      logoAltText: normalizeNullableText(logoAltText),
      faviconUrl,
      appleIconUrl,
    },
    select: {
      logoUrl: true,
      logoAltText: true,
      faviconUrl: true,
      appleIconUrl: true,
    },
  });

  return settings;
}

export async function updateClubBrandingText({
  clubId,
  logoAltText,
}: {
  clubId: string;
  logoAltText: string | null;
}): Promise<ClubBrandingDTO> {
  const settings = await prisma.clubSettings.update({
    where: {
      clubId,
    },
    data: {
      logoAltText: normalizeNullableText(logoAltText),
    },
    select: {
      logoUrl: true,
      logoAltText: true,
      faviconUrl: true,
      appleIconUrl: true,
    },
  });

  return settings;
}
