import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { getClubFinancePageContent } from "../../../../lib/financePage/financePageService";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import FinancePageAdminForm from "./FinancePageAdminForm";

interface FinanceAdminPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function FinanceAdminPage({ params }: FinanceAdminPageProps) {
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
    `/${clubSlug}/admin/oekonomi`,
  );

  const content = await getClubFinancePageContent(club.id);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
            Økonomi
          </h1>
          <p className="mt-2 max-w-3xl text-base text-slate-600">
            Vedligehold tekster til den offentlige økonomiside om udgiftsbilag,
            refusion, forskud og udbetaling.
          </p>
        </div>

        <FinancePageAdminForm
          clubSlug={clubSlug}
          initialContent={content}
        />
      </div>
    </AdminShell>
  );
}
