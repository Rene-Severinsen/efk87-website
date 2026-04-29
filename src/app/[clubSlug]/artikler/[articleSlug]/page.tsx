import { notFound } from "next/navigation";
import { resolveClubContext } from "../../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../../components/publicSite/ThemedClubPageShell";
import { getPublishedArticleBySlug } from "../../../../lib/articles/articleService";
import { ThemedSectionCard } from "../../../../components/publicSite/ThemedBuildingBlocks";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    articleSlug: string;
  }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { clubSlug, articleSlug } = await params;
  const context = await resolveClubContext(clubSlug);
  const { club, theme, footerData, navigationItems, actionItems, viewer } = context;

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
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title={article.title}
      eyebrow={`Artikel · ${article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}`}
      subtitle={article.excerpt || undefined}
      currentPath={`/${clubSlug}/artikler/${articleSlug}`}
      maxWidth="800px"
    >
      {article.heroImageUrl && (
        <div 
          style={{ 
            width: '100%', 
            height: '400px', 
            borderRadius: 'var(--club-radius)', 
            backgroundImage: `url(${article.heroImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            marginBottom: '2rem',
            border: '1px solid var(--club-line)'
          }} 
        />
      )}

      <ThemedSectionCard>
        <div style={{ color: 'var(--club-muted)', marginBottom: '2rem', fontSize: '14px', display: 'flex', gap: '1rem' }}>
          <span>Af {article.authorName || 'Redaktionen'}</span>
        </div>

        <div 
          className="prose prose-invert max-w-none" 
          style={{ color: 'var(--club-text)', lineHeight: '1.8', fontSize: '18px' }}
          dangerouslySetInnerHTML={{ __html: article.body }}
        />

        {article.tags.length > 0 && (
          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--club-line)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {article.tags.map(tag => (
                <span key={tag.slug} className="tag" style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--club-line)', color: '#dbe7ff', fontSize: '12px', fontWeight: 700 }}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </ThemedSectionCard>
    </ThemedClubPageShell>
  );
}
