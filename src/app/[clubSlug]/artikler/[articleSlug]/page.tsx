import { notFound } from "next/navigation";

import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { getPublishedArticleBySlug } from "../../../../lib/articles/articleService";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";
import { publicRoutes } from "../../../../lib/publicRoutes";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    articleSlug: string;
  }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { clubSlug, articleSlug } = await params;

  const context = await resolveClubContext(clubSlug);
  const {
    club,
    theme,
    footerData,
    navigationItems,
    actionItems,
    viewer,
    publicSettings,
  } = context;

  const article = await getPublishedArticleBySlug(club.id, articleSlug, viewer);

  if (!article) {
    notFound();
  }

  const publishedDate = article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString("da-DK", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
      : "";

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
          title={article.title}
          eyebrow={publishedDate ? `Artikel · ${publishedDate}` : "Artikel"}
          subtitle={article.excerpt || undefined}
          currentPath={publicRoutes.article(clubSlug, articleSlug)}
          maxWidth="1120px"
      >
        {article.heroImageUrl && (
            <div
                className="mb-8 h-[220px] rounded-3xl border border-[var(--public-card-border)] bg-cover bg-center bg-no-repeat shadow-[var(--public-shadow)] sm:h-[320px] md:h-[420px]"
                style={{
                  backgroundImage: `url(${article.heroImageUrl})`,
                }}
            />
        )}

        <div className="mx-auto max-w-[1040px]">
          <ThemedSectionCard className="p-6 sm:p-8 md:p-12">
            <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--public-text-muted)]">
              <span>Af {article.authorName || "Redaktionen"}</span>
              {publishedDate && <span>·</span>}
              {publishedDate && <span>{publishedDate}</span>}
            </div>

            <div
                className="article-detail-prose"
                dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {article.tags.length > 0 && (
                <div className="mt-10 border-t border-[var(--public-card-border)] pt-6">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                        <span key={tag.slug} className="public-chip">
                    {tag.name}
                  </span>
                    ))}
                  </div>
                </div>
            )}
          </ThemedSectionCard>
        </div>
      </ThemedClubPageShell>
  );
}