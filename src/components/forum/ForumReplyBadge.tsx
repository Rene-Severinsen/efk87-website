import React from "react";
import { ForumBadge } from "../../lib/forum/forumHelpers";

export default function ForumReplyBadge({ badge }: { badge: ForumBadge }) {
  const baseStyle: React.CSSProperties = {
    display: "inline-flex",
    minHeight: "26px",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "1px",
    borderStyle: "solid",
    borderRadius: "999px",
    padding: "4px 10px",
    fontSize: "0.78rem",
    fontWeight: 900,
    letterSpacing: "0.03em",
    lineHeight: 1,
    whiteSpace: "nowrap",
    textDecoration: "none",
    textTransform: "uppercase",
  };

  const colorStyle: Record<ForumBadge["color"], React.CSSProperties> = {
    green: {
      color: "var(--public-success)",
      backgroundColor: "var(--public-success-soft)",
      borderColor: "var(--public-success-border)",
    },
    blue: {
      color: "var(--public-info)",
      backgroundColor: "var(--public-info-soft)",
      borderColor: "var(--public-info-border)",
    },
    cyan: {
      color: "var(--public-primary)",
      backgroundColor: "var(--public-primary-soft)",
      borderColor: "var(--public-info-border)",
    },
    amber: {
      color: "var(--public-warning)",
      backgroundColor: "var(--public-warning-soft)",
      borderColor: "var(--public-warning-border)",
    },
  };

  return (
    <span className={`forum-reply-badge forum-reply-badge--${badge.color}`} style={{ ...baseStyle, ...colorStyle[badge.color] }}>
      {badge.text}
    </span>
  );
}
