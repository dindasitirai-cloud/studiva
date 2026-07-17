import React from 'react';
import { Comment } from '../types';
import { timeAgo } from '../lib/community';
import Card from './Card';
import ExpertBadge from './ExpertBadge';

interface CommentItemProps {
  comment: Comment;
  canMarkHelpful: boolean;
  canModerate: boolean;
  onLike: () => void;
  onMarkHelpful: () => void;
  onDelete: () => void;
  onReport: () => void;
}

export default function CommentItem({
  comment,
  canMarkHelpful,
  canModerate,
  onLike,
  onMarkHelpful,
  onDelete,
  onReport,
}: CommentItemProps) {
  return (
    <Card
      className={
        comment.is_expert
          ? 'border-2 border-gold'
          : comment.is_marked_helpful === 1
            ? 'border-2 border-success'
            : ''
      }
    >
      {comment.is_marked_helpful === 1 && (
        <span className="mb-2 inline-block rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
          ✓ This was helpful!
        </span>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-textlight">
        <span className="flex items-center gap-2">
          <span className={`font-semibold ${comment.is_expert ? 'text-gold' : 'text-navy'}`}>
            {comment.display_name}
          </span>
          {comment.is_expert && <ExpertBadge label={comment.expert_badge} />}
        </span>
        <span>{timeAgo(comment.created_at)}</span>
      </div>
      <p className="mt-2 whitespace-pre-line text-textdark">{comment.content}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <button onClick={onLike} className="text-textlight hover:text-gold">
          ❤️ Like ({comment.likes_count})
        </button>
        {canMarkHelpful && comment.is_marked_helpful === 0 && (
          <button onClick={onMarkHelpful} className="font-medium text-success hover:underline">
            Mark Helpful
          </button>
        )}
        <button onClick={onReport} className="text-textlight hover:text-red-600">
          Report
        </button>
        {canModerate && (
          <button onClick={onDelete} className="text-red-600 hover:underline">
            Delete
          </button>
        )}
      </div>
    </Card>
  );
}
