import { resolveClubContext } from "../../../lib/publicSite/publicPageRoute";
import ThemedClubPageShell from "../../../components/publicSite/ThemedClubPageShell";
import {
  getPublishedArticles,
  getFeaturedArticle,
  getArticleTags,
} from "../../../lib/articles/articleService";
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
  const {
    tag: selectedTagSlug,
    q: searchQuery,
    sort: sortOption,
  } = await searchParams;

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

  const isFilterActive = !!(
      selectedTagSlug ||
      (searchQuery && searchQuery.trim()) ||
      (sortOption && sortOption !== "newest")
  );

  const [featuredArticle, latestArticles, tags] = await Promise.all([
    getFeaturedArticle(club.id, viewer),
    getPublishedArticles(club.id, viewer, {
      limit: 100,
      tagSlug: selectedTagSlug,
      query: searchQuery,
      sort: sortOption,
    }),
    getArticleTags(club.id, viewer),
  ]);

  const showFeatured = featuredArticle && !isFilterActive;

  const latestToDisplay =
      showFeatured && featuredArticle
          ? latestArticles.filter((article) => article.id !== featuredArticle.id)
          : latestArticles;

  const getFilterUrl = (newParams: Record<string, string | null>) => {
    const current = {
      tag: selectedTagSlug,
      q: searchQuery,
      sort: sortOption,
    };

    const merged = { ...current, ...newParams };
    const search = new URLSearchParams();

    Object.entries(merged).forEach(([key, value]) => {
      if (value) {
        search.set(key, value);
      }
    });

    const queryString = search.toString();
    return queryString
        ? `${publicRoutes.articles(clubSlug)}?${queryString}`
        : publicRoutes.articles(clubSlug);
  };

  const clearFilterUrl = publicRoutes.articles(clubSlug);

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
          title="Artikler fra livet i klubben."
          subtitle="Her samler vi klubbens historier, tekniske erfaringer, flyveture, skoleflyvning og det, der gør EFK87 til mere end bare en plads at starte fra."
          currentPath={publicRoutes.articles(clubSlug)}
          maxWidth="1120px"
      >
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-5 shadow-[var(--public-shadow)]">
            <label
                htmlFor="search-input"
                className="public-label uppercase tracking-widest"
            >
              Søg i artikler
            </label>

            <form action={publicRoutes.articles(clubSlug)} method="GET" className="relative">
              {selectedTagSlug && (
                  <input type="hidden" name="tag" value={selectedTagSlug} />
              )}
              {sortOption && <input type="hidden" name="sort" value={sortOption} />}

              <input
                  id="search-input"
                  name="q"
                  type="text"
                  defaultValue={searchQuery || ""}
                  placeholder="Søg efter emne, forfatter eller titel..."
                  className="public-input pr-12"
              />

              <button
                  type="submit"
                  aria-label="Søg"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-[var(--public-primary)] transition hover:bg-[var(--public-primary-soft)]"
              >
                🔎
              </button>
            </form>
          </article>

          <article className="rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-card)] p-5 shadow-[var(--public-shadow)]">
            <label className="public-label uppercase tracking-widest">
              Sortering
            </label>

            <div className="relative">
              <ArticleSortSelect
                  currentSort={sortOption || "newest"}
                  clubSlug={clubSlug}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--public-text-muted)]">
              ⌄
            </span>
            </div>
          </article>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6">
          {showFeatured && featuredArticle && (
              <ThemedSectionCard className="p-5 sm:p-7">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold tracking-tight text-[var(--public-text)]">
                    Fremhævet artikel
                  </h2>

                  <Link
                      className="public-link font-semibold"
                      href={publicRoutes.article(clubSlug, featuredArticle.slug)}
                  >
                    Åbn artikel
                  </Link>
                </div>

                <div
                    className={`grid gap-6 ${
                        featuredArticle.heroImageUrl
                            ? "grid-cols-1 lg:grid-cols-[1fr_0.9fr]"
                            : "grid-cols-1"
                    }`}
                >
                  {featuredArticle.heroImageUrl && (
                      <Link
                          href={publicRoutes.article(clubSlug, featuredArticle.slug)}
                          className="block overflow-hidden rounded-2xl border border-[var(--public-card-border)]"
                      >
                        <img
                            src={featuredArticle.heroImageUrl}
                            alt={featuredArticle.title}
                            className="h-[220px] w-full object-cover transition duration-300 hover:scale-[1.02]"
                        />
                      </Link>
                  )}

                  <div className="flex min-w-0 flex-col gap-4">
                    <ArticleCardTags
                        tags={featuredArticle.tags}
                        getFilterUrl={getFilterUrl}
                    />

                    <div className="text-sm text-[var(--public-text-muted)]">
                      Af {featuredArticle.authorName || "Redaktionen"}
                      {featuredArticle.publishedAt
                          ? ` · ${new Date(featuredArticle.publishedAt).toLocaleDateString(
                              "da-DK",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                          )}`
                          : ""}
                    </div>

                    <Link
                        href={publicRoutes.article(clubSlug, featuredArticle.slug)}
                        className="group"
                    >
                      <h3 className="text-2xl font-bold leading-tight tracking-tight text-[var(--public-text)] transition-colors group-hover:text-[var(--public-primary)] sm:text-3xl">
                        {featuredArticle.title}
                      </h3>
                    </Link>

                    {featuredArticle.excerpt && (
                        <p className="text-base leading-relaxed text-[var(--public-text-muted)]">
                          {featuredArticle.excerpt}
                        </p>
                    )}

                    <div className="mt-auto pt-2">
                      <Link
                          className="public-primary-button px-6"
                          href={publicRoutes.article(clubSlug, featuredArticle.slug)}
                      >
                        Læs hele artiklen
                      </Link>
                    </div>
                  </div>
                </div>
              </ThemedSectionCard>
          )}

          <ThemedSectionCard className="p-5 sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold tracking-tight text-[var(--public-text)]">
                {isFilterActive ? "Søgeresultater" : "Seneste artikler"}
              </h2>

              {isFilterActive && (
                  <Link href={clearFilterUrl} className="public-link font-semibold">
                    Ryd filter
                  </Link>
              )}
            </div>

            {latestToDisplay.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {latestToDisplay.map((article) => (
                      <article
                          key={article.id}
                          className="flex min-h-full flex-col gap-4 rounded-3xl border border-[var(--public-card-border)] bg-[var(--public-surface)] p-4 transition hover:border-[var(--public-primary)] hover:bg-[var(--public-primary-soft)]"
                      >
                        {article.heroImageUrl && (
                            <Link
                                href={publicRoutes.article(clubSlug, article.slug)}
                                className="block overflow-hidden rounded-2xl border border-[var(--public-card-border)]"
                            >
                              <img
                                  src={article.heroImageUrl}
                                  alt={article.title}
                                  className="h-[160px] w-full object-cover transition duration-300 hover:scale-[1.02]"
                              />
                            </Link>
                        )}

                        <ArticleCardTags tags={article.tags} getFilterUrl={getFilterUrl} />

                        <Link
                            href={publicRoutes.article(clubSlug, article.slug)}
                            className="group"
                        >
                          <h3 className="text-lg font-bold leading-tight text-[var(--public-text)] transition-colors group-hover:text-[var(--public-primary)]">
                            {article.title}
                          </h3>
                        </Link>

                        {article.excerpt && (
                            <p className="line-clamp-3 text-sm leading-relaxed text-[var(--public-text-muted)]">
                              {article.excerpt}
                            </p>
                        )}

                        <div className="mt-auto flex items-center justify-between gap-4 pt-3 text-sm text-[var(--public-text-muted)]">
                    <span className="truncate">
                      {article.authorName || "Redaktionen"}
                    </span>
                          <span className="shrink-0">
                      {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString("da-DK")
                          : ""}
                    </span>
                        </div>
                      </article>
                  ))}
                </div>
            ) : (
                <p className="text-[var(--public-text-muted)]">
                  {isFilterActive
                      ? "Ingen artikler matcher din søgning."
                      : "Der er endnu ingen publicerede artikler."}
                </p>
            )}
          </ThemedSectionCard>

          <ThemedSectionCard className="p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-[var(--public-text)]">
                Emner
              </h2>

              {selectedTagSlug && (
                  <Link
                      href={getFilterUrl({ tag: null })}
                      className="public-link font-semibold"
                  >
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
      </ThemedClubPageShell>
  );
}