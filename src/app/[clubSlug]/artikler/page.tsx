import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { getPublishedArticles, getFeaturedArticle, getArticleTags } from "../../../lib/articles/articleService";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import Link from "next/link";
import React from "react";
import ArticleSortSelect from "../../../components/articles/ArticleSortSelect";
import ArticleTagCloud from "../../../components/articles/ArticleTagCloud";
import ArticleCardTags from "../../../components/articles/ArticleCardTags";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
  searchParams: Promise<{
    tag?: string;
    q?: string;
    sort?: "newest" | "oldest" | "title";
  }>;
}

export default async function ArtiklerPage({ params, searchParams }: PageProps) {
  const { clubSlug } = await params;
  const { tag: selectedTagSlug, q: searchQuery, sort: sortOption } = await searchParams;
  const context = await resolveClubContext(clubSlug);
  const { club, theme, footerData, navigationItems, actionItems, viewer } = context;

  const isFilterActive = !!(selectedTagSlug || (searchQuery && searchQuery.trim()) || (sortOption && sortOption !== "newest"));

  const [featuredArticle, latestArticles, tags] = await Promise.all([
    getFeaturedArticle(club.id, viewer),
    getPublishedArticles(club.id, viewer, { 
      limit: 100, 
      tagSlug: selectedTagSlug,
      query: searchQuery,
      sort: sortOption
    }),
    getArticleTags(club.id, viewer),
  ]);

  // Show featured only if no search/filter is active
  const showFeatured = featuredArticle && !isFilterActive;
  
  // If we show featured, filter it out from the latest list to avoid duplication
  const latestToDisplay = (showFeatured && featuredArticle)
    ? latestArticles.filter(a => a.id !== featuredArticle.id)
    : latestArticles;

  // Helper to build URLs preserving other params
  const getFilterUrl = (newParams: Record<string, string | null>) => {
    const current = { tag: selectedTagSlug, q: searchQuery, sort: sortOption };
    const merged = { ...current, ...newParams };
    const search = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    return `/${clubSlug}/artikler?${search.toString()}`;
  };

  const clearFilterUrl = `/${clubSlug}/artikler`;

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
      subtitle="Her samler vi klubbens historier, tekniske erfaringer, flyveture, skoleflyvning og det, der gør EFK87 til mere end bare en plads at starte fra."
      currentPath={`/${clubSlug}/artikler`}
      maxWidth="1440px"
    >
      <section className="toolbar-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <article className="card toolbar-card" style={{ padding: '18px 20px', minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--club-panel)' }}>
          <label htmlFor="search-input" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--club-accent-2)', marginBottom: '8px' }}>Søg i artikler</label>
          <form action={`/${clubSlug}/artikler`} method="GET" style={{ position: 'relative' }}>
            {selectedTagSlug && <input type="hidden" name="tag" value={selectedTagSlug} />}
            {sortOption && <input type="hidden" name="sort" value={sortOption} />}
            <input 
              id="search-input"
              name="q"
              type="text"
              defaultValue={searchQuery || ''}
              placeholder="Søg efter emne, forfatter eller titel..."
              style={{ 
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '12px', 
                padding: '12px 14px', 
                borderRadius: '14px', 
                background: 'var(--club-panel-soft)', 
                border: '1px solid var(--club-line)', 
                color: '#dbe7ff', 
                fontSize: '15px',
                outline: 'none'
              }} 
            />
            <button type="submit" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
              🔎
            </button>
          </form>
        </article>
        <article className="card toolbar-card" style={{ padding: '18px 20px', minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--club-panel)' }}>
          <label style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--club-accent-2)', marginBottom: '8px' }}>Sortering</label>
          <div className="select-box" style={{ position: 'relative' }}>
             <ArticleSortSelect currentSort={sortOption || 'newest'} clubSlug={clubSlug} />
             <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>⌄</span>
          </div>
        </article>
      </section>

      <div className="artikler-layout" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
        <div className="stack" style={{ display: 'grid', gap: '20px' }}>
          {showFeatured && featuredArticle && (
            <ThemedSectionCard>
              <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '22px', letterSpacing: '-0.02em' }}>Fremhævet artikel</h2>
                <Link className="link-soft" href={`/${clubSlug}/artikler/${featuredArticle.slug}`} style={{ color: 'var(--club-accent-2)', fontSize: '14px', fontWeight: 600 }}>Åbn artikel</Link>
              </div>

              <div className="featured" style={{ display: 'grid', gridTemplateColumns: featuredArticle.heroImageUrl ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr', gap: '18px' }}>
                {featuredArticle.heroImageUrl && (
                  <div className="featured-image" style={{ minHeight: '280px', borderRadius: '20px', background: `url(${featuredArticle.heroImageUrl}) center/cover no-repeat`, border: '1px solid var(--club-line)' }}></div>
                )}
                <div className="featured-copy" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <ArticleCardTags tags={featuredArticle.tags} getFilterUrl={getFilterUrl} />

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
              <h2 style={{ fontSize: '22px', letterSpacing: '-0.02em' }}>
                {isFilterActive ? 'Søgeresultater' : 'Seneste artikler'}
              </h2>
              {isFilterActive && (
                <Link href={clearFilterUrl} className="link-soft" style={{ fontSize: '13px', color: 'var(--club-accent-2)', fontWeight: 600 }}>
                  Ryd filter
                </Link>
              )}
            </div>

            {latestToDisplay.length > 0 ? (
              <div className="article-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {latestToDisplay.map(article => (
                  <article key={article.id} className="article-card" style={{ display: 'grid', gap: '14px', padding: '16px', borderRadius: '20px', background: 'var(--club-panel-soft)', border: '1px solid var(--club-line)', minHeight: '100%' }}>
                    {article.heroImageUrl && (
                      <Link href={`/${clubSlug}/artikler/${article.slug}`}>
                        <div className="article-thumb" style={{ minHeight: '170px', borderRadius: '18px', border: '1px solid var(--club-line)', background: `url(${article.heroImageUrl}) center/cover no-repeat` }}></div>
                      </Link>
                    )}
                    <ArticleCardTags tags={article.tags} getFilterUrl={getFilterUrl} />
                    <Link href={`/${clubSlug}/artikler/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <h4 style={{ fontSize: '20px', lineHeight: '1.18' }}>{article.title}</h4>
                    </Link>
                    <p style={{ color: 'var(--club-muted)', lineHeight: '1.6', fontSize: '14px' }}>{article.excerpt}</p>
                    <div className="article-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', color: 'var(--club-muted)', fontSize: '13px' }}>
                      <span>{article.authorName || 'Redaktionen'}</span>
                      <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('da-DK') : ''}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--club-muted)' }}>
                {isFilterActive 
                  ? 'Ingen artikler matcher din søgning.' 
                  : 'Der er endnu ingen publicerede artikler.'}
              </p>
            )}
          </ThemedSectionCard>
        </div>

        <div className="stack" style={{ display: 'grid', gap: '20px' }}>
          <ThemedSectionCard>
            <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '22px' }}>Emner (Tags)</h2>
              {selectedTagSlug && (
                <Link href={getFilterUrl({ tag: null })} className="link-soft" style={{ fontSize: '13px', color: 'var(--club-accent-2)' }}>
                  Nulstil filter
                </Link>
              )}
            </div>
            <ArticleTagCloud 
              tags={tags} 
              selectedTagSlug={selectedTagSlug} 
              getFilterUrl={getFilterUrl} 
            />
          </ThemedSectionCard>
        </div>
      </div>
    </ThemedClubPageShell>
  );
}
