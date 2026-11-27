import React from 'react';
import { StatusBadge, PriorityBadge, formatTicketId, timeAgo } from './StatusBadge';

export default function IssueCard({
  issue,
  currentUserId,
  onUpvote,
  onSelect,
  onHover,
  isHighlighted,
}) {
  const upvoteCount = issue.upvotes?.length || 0;
  const hasUpvoted = currentUserId ? issue.upvotes?.includes(currentUserId) : false;

  return (
    <article
      onClick={() => onSelect(issue)}
      onMouseEnter={() => onHover?.(issue._id)}
      onMouseLeave={() => onHover?.(null)}
      className={`py-5 px-2 -mx-2 rounded-md transition-colors cursor-pointer flex gap-4 items-start ${
        isHighlighted ? 'bg-[#F4EFE7]' : 'hover:bg-[#F7F3EC]'
      }`}
    >
      {/* Simple honest upvote button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUpvote(issue._id);
        }}
        title={hasUpvoted ? 'Remove upvote' : 'Upvote this issue'}
        className={`shrink-0 w-12 py-1.5 rounded border text-center transition-colors cursor-pointer ${
          hasUpvoted
            ? 'bg-[#B84A27] border-[#B84A27] text-white'
            : 'bg-white border-[#DDD6CB] text-[#3B423D] hover:border-[#1C211E]'
        }`}
      >
        <div className="text-[10px] leading-none">▲</div>
        <div className="text-sm font-semibold leading-tight mt-0.5">{upvoteCount}</div>
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#6D746F]">
          <StatusBadge status={issue.status} />
          <span className="font-medium text-[#1C211E]">{issue.category}</span>
          <span>·</span>
          <PriorityBadge priority={issue.priority} />
          <span>·</span>
          <span>#{formatTicketId(issue._id)}</span>
        </div>

        <h3 className="font-serif-editorial text-xl font-medium text-[#1C211E] leading-snug">
          {issue.title}
        </h3>

        <p className="text-[14.5px] text-[#4E5550] line-clamp-2 leading-relaxed">
          {issue.description}
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-[#6D746F]">
          <span className="text-[#2E3530] font-medium">{issue.location?.address}</span>
          <span>·</span>
          <span>Reported by {issue.reportedBy?.name}</span>
          <span>·</span>
          <span>{issue.comments?.length || 0} comments</span>
          <span>·</span>
          <span>{timeAgo(issue.createdAt)}</span>
        </div>
      </div>

      {/* Documentary Photo */}
      {issue.photoUrl && (
        <img
          src={issue.photoUrl}
          alt={issue.title}
          className="hidden sm:block shrink-0 w-28 h-22 rounded object-cover border border-[#E3DDD3]"
        />
      )}
    </article>
  );
}
