"use server";

import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import { getAllHomepageContentForAdmin } from "../../../../lib/homepageContent/homepageContentService";
import Link from "next/link";
import HomepageContentList from "./HomepageContentList";
import { Plus } from "lucide-react";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;
  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }
    throw error;
  }

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/forside-indhold`);
  const contents = await getAllHomepageContentForAdmin(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Forsideindhold"
        description="Administrer opslag og beskeder på forsiden."
        action={{
          label: "Nyt opslag",
          href: `/${clubSlug}/admin/forside-indhold/ny`,
          icon: <Plus size={18} />
        }}
      />

      <HomepageContentList contents={contents} clubSlug={clubSlug} />
    </AdminShell>
  );
}
