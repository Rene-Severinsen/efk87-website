"use server";

import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
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
      <div className="admin-page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#fff' }}>Forsideindhold</h1>
          <p style={{ color: 'rgba(238, 245, 255, 0.6)', marginTop: '4px' }}>Administrer opslag og beskeder på forsiden.</p>
        </div>
        <Link href={`/${clubSlug}/admin/forside-indhold/ny`} className="admin-btn admin-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          Nyt opslag
        </Link>
      </div>

      <HomepageContentList contents={contents} clubSlug={clubSlug} />
    </AdminShell>
  );
}
