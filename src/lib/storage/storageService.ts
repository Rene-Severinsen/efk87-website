import { writeFile, mkdir, unlink } from "fs/promises";
import { join, extname } from "path";
import { existsSync } from "fs";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export interface StorageResult {
  url?: string;
  error?: string;
}

/**
 * Validates a file for type and size.
 * Returns a Danish error message if validation fails.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Ugyldig filtype. Kun JPEG, PNG og WebP er tilladt.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Filen er for stor. Maksimal størrelse er 2 MB.";
  }

  return null;
}

/**
 * Saves a member profile photo to local storage.
 * Path: /public/uploads/clubs/[clubId]/members/[memberProfileId]/profile.[ext]
 */
export async function saveMemberProfilePhoto(
  clubId: string,
  memberProfileId: string,
  file: File
): Promise<StorageResult> {
  try {
    const validationError = validateImageFile(file);
    if (validationError) {
      return { error: validationError };
    }

    const ext = extname(file.name) || ".jpg";
    const fileName = `profile${ext}`;
    const relativeDir = join("uploads", "clubs", clubId, "members", memberProfileId);
    const absoluteDir = join(process.cwd(), "public", relativeDir);

    // Ensure directory exists
    if (!existsSync(absoluteDir)) {
      await mkdir(absoluteDir, { recursive: true });
    }

    // Since we use a fixed filename 'profile.[ext]', we should ideally remove old files with different extensions
    // but the requirement says "Deleting old physical files is optional". 
    // However, if we change from .jpg to .png, both might exist. 
    // For simplicity and to avoid confusion, we'll just write the new one.
    
    const filePath = join(absoluteDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return {
      url: `/${relativeDir}/${fileName}?v=${Date.now()}`, // Add version to bust cache
    };
  } catch (error: unknown) {
    console.error("Storage error:", error);
    return { error: "Der opstod en fejl under lagring af billedet." };
  }
}

/**
 * Removes a member profile photo reference.
 * Note: Physical deletion is optional, so we'll skip it for now to stay safe.
 */
export async function deleteMemberProfilePhoto(
  _clubId: string,
  _memberProfileId: string,
  _url: string | null
): Promise<void> {
  // Physical deletion optional. Skipping to avoid accidental deletion of shared assets if any.
  // In a real world app, we would parse the URL and delete the file if it matches our storage pattern.
}
