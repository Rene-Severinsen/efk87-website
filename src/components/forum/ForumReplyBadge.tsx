import React from "react";

import { ForumBadge } from "../../lib/forum/forumHelpers";

export default function ForumReplyBadge({ badge }: { badge: ForumBadge }) {
  const badgeClasses: Record<ForumBadge["color"], string> = {
    green:
        "bg-[var(--public-success-soft)] text-[var(--public-success)] border-[var(--public-success-border)]",
    blue:
        "bg-[var(--public-info-soft)] text-[var(--public-info)] border-[var(--public-info-border)]",
    cyan:
        "bg-[var(--public-primary-soft)] text-[var(--public-primary)] border-[var(--public-info-border)]",
    amber:
        "bg-[var(--public-warning-soft)] text-[var(--public-warning)] border-[var(--public-warning-border)]",
  };

  return (
      <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClasses[badge.color]}`}
      >
      {badge.text}
    </span>
  );
}