import fs from "fs";
import path from "path";

const root = process.cwd();

function writeFile(relativePath, content) {
    const absolutePath = path.join(root, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content.trimStart(), "utf8");
    console.log(`Wrote ${relativePath}`);
}

writeFile(
    "src/components/admin/articles/ArticleForm.tsx",
    `
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ArticleStatus, PublicSurfaceVisibility, ArticleTag, Article } from "../../../generated/prisma";
import Link from "next/link";
import { ClubMediaAssetDTO } from "../../../lib/media/mediaTypes";
import MediaUrlPicker from "../media/MediaUrlPicker";

const ArticleRichTextEditor = dynamic(() => import("./ArticleRichTextEditor"), {
  ssr: false,
});

interface ArticleWithTags extends Article {
  tags?: { tagId: string }[];
}

interface ArticleFormProps {
  clubSlug: string;
  initialData?: ArticleWithTags;
  tags: ArticleTag[];
  action: (formData: FormData) => Promise<void>;
  mediaAssets?: ClubMediaAssetDTO[];
}

export default function ArticleForm({
  clubSlug,
  initialData,
  tags,
  action,
  mediaAssets = [],
}: ArticleFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [bodyContent, setBodyContent] = React.useState(initialData?.body || "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.set("body", bodyContent);

    try {
      await action(formData);
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      }

      console.error(error);
      alert(error instanceof Error ? error.message : "Der skete en fejl");
      setIsPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="admin-article-form"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "24px",
      }}
    >
      <div
        className="admin-article-form-main"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          className="admin-card"
          style={{
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Titel
            </label>
            <input
              name="title"
              type="text"
              required
              defaultValue={initialData?.title}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Uddrag (Excerpt)
            </label>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={initialData?.excerpt ?? undefined}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-y"
              placeholder="Giv en kort introduktion til artiklen..."
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Indhold
            </label>
            <ArticleRichTextEditor
              content={bodyContent}
              onChange={setBodyContent}
            />
          </div>
        </div>
      </div>

      <div
        className="admin-article-form-sidebar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          className="admin-card"
          style={{
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Status
            </label>
            <select
              name="status"
              defaultValue={initialData?.status || ArticleStatus.DRAFT}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            >
              <option value={ArticleStatus.DRAFT}>Draft</option>
              <option value={ArticleStatus.PUBLISHED}>Published</option>
              <option value={ArticleStatus.ARCHIVED}>Archived</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Synlighed
            </label>
            <select
              name="visibility"
              defaultValue={initialData?.visibility || PublicSurfaceVisibility.PUBLIC}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #d9d9d9",
              }}
            >
              <option value={PublicSurfaceVisibility.PUBLIC}>Public</option>
              <option value={PublicSurfaceVisibility.MEMBERS_ONLY}>Members Only</option>
            </select>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              <input
                name="isFeatured"
                type="checkbox"
                value="true"
                defaultChecked={initialData?.isFeatured}
              />
              Fremhævet artikel
            </label>
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Tags
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                maxHeight: "150px",
                overflowY: "auto",
                padding: "8px",
                border: "1px solid #d9d9d9",
                borderRadius: "4px",
              }}
            >
              {tags.map((tag) => (
                <label
                  key={tag.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.875rem",
                  }}
                >
                  <input
                    name="tagIds"
                    type="checkbox"
                    value={tag.id}
                    defaultChecked={initialData?.tags?.some((articleTag) => articleTag.tagId === tag.id)}
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div
          className="admin-card"
          style={{
            padding: "24px",
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Forfatter (Navn)
            </label>
            <input
              name="authorName"
              type="text"
              defaultValue={initialData?.authorName ?? undefined}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Forfatter er server-bestemt og kan ikke ændres her.
            </p>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <MediaUrlPicker
              name="heroImageUrl"
              label="Hero image"
              value={initialData?.heroImageUrl ?? null}
              assets={mediaAssets}
              placeholder="Vælg fra Media eller indsæt URL"
            />
            <p
              style={{
                fontSize: "0.75rem",
                color: "#666",
                marginTop: "8px",
              }}
            >
              Dette billede vises øverst i artiklen.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <button
            type="submit"
            disabled={isPending}
            className="admin-btn admin-btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px",
            }}
          >
            {isPending ? "Gemmer..." : "Gem artikel"}
          </button>

          <Link
            href={\`/\${clubSlug}/admin/artikler\`}
            className="admin-btn"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px",
            }}
          >
            Tilbage til artikler
          </Link>
        </div>
      </div>
    </form>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/artikler/ny/page.tsx",
    `
import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../components/admin/AdminShell";
import ArticleForm from "../../../../../components/admin/articles/ArticleForm";
import { getAdminArticleFormOptions } from "../../../../../lib/admin/articleAdminService";
import { createArticleAction } from "../../../../../lib/admin/articleActions";
import { listClubMediaAssets } from "../../../../../lib/media/mediaStorageService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/artikler/ny\`,
  );

  const [{ tags }, mediaAssets] = await Promise.all([
    getAdminArticleFormOptions(club.id),
    listClubMediaAssets(club.id),
  ]);

  const boundAction = createArticleAction.bind(null, clubSlug);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          Opret ny artikel
        </h1>
        <p style={{ color: "#666", marginTop: "4px" }}>
          Udfyld felterne for at oprette en ny artikel.
        </p>
      </div>

      <ArticleForm
        clubSlug={clubSlug}
        tags={tags}
        action={boundAction}
        mediaAssets={mediaAssets}
      />
    </AdminShell>
  );
}
`,
);

writeFile(
    "src/app/[clubSlug]/admin/artikler/[articleId]/rediger/page.tsx",
    `
import { notFound } from "next/navigation";
import { requireClubBySlug, TenancyError } from "../../../../../../lib/tenancy/tenantService";
import { requireClubAdminForClub } from "../../../../../../lib/auth/adminAccessGuards";
import AdminShell from "../../../../../../components/admin/AdminShell";
import ArticleForm from "../../../../../../components/admin/articles/ArticleForm";
import { getAdminArticleById, getAdminArticleFormOptions } from "../../../../../../lib/admin/articleAdminService";
import { updateArticleAction } from "../../../../../../lib/admin/articleActions";
import { listClubMediaAssets } from "../../../../../../lib/media/mediaStorageService";

interface PageProps {
  params: Promise<{
    clubSlug: string;
    articleId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clubSlug, articleId } = await params;

  let club;

  try {
    club = await requireClubBySlug(clubSlug);
  } catch (error) {
    if (error instanceof TenancyError) {
      notFound();
    }

    throw error;
  }

  const viewer = await requireClubAdminForClub(
    club.id,
    clubSlug,
    \`/\${clubSlug}/admin/artikler/\${articleId}/rediger\`,
  );

  const [article, { tags }, mediaAssets] = await Promise.all([
    getAdminArticleById(club.id, articleId),
    getAdminArticleFormOptions(club.id),
    listClubMediaAssets(club.id),
  ]);

  if (!article) {
    notFound();
  }

  const boundAction = updateArticleAction.bind(null, clubSlug, articleId);

  return (
    <AdminShell
      clubSlug={clubSlug}
      clubName={club.name}
      userName={viewer.name || viewer.email || "Admin"}
      userRole={viewer.clubRole}
      userEmail={viewer.email}
    >
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>
          Rediger artikel
        </h1>
        <p style={{ color: "#666", marginTop: "4px" }}>
          Opdater artiklens indhold og indstillinger.
        </p>
      </div>

      <ArticleForm
        clubSlug={clubSlug}
        initialData={article}
        tags={tags}
        action={boundAction}
        mediaAssets={mediaAssets}
      />
    </AdminShell>
  );
}
`,
);

console.log("");
console.log("Done.");
console.log("Next:");
console.log("npm run check:public-theme");
console.log("npx tsc --noEmit");
console.log("npm run build");