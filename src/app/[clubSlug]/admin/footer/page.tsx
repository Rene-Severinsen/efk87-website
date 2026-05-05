import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import prisma from "../../../../lib/db/prisma";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";
import FooterAdminForm from "./FooterAdminForm";

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
    `/${clubSlug}/admin/footer`,
  );

  const [footer, sponsors, mediaAssets] = await Promise.all([
    prisma.publicClubFooter.findUnique({
      where: {
        clubId: club.id,
      },
    }),
    prisma.publicSponsor.findMany({
      where: {
        clubId: club.id,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),
    listClubMediaAssets(club.id),
  ]);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-300">
            Public site
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            Footer
          </h1>
          <p className="mt-2 max-w-3xl text-slate-400">
            Administrér footerens klubtekst, kontaktoplysninger og sponsorer. Footeren bruges på både forside og undersider.
          </p>
        </div>

        <FooterAdminForm
          clubSlug={clubSlug}
          footer={footer}
          sponsors={sponsors}
          mediaAssets={mediaAssets}
        />
      </div>
    </AdminShell>
  );
}
