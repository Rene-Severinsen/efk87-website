import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { getClubRulesPageContent } from "../../../../lib/rulesPage/rulesPageService";
import RulesPageAdminForm from "./RulesPageAdminForm";

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
    `/${clubSlug}/admin/regler-og-bestemmelser`,
  );

  const content = await getClubRulesPageContent(club.id);

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
            Regler og bestemmelser
          </h1>
          <p className="max-w-3xl text-slate-400">
            Redigér klubbens links til flyveregler, flyvezone, lovtekst og praktiske retningslinjer.
          </p>
        </div>

        <RulesPageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
        />
      </div>
    </AdminShell>
  );
}
