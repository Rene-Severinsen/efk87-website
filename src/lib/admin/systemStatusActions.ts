"use server";

import { redirect } from "next/navigation";
import { requireClubAdminForClub } from "../auth/adminAccessGuards";
import { sendSystemTestEmail } from "../email/mailService";

function normalizeEmail(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function sendSystemStatusTestEmailAction(
  clubId: string,
  clubSlug: string,
  clubName: string,
  formData: FormData
): Promise<void> {
  const viewer = await requireClubAdminForClub(
    clubId,
    clubSlug,
    `/${clubSlug}/admin/systemstatus`
  );

  const to = normalizeEmail(formData.get("testEmail"));

  if (!isValidEmail(to)) {
    redirect(`/${clubSlug}/admin/systemstatus?mailTest=invalid`);
  }

  const result = await sendSystemTestEmail({
    to,
    clubSlug,
    clubName,
    requestedBy: viewer.email || viewer.name || "Ukendt admin",
  });

  redirect(`/${clubSlug}/admin/systemstatus?mailTest=${result.success ? "success" : "error"}`);
}
