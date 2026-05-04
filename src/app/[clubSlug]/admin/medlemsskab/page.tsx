import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { getClubMembershipPageContent } from "../../../../lib/membershipPage/membershipPageService";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
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
      <div className="py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-white">
            Medlemsskab
          </h1>
          <p className="max-w-3xl text-slate-400">
            Redigér indmeldelsesprocedure, kontingenter, opkrævning og praktisk medlemsinformation.
          </p>
        </div>

        <MembershipPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
        />
      </div>
    </AdminShell>
  );
}
