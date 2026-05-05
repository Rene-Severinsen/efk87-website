import { notFound } from "next/navigation";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { getClubLocationPageContent } from "../../../../lib/locationPage/locationPageService";
import { listClubMediaAssets } from "../../../../lib/media/mediaStorageService";
import LocationPageAdminForm from "./LocationPageAdminForm";

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
        `/${clubSlug}/admin/her-bor-vi`,
    );

    const [content, mediaAssets] = await Promise.all([
        getClubLocationPageContent(club.id),
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
                title="Her bor vi"
                description="Vedligehold adgang, kørselsvejledning og praktisk information."
            />

            <div className="py-8">
                <LocationPageAdminForm
                    clubSlug={clubSlug}
                    initialContent={content}
                    mediaAssets={mediaAssets}
                />
            </div>
        </AdminShell>
    );
}