import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../components/admin/AdminShell";
import { AdminPageHeader } from "../../../../components/admin/AdminPagePrimitives";
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

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold text-white mb-4 px-2">Kategorier</h2>
        
        {categories.length === 0 ? (
          <div className="p-12 text-center backdrop-blur-md admin-surface-muted border admin-border rounded-3xl">
            <p className="admin-muted">Der er endnu ikke oprettet nogen forumkategorier.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="group flex items-center gap-4 p-4 backdrop-blur-md admin-surface-muted hover:opacity-90 border admin-border rounded-2xl transition-all"
              >
                <div className="flex-shrink-0 cursor-grab admin-muted hover:admin-muted transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{category.title}</h3>
                    {!category.isActive && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 uppercase tracking-wider border border-red-500/20">
                        Inaktiv
                      </span>
                    )}
                  </div>
                  <p className="text-sm admin-muted line-clamp-1">
                    /{category.slug} • {category.description || "Ingen beskrivelse"}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-white">{category._count.threads}</div>
                    <div className="text-[10px] admin-muted uppercase font-bold tracking-tight">Tråde</div>
                  </div>
                  
                  <Link
                    href={`/${clubSlug}/admin/forum/kategorier/${category.id}/rediger`}
                    className="p-2 rounded-lg admin-surface-muted hover:opacity-90 admin-muted hover:text-white transition-all"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                  
                  <Link
                    href={`/${clubSlug}/forum/${category.slug}`}
                    className="p-2 rounded-lg admin-surface-muted hover:opacity-90 admin-muted hover:text-white transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
