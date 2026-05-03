import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import { getPublishedArticles, getFeaturedArticle, getArticleTags } from "../../../lib/articles/articleService";
import { ThemedSectionCard } from "../../../components/publicSite/ThemedBuildingBlocks";
import Link from "next/link";
import React from "react";
import ArticleSortSelect from "../../../components/articles/ArticleSortSelect";
import ArticleTagCloud from "../../../components/articles/ArticleTagCloud";
import ArticleCardTags from "../../../components/articles/ArticleCardTags";
import { publicRoutes } from "../../../lib/publicRoutes";

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
  const { club, theme, footerData, navigationItems, actionItems, viewer, publicSettings } = context;

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
    return `${publicRoutes.articles(clubSlug)}?${search.toString()}`;
  };

  const clearFilterUrl = publicRoutes.articles(clubSlug);

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
      title="Artikler fra livet i klubben."
      subtitle="Her samler vi klubbens historier, tekniske erfaringer, flyveture, skoleflyvning og det, der gør EFK87 til mere end bare en plads at starte fra."
      currentPath={publicRoutes.articles(clubSlug)}
      maxWidth="1440px"
    >
      <section className="toolbar-grid grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <article className="card toolbar-card p-4 sm:p-5 min-h-[84px] flex flex-col justify-center bg-[var(--club-panel)] rounded-2xl border border-[var(--club-line)]">
          <label htmlFor="search-input" className="text-[10px] sm:text-xs uppercase tracking-widest color-[var(--club-accent-2)] mb-2 opacity-80">Søg i artikler</label>
          <form action={publicRoutes.articles(clubSlug)} method="GET" className="relative">
            {selectedTagSlug && <input type="hidden" name="tag" value={selectedTagSlug} />}
            {sortOption && <input type="hidden" name="sort" value={sortOption} />}
            <input 
              id="search-input"
              name="q"
              type="text"
              defaultValue={searchQuery || ''}
              placeholder="Søg efter emne, forfatter eller titel..."
              className="w-full appearance-none flex items-center justify-between gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-[14px] bg-[var(--club-panel-soft)] border border-[var(--club-line)] text-[var(--club-text)] text-sm sm:text-[15px] outline-none focus:border-[var(--public-primary)]/40 focus:ring-2 focus:ring-[var(--public-primary)]/10 transition-all placeholder:text-[var(--public-text-soft)]"
            />
            <button type="submit" className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer opacity-70 hover:opacity-100">
              🔎
            </button>
          </form>
        </article>
        <article className="card toolbar-card p-4 sm:p-5 min-h-[84px] flex flex-col justify-center bg-[var(--club-panel)] rounded-2xl border border-[var(--club-line)]">
          <label className="text-[10px] sm:text-xs uppercase tracking-widest color-[var(--club-accent-2)] mb-2 opacity-80">Sortering</label>
          <div className="select-box relative">
             <ArticleSortSelect currentSort={sortOption || 'newest'} clubSlug={clubSlug} />
             <span className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">⌄</span>
          </div>
        </article>
      </section>

      <div className="artikler-layout grid grid-cols-1 gap-5 mt-5">
        <div className="stack grid gap-5">
          {showFeatured && featuredArticle && (
            <ThemedSectionCard className="p-4 sm:p-6">
              <div className="section-head flex justify-between items-center mb-4 sm:mb-5">
                <h2 className="text-xl sm:text-[22px] tracking-tight">Fremhævet artikel</h2>
                <Link className="link-soft text-sm font-semibold text-[var(--club-accent-2)]" href={publicRoutes.article(clubSlug, featuredArticle.slug)}>Åbn artikel</Link>
              </div>

              <div className={`featured grid gap-5 ${featuredArticle.heroImageUrl ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                {featuredArticle.heroImageUrl && (
                  <div className="featured-image min-h-[200px] sm:min-h-[280px] rounded-[18px] sm:rounded-[20px] bg-center bg-cover bg-no-repeat border border-[var(--club-line)]" style={{ backgroundImage: `url(${featuredArticle.heroImageUrl})` }}></div>
                )}
                <div className="featured-copy flex flex-col gap-4">
                  <ArticleCardTags tags={featuredArticle.tags} getFilterUrl={getFilterUrl} />

                  <div className="meta text-xs sm:text-sm text-[var(--club-muted)]">
                    Af {featuredArticle.authorName || 'Redaktionen'} · {featuredArticle.publishedAt ? new Date(featuredArticle.publishedAt).toLocaleDateString('da-DK', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                  </div>

                  <h3 className="text-2xl sm:text-3xl leading-[1.1] tracking-tight">{featuredArticle.title}</h3>

                  <p className="text-[var(--club-text)] opacity-90 leading-relaxed text-sm sm:text-[15px]">
                    {featuredArticle.excerpt}
                  </p>

                  <div className="hero-actions flex gap-3 mt-auto pt-2">
                    <Link className="pill primary inline-flex items-center px-4 py-3 rounded-xl bg-[var(--public-primary-soft)] border border-[var(--public-primary)]/20 text-[var(--club-text)] font-semibold text-sm transition-all hover:scale-[1.02]" href={publicRoutes.article(clubSlug, featuredArticle.slug)}>Læs hele artiklen</Link>
                  </div>
                </div>
              </div>
            </ThemedSectionCard>
          )}

          <ThemedSectionCard className="p-4 sm:p-6">
            <div className="section-head flex justify-between items-center mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-[22px] tracking-tight">
                {isFilterActive ? 'Søgeresultater' : 'Seneste artikler'}
              </h2>
              {isFilterActive && (
                <Link href={clearFilterUrl} className="link-soft text-xs sm:text-[13px] text-[var(--club-accent-2)] font-semibold">
                  Ryd filter
                </Link>
              )}
            </div>

            {latestToDisplay.length > 0 ? (
              <div className="article-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestToDisplay.map(article => (
                  <article key={article.id} className="article-card flex flex-col gap-3.5 p-4 rounded-[18px] sm:rounded-[20px] bg-[var(--club-panel-soft)] border border-[var(--club-line)] hover:border-[var(--club-line-bright)] transition-colors">
                    {article.heroImageUrl && (
                      <Link href={publicRoutes.article(clubSlug, article.slug)}>
                        <div className="article-thumb min-h-[160px] rounded-2xl border border-[var(--club-line)] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(${article.heroImageUrl})` }}></div>
                      </Link>
                    )}
                    <ArticleCardTags tags={article.tags} getFilterUrl={getFilterUrl} />
                    <Link href={publicRoutes.article(clubSlug, article.slug)} className="text-inherit no-underline group">
                      <h4 className="text-lg sm:text-xl leading-[1.2] group-hover:text-[var(--club-accent)] transition-colors">{article.title}</h4>
                    </Link>
                    <p className="text-[var(--club-muted)] leading-relaxed text-sm line-clamp-3">{article.excerpt}</p>
                    <div className="article-footer flex justify-between items-center mt-auto pt-2 text-[13px] text-[var(--club-muted)]">
                      <span>{article.authorName || 'Redaktionen'}</span>
                      <span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('da-DK') : ''}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-[var(--club-muted)]">
                {isFilterActive 
                  ? 'Ingen artikler matcher din søgning.' 
                  : 'Der er endnu ingen publicerede artikler.'}
              </p>
            )}
          </ThemedSectionCard>
        </div>

        <div className="stack grid gap-5">
          <ThemedSectionCard className="p-4 sm:p-6">
            <div className="section-head flex justify-between items-center mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-[22px]">Emner (Tags)</h2>
              {selectedTagSlug && (
                <Link href={getFilterUrl({ tag: null })} className="link-soft text-[13px] text-[var(--club-accent-2)]">
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
