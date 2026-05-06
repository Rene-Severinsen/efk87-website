import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Clock, MessageSquare } from "lucide-react";

import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { requireActiveMemberForClub } from "../../../../lib/auth/accessGuards";
import {
  getForumCategoryBySlug,
  getForumThreads,
} from "../../../../lib/forum/forumService";
import ForumIcon from "../../../../components/forum/ForumIcon";
import ForumReplyBadge from "../../../../components/forum/ForumReplyBadge";
import { getForumReplyBadge } from "../../../../lib/forum/forumHelpers";
import { getMemberDisplayName } from "../../../../components/member/MemberDisplayName";
import { formatAdminDate } from "../../../../lib/format/adminDateFormat";
import Avatar from "../../../../components/shared/Avatar";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface CategoryPageProps {
  params: Promise<{
    clubSlug: string;
    categorySlug: string;
  }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { clubSlug, categorySlug } = await params;

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
      publicRoutes.forumCategory(clubSlug, categorySlug)
  );

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
      logoUrl={publicSettings?.logoUrl ?? null}
      logoAltText={publicSettings?.logoAltText ?? null}
          theme={theme}
          publicThemeMode={publicSettings?.publicThemeMode}
          footerData={footerData}
          navigationItems={navigationItems}
          actionItems={actionItems}
          title={category.title}
          subtitle={category.description || undefined}
          eyebrow="Forum"
          currentPath={publicRoutes.forumCategory(clubSlug, categorySlug)}
      >
        <div className="mt-6 mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
              href={publicRoutes.forum(clubSlug)}
              className="public-secondary-button inline-flex w-fit items-center gap-2"
          >
            ← Tilbage til forum
          </Link>
          <Link
              href={`${publicRoutes.forumCategory(clubSlug, categorySlug)}/ny`}
              className="public-primary-button inline-flex w-fit items-center justify-center gap-2 px-6 py-3"
          >
            <Plus className="h-5 w-5" />
            <span>Opret tråd</span>
          </Link>
        </div>

        {threads.length === 0 ? (
            <div className="rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-12 text-center shadow-[var(--public-shadow)]">
              <p className="text-[var(--public-text-muted)]">
                Der er endnu ikke nogen tråde i denne kategori.
              </p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {threads.map((thread) => {
                const badge = getForumReplyBadge(
                    thread.replyCount,
                    thread.createdAt
                );

                const authorName = getMemberDisplayName(thread.author);

                return (
                    <Link
                        key={thread.id}
                        href={publicRoutes.forumThread(
                            clubSlug,
                            categorySlug,
                            thread.slug
                        )}
                        className="group rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-4 shadow-[var(--public-shadow)] transition-all hover:-translate-y-0.5 hover:border-[var(--public-primary)] hover:bg-[var(--public-nav-hover)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--public-card-border)] bg-[var(--public-primary-soft)] text-[var(--public-primary)] transition-transform group-hover:scale-105">
                          <ForumIcon iconKey={thread.iconKey} className="h-7 w-7" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex min-w-0 items-start gap-2">
                                {thread.isPinned && (
                                    <span className="mt-1 shrink-0 rounded-full border border-[var(--public-primary)] bg-[var(--public-primary-soft)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--public-primary)]">
                              Fastgjort
                            </span>
                                )}

                                <h3 className="min-w-0 max-w-full text-lg font-bold leading-tight text-[var(--public-text)] transition-colors group-hover:text-[var(--public-primary)] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden break-words">
                                  {thread.title}
                                </h3>
                              </div>
                            </div>

                            <div className="hidden shrink-0 sm:block">
                              <ForumReplyBadge badge={badge} />
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--public-text-muted)]">
                            <div className="flex min-w-0 items-center gap-2">
                              <Avatar
                                  name={authorName}
                                  imageUrl={thread.author.image}
                                  size="sm"
                                  className="h-7 w-7 shrink-0"
                              />
                              <span className="truncate">{authorName}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 shrink-0" />
                              <span>{formatAdminDate(thread.createdAt)}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="h-4 w-4 shrink-0" />
                              <span>{thread.replyCount} svar</span>
                            </div>

                            <div className="sm:hidden">
                              <ForumReplyBadge badge={badge} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                );
              })}
            </div>
        )}
      </ThemedClubPageShell>
  );
}