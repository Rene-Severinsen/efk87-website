/**
 * Utility for standardizing datetime formatting in admin views.
 * 
 * Rules:
 * - Full timestamps: dd.mm.yyyy tt:mm:ss
 * - Dates only: dd.mm.yyyy
 * - Times only: tt:mm:ss (or tt:mm if seconds are not available/needed)
 * 
 * Implementation uses 'da-DK' locale for European ordering and dot-separators.
 */

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  return isNaN(date.getTime()) ? null : date;
}

export function formatAdminDateTime(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

export function formatAdminDate(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
}

export function formatAdminTime(value: Date | string | null | undefined): string {
  const date = toDate(value);
  if (!date) return "-";

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}
