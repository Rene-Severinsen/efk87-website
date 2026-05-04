import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";
import { getForumCategories } from "../../../lib/forum/forumService";
import Link from "next/link";
import { MessageCircle, ChevronRight, MessageSquare } from "lucide-react";
import { publicRoutes } from "../../../lib/publicRoutes";

interface ForumPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ForumPage({ params }: ForumPageProps) {
  const { clubSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } =
      await resolveClubContext(clubSlug);

  await requireActiveMemberForClub(
      club.id,
      club.slug,
      publicRoutes.forum(clubSlug)
  );

  const categories = await getForumCategories(club.id, true);

  return (
      <ThemedClubPageShell
          clubSlug={clubSlug}
          clubName={club.settings?.shortName || club.name}
          clubDisplayName={club.settings?.displayName || club.name}
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
          theme={theme}
          publicThemeMode={publicSettings?.publicThemeMode}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title="Forum"
          subtitle="Velkommen til klubbens forum. Her kan du stille spørgsmål, dele erfaringer og hygge med de andre medlemmer."
          currentPath={publicRoutes.forum(clubSlug)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {categories.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-[var(--public-card)] border border-[var(--public-card-border)] rounded-3xl shadow-[var(--public-shadow)]">
                <p className="text-[var(--public-text-muted)]">
                  Der er endnu ikke oprettet nogen forumkategorier.
                </p>
              </div>
          ) : (
              categories.map((category) => (
                  <Link
                      key={category.id}
                      href={publicRoutes.forumCategory(clubSlug, category.slug)}
                      className="group flex items-start gap-6 p-6 bg-[var(--public-card)] hover:bg-[var(--public-nav-hover)] border border-[var(--public-card-border)] rounded-3xl transition-all shadow-[var(--public-shadow)]"
                  >
                    <div className="flex-shrink-0 p-4 rounded-2xl bg-[var(--public-primary-soft)] text-[var(--public-primary)] group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-8 h-8" />
                    </div>

                    <div className="flex-grow min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="text-xl font-bold text-[var(--public-text)] group-hover:text-[var(--public-primary)] transition-colors truncate">
                          {category.title}
                        </h3>

                        <ChevronRight className="w-5 h-5 flex-shrink-0 text-[var(--public-text-muted)] group-hover:text-[var(--public-primary)] group-hover:translate-x-1 transition-all" />
                      </div>

                      <p className="text-[var(--public-text-muted)] text-sm line-clamp-2 mb-4 h-10">
                        {category.description || "Ingen beskrivelse tilgængelig."}
                      </p>

                      <div className="flex items-center gap-4 pt-4 border-t border-[var(--public-card-border)]">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--public-text-muted)] uppercase tracking-wider">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{category._count.threads} tråde</span>
                        </div>
                      </div>
                    </div>
                  </Link>
              ))
          )}
        </div>
      </ThemedClubPageShell>
  );
}