import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader, AdminPageSection } from "../../../../components/admin/AdminPagePrimitives";
import { getForumCategories } from "../../../../lib/forum/forumService";
import Link from "next/link";
import { 
  MessageCircle, 
  Plus, 
  Settings, 
  ChevronRight,
  GripVertical
} from "lucide-react";

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

  const viewer = await requireClubAdminForClub(club.id, clubSlug, `/${clubSlug}/admin/forum`);
  const categories = await getForumCategories(club.id, false);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <AdminPageHeader
        title="Forum"
        description="Administrer forumkategorier og indstillinger."
        action={{
          label: "Ny kategori",
          href: `/${clubSlug}/admin/forum/kategorier/ny`,
          icon: <Plus className="w-5 h-5" />
        }}
      />

      <div className="admin-page-content">
        <AdminPageSection>
          <h2 className="admin-section-title">Kategorier</h2>

          {categories.length === 0 ? (
            <div className="admin-empty-state">
              <MessageCircle className="admin-empty-icon h-8 w-8" />
              <p className="admin-muted">Der er endnu ikke oprettet nogen forumkategorier.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="admin-list-card flex items-center gap-4"
                >
                  <div className="admin-muted flex-shrink-0 cursor-grab">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="admin-strong">{category.title}</h3>
                      {!category.isActive && (
                        <span className="admin-badge admin-badge-danger">
                          Inaktiv
                        </span>
                      )}
                    </div>
                    <p className="admin-muted line-clamp-1 text-sm">
                      /{category.slug} • {category.description || "Ingen beskrivelse"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden text-right sm:block">
                      <div className="admin-strong text-sm">{category._count.threads}</div>
                      <div className="admin-muted text-[10px] font-bold uppercase tracking-tight">Tråde</div>
                    </div>

                    <Link
                      href={`/${clubSlug}/admin/forum/kategorier/${category.id}/rediger`}
                      className="admin-icon-button"
                      title="Rediger kategori"
                    >
                      <Settings className="h-5 w-5" />
                    </Link>

                    <Link
                      href={`/${clubSlug}/forum/${category.slug}`}
                      className="admin-icon-button"
                      title="Åbn kategori"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminPageSection>
      </div>
    </AdminShell>
  );
}
