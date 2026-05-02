import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../lib/auth/accessGuards";
import { getForumCategories } from "../../../lib/forum/forumService";
import Link from "next/link";
import { MessageCircle, ChevronRight, MessageSquare } from "lucide-react";

interface ForumPageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ForumPage({ params }: ForumPageProps) {
  const { clubSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);

  // Ensure user is an active member
  await requireActiveMemberForClub(club.id, club.slug, `/${clubSlug}/forum`);

  const categories = await getForumCategories(club.id, true);

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      publicThemeMode={publicSettings?.publicThemeMode}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Forum"
      subtitle="Velkommen til klubbens forum. Her kan du stille spørgsmål, dele erfaringer og hygge med de andre medlemmer."
      currentPath={`/${clubSlug}/forum`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {categories.length === 0 ? (
          <div className="col-span-full p-12 text-center backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-slate-400">Der er endnu ikke oprettet nogen forumkategorier.</p>
          </div>
        ) : (
          categories.map((category) => (
            <Link
              key={category.id}
              href={`/${clubSlug}/forum/${category.slug}`}
              className="group flex items-start gap-6 p-6 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all shadow-xl hover:shadow-sky-500/10"
            >
              <div className="flex-shrink-0 p-4 rounded-2xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 group-hover:scale-110 transition-all">
                <MessageCircle className="w-8 h-8" />
              </div>
              
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                    {category.title}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </div>
                
                <p className="text-slate-400 text-sm line-clamp-2 mb-4 h-10">
                  {category.description || "Ingen beskrivelse tilgængelig."}
                </p>
                
                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
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
