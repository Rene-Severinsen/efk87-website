import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../../lib/auth/accessGuards";
import { getForumCategoryBySlug, getForumThreads } from "../../../../lib/forum/forumService";
import Link from "next/link";
import { Plus, Clock, MessageSquare } from "lucide-react";
import ForumIcon from "../../../../components/forum/ForumIcon";
import ForumReplyBadge from "../../../../components/forum/ForumReplyBadge";
import { getForumReplyBadge } from "../../../../lib/forum/forumHelpers";
import { getMemberDisplayName } from "../../../../components/member/MemberDisplayName";
import { formatAdminDate } from "../../../../lib/format/adminDateFormat";
import Avatar from "../../../../components/shared/Avatar";

interface CategoryPageProps {
  params: Promise<{
    clubSlug: string;
    categorySlug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { clubSlug, categorySlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);

  // Ensure user is an active member
  await requireActiveMemberForClub(club.id, club.slug, `/${clubSlug}/forum/${categorySlug}`);

  const category = await getForumCategoryBySlug(club.id, categorySlug);

  if (!category) {
    notFound();
  }

  const threads = await getForumThreads(club.id, category.id);

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
      title={category.title}
      subtitle={category.description || undefined}
      eyebrow="Forum"
      currentPath={`/${clubSlug}/forum/${categorySlug}`}
    >
      <div className="flex justify-end mb-8 mt-4">
        <Link
          href={`/${clubSlug}/forum/${categorySlug}/ny`}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold shadow-lg shadow-sky-500/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Opret tråd
        </Link>
      </div>

      <div className="space-y-4">
        {threads.length === 0 ? (
          <div className="p-12 text-center backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl">
            <p className="text-slate-400">Der er endnu ikke nogen tråde i denne kategori.</p>
          </div>
        ) : (
          threads.map((thread) => {
            const badge = getForumReplyBadge(thread.replyCount, thread.createdAt);
            
            return (
              <Link
                key={thread.id}
                href={`/${clubSlug}/forum/${categorySlug}/${thread.slug}`}
                className="flex items-center gap-4 p-4 backdrop-blur-md bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20 transition-all">
                  <ForumIcon iconKey={thread.iconKey} className="w-6 h-6" />
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {thread.isPinned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 uppercase tracking-tighter border border-amber-500/20">
                        Fastgjort
                      </span>
                    )}
                    <h3 className="font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                      {thread.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Avatar 
                        name={getMemberDisplayName(thread.author)} 
                        imageUrl={thread.author.image} 
                        size="sm" 
                        className="w-5 h-5"
                      />
                      <span>{getMemberDisplayName(thread.author)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatAdminDate(thread.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      <span>{thread.replyCount} svar</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  <ForumReplyBadge badge={badge} />
                </div>
              </Link>
            );
          })
        )}
      </div>
    </ThemedClubPageShell>
  );
}
