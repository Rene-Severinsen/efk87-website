import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { getPublishedArticles, getFeaturedArticle, getArticleCategories, getArticleTags } from "../../../lib/articles/articleService";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function ArtiklerPage({ params }: PageProps) {
  const { clubSlug } = await params;
  const context = await resolveClubContext(clubSlug);
  const { club, theme, footerData, navigationItems, actionItems, viewer } = context;

  const [featuredArticle, latestArticles, categories, tags] = await Promise.all([
    getFeaturedArticle(club.id, viewer),
    getPublishedArticles(club.id, viewer, { limit: 10 }),
    getArticleCategories(club.id),
    getArticleTags(club.id),
  ]);

  const latestWithoutFeatured = featuredArticle 
    ? latestArticles.filter(a => a.id !== featuredArticle.id)
    : latestArticles;

  return (
    <ThemedClubPageShell
      clubSlug={clubSlug}
      clubName={club.settings?.shortName || club.name}
      clubDisplayName={club.settings?.displayName || club.name}
      theme={theme}
      footerData={footerData}
      navigationItems={navigationItems}
      actionItems={actionItems}
      title="Artikler fra livet i klubben."
      eyebrow="✍️ Redaktionelt univers · Nyheder, ture, teknik og klubhistorier"
      subtitle="Her samler vi klubbens historier, tekniske erfaringer, flyveture, skoleflyvning og det, der gør EFK87 til mere end bare en plads at starte fra."
      currentPath={`/${clubSlug}/artikler`}
      maxWidth="1440px"
    >
      <section className="toolbar" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <article className="card toolbar-card" style={{ padding: '18px 20px', minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--club-panel)' }}>
          <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--club-accent-2)', marginBottom: '8px' }}>Søg i artikler</label>
          <div className="search-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)', color: '#dbe7ff', fontSize: '15px' }}>
            Søg efter emne, forfatter eller titel <span>🔎</span>
          </div>
        </article>
        <article className="card toolbar-card" style={{ padding: '18px 20px', minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--club-panel)' }}>
          <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--club-accent-2)', marginBottom: '8px' }}>Kategori</label>
          <div className="select-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)', color: '#dbe7ff', fontSize: '15px' }}>
            Alle kategorier <span>⌄</span>
          </div>
        </article>
        <article className="card toolbar-card" style={{ padding: '18px 20px', minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--club-panel)' }}>
          <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--club-accent-2)', marginBottom: '8px' }}>Sortering</label>
          <div className="select-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 14px', borderRadius: '14px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)', color: '#dbe7ff', fontSize: '15px' }}>
            Nyeste først <span>⌄</span>
          </div>
        </article>
      </section>

      <div className="layout" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="stack" style={{ display: 'grid', gap: '20px', gridColumn: 'span 2' }}>
          {featuredArticle && (
            <ThemedSectionCard>
              <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '22px', letterSpacing: '-0.02em' }}>Fremhævet artikel</h2>
                <Link className="link-soft" href={`/${clubSlug}/artikler/${featuredArticle.slug}`} style={{ color: 'var(--club-accent-2)', fontSize: '14px', fontWeight: 600 }}>Åbn artikel</Link>
              </div>

              <div className="featured" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '18px' }}>
                <div className="featured-image" style={{ minHeight: '280px', borderRadius: '20px', background: featuredArticle.heroImageUrl ? `url(${featuredArticle.heroImageUrl}) center/cover no-repeat` : 'var(--club-panel-soft)', border: '1px solid var(--club-line)' }}></div>
                <div className="featured-copy" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="tag-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {featuredArticle.categoryName && <span className="tag" style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--club-line)', color: '#dbe7ff', fontSize: '12px', fontWeight: 700 }}>{featuredArticle.categoryName}</span>}
                    {featuredArticle.tags.map(tag => (
                      <span key={tag.slug} className="tag" style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--club-line)', color: '#dbe7ff', fontSize: '12px', fontWeight: 700 }}>{tag.name}</span>
                    ))}
                  </div>

                  <div className="meta" style={{ color: 'var(--club-muted)', fontSize: '14px' }}>
                    Af {featuredArticle.authorName || 'Redaktionen'} · {featuredArticle.publishedAt ? new Date(featuredArticle.publishedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </div>

                  <h3 style={{ fontSize: '30px', lineHeight: '1.08', letterSpacing: '-0.03em' }}>{featuredArticle.title}</h3>

                  <p style={{ color: '#d7e2fb', lineHeight: '1.65', fontSize: '15px' }}>
                    {featuredArticle.excerpt}
                  </p>

                  <div className="hero-actions" style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                    <Link className="pill primary" href={`/${clubSlug}/artikler/${featuredArticle.slug}`} style={{ padding: '12px 16px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(110,231,183,0.20), rgba(125,211,252,0.24))', border: '1px solid rgba(110,231,183,0.28)', color: 'var(--club-text)', fontWeight: 600, fontSize: '14px' }}>Læs hele artiklen</Link>
                  </div>
                </div>
              </div>
            </ThemedSectionCard>
          )}

          <ThemedSectionCard>
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '22px', letterSpacing: '-0.02em' }}>Seneste artikler</h2>
            </div>

            {latestWithoutFeatured.length > 0 ? (
              <div className="article-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {latestWithoutFeatured.map(article => (
                  <Link key={article.id} href={`/${clubSlug}/artikler/${article.slug}`}>
                    <article className="article-card" style={{ display: 'grid', gap: '14px', padding: '16px', borderRadius: '20px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)', minHeight: '100%' }}>
                      <div className="article-thumb" style={{ minHeight: '170px', borderRadius: '18px', border: '1px solid var(--club-line)', background: article.heroImageUrl ? `url(${article.heroImageUrl}) center/cover no-repeat` : 'var(--club-panel-soft)' }}></div>
                      <div className="tag-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {article.categoryName && <span className="tag" style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--club-line)', color: '#dbe7ff', fontSize: '12px', fontWeight: 700 }}>{article.categoryName}</span>}
                      </div>
                      <h4 style={{ fontSize: '20px', lineHeight: '1.18' }}>{article.title}</h4>
                      <p style={{ color: 'var(--club-muted)', lineHeight: '1.6', fontSize: '14px' }}>{article.excerpt}</p>
                      <div className="article-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', color: 'var(--club-muted)', fontSize: '13px' }}>
                        <span>{article.authorName || 'Redaktionen'}</span>
                        <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('da-DK') : ''}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--club-muted)' }}>Der er endnu ingen publicerede artikler.</p>
            )}
          </ThemedSectionCard>
        </div>

        <div className="stack" style={{ display: 'grid', gap: '20px' }}>
          <ThemedSectionCard>
            <div className="section-head">
              <h2 style={{ fontSize: '22px' }}>Kategorier</h2>
            </div>
            <div className="side-list" style={{ display: 'grid', gap: '12px' }}>
              {categories.map(category => (
                <div key={category.id} className="list-item" style={{ padding: '14px', borderRadius: '18px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)' }}>
                  <h4 style={{ fontSize: '16px', lineHeight: '1.3', marginBottom: '8px' }}>{category.name}</h4>
                  <p style={{ color: 'var(--club-muted)', lineHeight: '1.55', fontSize: '13px' }}>{category.description}</p>
                </div>
              ))}
            </div>
          </ThemedSectionCard>

          <ThemedSectionCard>
            <div className="section-head">
              <h2 style={{ fontSize: '22px' }}>Mest brugte tags</h2>
            </div>
            <div className="tag-cloud" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {tags.map(tag => (
                <span key={tag.id} className="cloud-tag md" style={{ padding: '8px 12px', borderRadius: '999px', background: 'rgba(125,211,252,0.10)', border: '1px solid rgba(125,211,252,0.20)', color: '#dff2ff', fontWeight: 700, fontSize: '15px' }}>
                  {tag.name}
                </span>
              ))}
            </div>
          </ThemedSectionCard>

          <ThemedSectionCard>
            <div className="section-head">
              <h2 style={{ fontSize: '22px' }}>Redaktionelt fokus</h2>
            </div>
            <div className="side-list" style={{ display: 'grid', gap: '12px' }}>
              <div className="list-item" style={{ padding: '14px', borderRadius: '18px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)' }}>
                <h4 style={{ fontSize: '16px', lineHeight: '1.3', marginBottom: '8px' }}>Seneste redaktionelle note</h4>
                <p style={{ color: 'var(--club-muted)', lineHeight: '1.55', fontSize: '13px' }}>Vi prioriterer lige nu artikler, der både inspirerer nye medlemmer og giver erfarne piloter konkrete erfaringer at tage med videre.</p>
              </div>
              <div className="list-item" style={{ padding: '14px', borderRadius: '18px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)' }}>
                <h4 style={{ fontSize: '16px', lineHeight: '1.3', marginBottom: '8px' }}>Vil du bidrage?</h4>
                <p style={{ color: 'var(--club-muted)', lineHeight: '1.55', fontSize: '13px' }}>Brugere med rettighed kan indsende artikler om ture, teknik, flyveskole og kluboplevelser til publicering på siden.</p>
              </div>
            </div>
          </ThemedSectionCard>
        </div>
      </div>
    </ThemedClubPageShell>
  );
}
