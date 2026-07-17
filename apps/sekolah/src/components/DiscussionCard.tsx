import React from 'react';
import { Link } from 'react-router-dom';
import { Discussion } from '../types';
import { CATEGORY_STYLES, timeAgo, truncate } from '../lib/community';
import Card from './Card';
import ExpertBadge from './ExpertBadge';

export default function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const style = CATEGORY_STYLES[discussion.category];

  return (
    <Card className="flex flex-col">
      <Link to={`/community/discussions/${discussion.id}`} className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {discussion.is_pinned === 1 && (
            <span className="rounded-full bg-gold/30 px-2 py-0.5 text-xs font-semibold text-navy">📌 Pinned</span>
          )}
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.chip}`}>
            {style.icon} {style.label}
          </span>
          {discussion.subcategory && <span className="text-xs text-textlight">{discussion.subcategory}</span>}
          {discussion.is_solved === 1 && (
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
              ✓ Solved
            </span>
          )}
        </div>

        <h3 className="mt-2 text-h3 font-bold text-navy">{discussion.title}</h3>
        <p className="mt-1 flex-1 text-textdark">{truncate(discussion.content)}</p>

        {discussion.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {discussion.tags.map((tag) => (
              <span key={tag} className="text-xs font-medium text-skyblue">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-textlight">
          <span className="flex items-center gap-2">
            <span className={discussion.is_expert ? 'font-bold text-gold' : ''}>{discussion.display_name}</span>
            {discussion.is_expert && <ExpertBadge label={discussion.expert_badge} />}
            <span>&middot; {timeAgo(discussion.created_at)}</span>
          </span>
          <span className="flex items-center gap-3">
            <span>💬 {discussion.replies_count}</span>
            <span>❤️ {discussion.likes_count}</span>
            <span>👀 {discussion.views_count}</span>
          </span>
        </div>
      </Link>
    </Card>
  );
}
