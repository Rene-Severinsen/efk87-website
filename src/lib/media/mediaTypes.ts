export interface ClubMediaAssetDTO {
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
}

export interface UploadClubMediaInput {
  clubId: string;
  clubSlug: string;
  file: File;
  title: string | null;
  altText: string | null;
  uploadedByName: string | null;
  uploadedByEmail: string | null;
}
