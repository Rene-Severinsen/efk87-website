import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import prisma from "../../../../lib/db/prisma";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
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
      <AdminPageHeader
        title="Footer"
        description="Administrer footerindhold, links og sponsorer."
      />

      <div className="space-y-6 pt-6">
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
