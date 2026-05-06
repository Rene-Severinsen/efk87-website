import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, Lock } from "lucide-react";

import { resolveClubContext } from "../../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../../../lib/auth/accessGuards";
import {
  getForumCategoryBySlug,
  getForumThreadBySlug,
  getForumReplies,
} from "../../../../../lib/forum/forumService";
import { getMemberDisplayName } from "../../../../../components/member/MemberDisplayName";
import { formatAdminDateTime } from "../../../../../lib/format/adminDateFormat";
import ReplyForm from "../../../../../components/forum/ReplyForm";
import { createForumReply } from "../../../../../lib/forum/actions/memberForumActions";
import Avatar from "../../../../../components/shared/Avatar";
import { publicRoutes } from "../../../../../lib/publicRoutes";

interface ThreadDetailPageProps {
  params: Promise<{
    clubSlug: string;
    categorySlug: string;
    threadSlug: string;
  }>;
}

export default async function ThreadDetailPage({
                                                 params,
                                               }: ThreadDetailPageProps) {
  const { clubSlug, categorySlug, threadSlug } = await params;

  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    publicSettings,
  } = await resolveClubContext(clubSlug);

  await requireActiveMemberForClub(
      club.id,
      club.slug,
      publicRoutes.forumThread(clubSlug, categorySlug, threadSlug)
  );

  const category = await getForumCategoryBySlug(club.id, categorySlug);

  if (!category) {
    notFound();
  }

  const thread = await getForumThreadBySlug(club.id, category.id, threadSlug);

  if (!thread) {
    notFound();
  }

  const replies = await getForumReplies(thread.id);

  const replyAction = createForumReply.bind(
      null,
      clubSlug,
      categorySlug,
      threadSlug,
      thread.id
  );

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
          title={thread.title}
          eyebrow={category.title}
          currentPath={publicRoutes.forumThread(
              clubSlug,
              categorySlug,
              threadSlug
          )}
      >
        <div className="mb-6">
          <Link
            href={publicRoutes.forumCategory(clubSlug, categorySlug)}
            className="public-secondary-button inline-flex w-fit items-center gap-2"
          >
            ← Tilbage til kategorien
          </Link>
        </div>

<div className="mt-8 space-y-8">
          <article className="overflow-hidden rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] shadow-[var(--public-shadow)]">
            <header className="border-b border-[var(--public-card-border)] bg-[var(--public-surface)] px-6 py-5 sm:px-8">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                      name={getMemberDisplayName(thread.author)}
                      imageUrl={thread.author.image}
                      size="sm"
                  />
                  <span className="truncate text-sm font-semibold text-[var(--public-text)]">
                  {getMemberDisplayName(thread.author)}
                </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[var(--public-text-muted)]">
                  <Clock className="h-4 w-4 shrink-0" />
                  <span>{formatAdminDateTime(thread.createdAt)}</span>
                </div>
              </div>
            </header>

            <div className="bg-[var(--public-card)] px-6 py-7 sm:px-8">
              <div
                  className="forum-prose"
                  dangerouslySetInnerHTML={{ __html: thread.bodyHtml }}
              />
            </div>
          </article>

          {replies.length > 0 && (
              <section className="space-y-5">
                {replies.map((reply) => (
                    <article
                        key={reply.id}
                        className="overflow-hidden rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] shadow-[var(--public-shadow)] sm:ml-8 lg:ml-12"
                    >
                      <header className="border-b border-[var(--public-card-border)] bg-[var(--public-surface)] px-5 py-4 sm:px-6">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar
                                name={getMemberDisplayName(reply.author)}
                                imageUrl={reply.author.image}
                                size="sm"
                            />
                            <span className="truncate text-sm font-semibold text-[var(--public-text)]">
                        {getMemberDisplayName(reply.author)}
                      </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-[var(--public-text-muted)]">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>{formatAdminDateTime(reply.createdAt)}</span>
                          </div>
                        </div>
                      </header>

                      <div className="bg-[var(--public-card)] px-5 py-5 sm:px-6">
                        <div
                            className="forum-prose forum-prose-sm"
                            dangerouslySetInnerHTML={{ __html: reply.bodyHtml }}
                        />
                      </div>
                    </article>
                ))}
              </section>
          )}

          {thread.isLocked ? (
              <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-8 text-center shadow-[var(--public-shadow)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--public-card-border)] bg-[var(--public-card)] text-[var(--public-primary)]">
                  <Lock className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold tracking-wide text-[var(--public-text)]">
                  Denne tråd er låst og kan ikke besvares.
                </p>
              </div>
          ) : (
              <ReplyForm action={replyAction} />
          )}
        </div>
      </ThemedClubPageShell>
  );
}