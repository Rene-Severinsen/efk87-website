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
  const { club, theme, footerData, navigationItems, actionItems, viewer, publicSettings } = context;

  const article = await getPublishedArticleBySlug(club.id, articleSlug, viewer);

  if (!article) {
    notFound();
  }

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
      eyebrow={`Artikel · ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}`}
      subtitle={article.excerpt || undefined}
      currentPath={publicRoutes.article(clubSlug, articleSlug)}
      maxWidth="1120px"
    >
      {article.heroImageUrl && (
        <div 
          className="article-hero-container h-[200px] sm:h-[300px] md:h-[400px] rounded-[20px] sm:rounded-[32px] mb-6 sm:mb-10 bg-center bg-cover bg-no-repeat border border-[var(--club-line)]"
          style={{ 
            backgroundImage: `url(${article.heroImageUrl})`,
          }} 
        />
      )}

      <div className="max-w-[1040px] mx-auto">
        <ThemedSectionCard className="p-5 sm:p-8 md:p-12">
          <div className="flex flex-wrap gap-4 items-center mb-6 sm:mb-8 text-xs sm:text-sm text-[var(--club-muted)]">
            <span>Af {article.authorName || 'Redaktionen'}</span>
            {article.publishedAt && (
               <span className="opacity-50">·</span>
            )}
            {article.publishedAt && (
               <span>{new Date(article.publishedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            )}
          </div>

            <div 
              className="article-detail-prose text-[var(--club-text)] text-base sm:text-lg leading-relaxed prose prose-invert max-w-none prose-headings:text-[var(--club-text)] prose-p:text-[var(--club-text)] prose-p:opacity-90" 
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

          {article.tags.length > 0 && (
            <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-[var(--club-line)]">
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span key={tag.slug} className="tag px-3 py-1.5 rounded-full bg-[var(--public-card)] border border-[var(--club-line)] text-[var(--club-text)] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
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
