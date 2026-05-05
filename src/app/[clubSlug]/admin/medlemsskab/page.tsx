import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { getClubMembershipPageContent } from "../../../../lib/membershipPage/membershipPageService";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import MembershipPageAdminForm from "./MembershipPageAdminForm";

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

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    `/${clubSlug}/admin/medlemsskab`,
  );

  const content = await getClubMembershipPageContent(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Medlemsskab"
        description="Vedligehold den offentlige medlemsside."
      />

      <div className="py-8">
        <MembershipPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
        />
      </div>
    </AdminShell>
  );
}
