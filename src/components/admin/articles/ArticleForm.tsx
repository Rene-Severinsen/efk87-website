"use client";

import React from "react";
import dynamic from "next/dynamic";
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
  const [bodyContent, setBodyContent] = React.useState(initialData?.body || "");

  async function submitAction(formData: FormData) {
    formData.set("body", bodyContent);
    await action(formData);
  }

  return (
    <form
      action={submitAction}
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
          className="admin-card p-6"
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
                border: "1px solid var(--admin-card-border)",
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
              Uddrag
            </label>
            <textarea
              name="excerpt"
              rows={3}
              defaultValue={initialData?.excerpt ?? undefined}
              className="admin-textarea resize-y"
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
          className="admin-card p-6"
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
                border: "1px solid var(--admin-card-border)",
              }}
            >
              <option value={ArticleStatus.DRAFT}>Kladde</option>
              <option value={ArticleStatus.PUBLISHED}>Publiceret</option>
              <option value={ArticleStatus.ARCHIVED}>Arkiveret</option>
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
                border: "1px solid var(--admin-card-border)",
              }}
            >
              <option value={PublicSurfaceVisibility.PUBLIC}>Offentlig</option>
              <option value={PublicSurfaceVisibility.MEMBERS_ONLY}>Kun medlemmer</option>
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
          className="admin-card p-6"
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
                border: "1px solid var(--admin-card-border)",
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
          className="admin-card p-6"
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
              className="admin-input cursor-not-allowed opacity-70"
            />
            <p className="admin-form-help mt-1 text-xs">
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
              className="admin-form-help mt-1 text-xs"
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
            className="admin-btn admin-btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px",
            }}
          >
            Gem artikel
          </button>

          <Link
            href={`/${clubSlug}/admin/artikler`}
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
