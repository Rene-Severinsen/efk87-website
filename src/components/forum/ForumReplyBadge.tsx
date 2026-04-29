import React from 'react';
import { ForumBadge } from '../../lib/forum/forumHelpers';

export default function ForumReplyBadge({ badge }: { badge: ForumBadge }) {
  const colorClasses = {
    green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/20",
    cyan: "bg-sky-500/20 text-sky-400 border-sky-500/20",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  };

  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${colorClasses[badge.color]}`}>
      {badge.text}
    </span>
  );
}
