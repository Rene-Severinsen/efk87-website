import React from "react";
import { ForumBadge } from "../../lib/forum/forumHelpers";

export default function ForumReplyBadge({ badge }: { badge: ForumBadge }) {
  return (
    <span className={`forum-reply-badge forum-reply-badge--${badge.color}`}>
      {badge.text}
    </span>
  );
}
