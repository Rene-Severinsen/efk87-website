"use client";

import React, { useMemo, useRef, useState } from "react";
import { ArticleTag } from "../../../generated/prisma";

interface ArticleTagPickerProps {
  tags: ArticleTag[];
  selectedTagIds?: string[];
}

function normalizeSearchValue(value: string): string {
  return value.trim().toLowerCase();
}

export default function ArticleTagPicker({
  tags,
  selectedTagIds = [],
}: ArticleTagPickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedTagIds);

  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedIds.includes(tag.id)),
    [selectedIds, tags],
  );

  const availableTags = useMemo(() => {
    const normalizedQuery = normalizeSearchValue(query);

    return tags
      .filter((tag) => !selectedIds.includes(tag.id))
      .filter((tag) => {
        if (!normalizedQuery) {
          return true;
        }

        return (
          tag.name.toLowerCase().includes(normalizedQuery) ||
          tag.slug.toLowerCase().includes(normalizedQuery)
        );
      })
      .slice(0, 8);
  }, [query, selectedIds, tags]);

  function addTag(tagId: string) {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(tagId)) {
        return currentIds;
      }

      return [...currentIds, tagId];
    });

    setQuery("");
    inputRef.current?.focus();
  }

  function removeTag(tagId: string) {
    setSelectedIds((currentIds) => currentIds.filter((id) => id !== tagId));
    inputRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      const firstMatch = availableTags[0];
      if (firstMatch) {
        addTag(firstMatch.id);
      }

      return;
    }

    if (event.key === "Backspace" && !query && selectedIds.length > 0) {
      event.preventDefault();
      removeTag(selectedIds[selectedIds.length - 1]);
    }
  }

  return (
    <div>
      {selectedIds.map((tagId) => (
        <input key={tagId} type="hidden" name="tagIds" value={tagId} />
      ))}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "8px",
          minHeight: "46px",
          border: "1px solid var(--admin-card-border)",
          borderRadius: "12px",
          background: "var(--admin-surface)",
          padding: "8px",
        }}
      >
        {selectedTags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => removeTag(tag.id)}
            className="admin-badge admin-badge-info"
            title="Klik for at fjerne tag"
            style={{
              border: "none",
              cursor: "pointer",
            }}
          >
            {tag.name} ×
          </button>
        ))}

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length > 0 ? "Søg flere tags..." : "Begynd at taste..."}
          className="admin-input"
          style={{
            flex: "1 1 180px",
            minWidth: "160px",
            border: "none",
            boxShadow: "none",
            background: "transparent",
            padding: "6px 4px",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "8px",
          border: "1px solid var(--admin-card-border)",
          borderRadius: "12px",
          background: "var(--admin-surface)",
          overflow: "hidden",
        }}
      >
        {availableTags.length > 0 ? (
          availableTags.map((tag, index) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag.id)}
              className="admin-link"
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                border: "none",
                borderBottom:
                  index === availableTags.length - 1
                    ? "none"
                    : "1px solid var(--admin-card-border)",
                background: "transparent",
                padding: "10px 12px",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span>{tag.name}</span>
              <span className="admin-muted text-xs">{tag.slug}</span>
            </button>
          ))
        ) : (
          <div className="admin-form-help" style={{ padding: "10px 12px" }}>
            {query ? "Ingen matchende tags." : "Vælg eksisterende tags ved at søge eller trykke Enter."}
          </div>
        )}
      </div>

      <p className="admin-form-help" style={{ marginTop: "8px" }}>
        Skriv for at søge. Tryk Enter for at vælge første match. Klik på et valgt tag for at fjerne det.
      </p>
    </div>
  );
}
