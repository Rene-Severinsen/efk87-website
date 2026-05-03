import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../../../lib/auth/accessGuards";
import { getForumCategoryBySlug, getForumThreadBySlug, getForumReplies } from "../../../../../lib/forum/forumService";
import { getMemberDisplayName } from "../../../../../components/member/MemberDisplayName";
import { formatAdminDateTime } from "../../../../../lib/format/adminDateFormat";
import ReplyForm from "../../../../../components/forum/ReplyForm";
import { createForumReply } from "../../../../../lib/forum/actions/memberForumActions";
import { Clock, Lock } from "lucide-react";
import Avatar from "../../../../../components/shared/Avatar";
import { publicRoutes } from "../../../../../lib/publicRoutes";

interface ThreadDetailPageProps {
  params: Promise<{
    clubSlug: string;
    categorySlug: string;
    threadSlug: string;
  }>;
}

export default async function ThreadDetailPage({ params }: ThreadDetailPageProps) {
  const { clubSlug, categorySlug, threadSlug } = await params;

  const { club, theme, footerData, navigationItems, actionItems, publicSettings } = await resolveClubContext(clubSlug);

  // Ensure user is an active member
  await requireActiveMemberForClub(club.id, club.slug, publicRoutes.forumThread(clubSlug, categorySlug, threadSlug));

  const category = await getForumCategoryBySlug(club.id, categorySlug);
  if (!category) notFound();

  const thread = await getForumThreadBySlug(club.id, category.id, threadSlug);
  if (!thread) notFound();

  const replies = await getForumReplies(thread.id);

  const replyAction = createForumReply.bind(null, clubSlug, categorySlug, threadSlug, thread.id);

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
      title={thread.title}
      eyebrow={category.title}
      currentPath={publicRoutes.forumThread(clubSlug, categorySlug, threadSlug)}
    >
      <div className="space-y-8 mt-8">
        {/* OP Thread Body */}
        <div className="backdrop-blur-md bg-[var(--public-card)] border border-[var(--public-card-border)] rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-[var(--public-card-border)] bg-[var(--public-primary-soft)]">
            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--club-text)]">
              <div className="flex items-center gap-3">
                <Avatar 
                  name={getMemberDisplayName(thread.author)} 
                  imageUrl={thread.author.image} 
                  size="sm" 
                />
                <span className="font-bold text-[var(--club-text)]">{getMemberDisplayName(thread.author)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{formatAdminDateTime(thread.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div 
              className="prose prose-invert max-w-none prose-headings:text-[var(--club-text)] prose-p:text-[var(--club-text)] prose-p:opacity-90"
              dangerouslySetInnerHTML={{ __html: thread.bodyHtml }}
            />
          </div>
        </div>

        {/* Replies */}
        {replies.map((reply) => (
          <div key={reply.id} className="backdrop-blur-md bg-[var(--public-card)] border border-[var(--public-card-border)] rounded-[2rem] overflow-hidden shadow-xl ml-4 sm:ml-8 lg:ml-12">
            <div className="p-6 border-b border-[var(--public-card-border)] bg-[var(--public-primary-soft)] flex flex-wrap items-center gap-6 text-sm text-[var(--club-text)]">
              <div className="flex items-center gap-3">
                <Avatar 
                  name={getMemberDisplayName(reply.author)} 
                  imageUrl={reply.author.image} 
                  size="sm" 
                />
                <span className="font-bold text-[var(--club-text)]">{getMemberDisplayName(reply.author)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatAdminDateTime(reply.createdAt)}</span>
              </div>
            </div>
            <div className="p-6">
              <div 
                className="prose prose-invert prose-sm max-w-none prose-headings:text-[var(--club-text)] prose-p:text-[var(--club-text)] prose-p:opacity-90"
                dangerouslySetInnerHTML={{ __html: reply.bodyHtml }}
              />
            </div>
          </div>
        ))}

        {/* Reply Form or Locked Message */}
        {thread.isLocked ? (
          <div className="p-8 text-center backdrop-blur-md bg-[var(--public-primary-soft)] border border-[var(--public-card-border)] rounded-[2rem] flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--public-primary-soft)] flex items-center justify-center text-[var(--public-primary)] border border-[var(--public-card-border)]">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-[var(--public-primary)] font-bold uppercase tracking-widest text-sm">Denne tråd er låst og kan ikke besvares.</p>
          </div>
        ) : (
          <ReplyForm action={replyAction} />
        )}
      </div>
    </ThemedClubPageShell>
  );
}
