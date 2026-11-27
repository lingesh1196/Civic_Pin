import React from 'react';
import { ChevronUp, MapPin, MessageSquare } from 'lucide-react';
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
      className={`group bg-white border-2 border-[#141414] transition-all cursor-pointer p-4 flex gap-3.5 sm:gap-4 items-start ${
        isHighlighted
          ? 'shadow-[5px_5px_0px_#C92A2A] -translate-x-0.5 -translate-y-0.5'
          : 'brutal-shadow-sm hover:shadow-[5px_5px_0px_#141414] hover:-translate-x-0.5 hover:-translate-y-0.5'
      }`}
    >
      {/* Tactile Upvote Stamp */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUpvote(issue._id);
        }}
        title={hasUpvoted ? 'Remove upvote' : 'Push up work-order queue'}
        className={`shrink-0 w-13 py-2 border-2 border-[#141414] flex flex-col items-center justify-center transition-colors cursor-pointer ${
          hasUpvoted
            ? 'bg-[#FFC700] text-[#141414]'
            : 'bg-[#F3F0E6] text-[#141414] hover:bg-[#FFC700]'
        }`}
      >
        <ChevronUp className="w-4 h-4 stroke-[3]" />
        <span className="font-mono-code text-sm font-bold leading-none mt-0.5">
          {upvoteCount}
        </span>
      </button>

      {/* Main Ticket Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] font-bold text-[#141414] bg-[#F3F0E6] border border-[#141414] px-1.5 py-0.5">
            #{formatTicketId(issue._id)}
          </span>
          <StatusBadge status={issue.status} />
          <span className="font-mono-code text-[11px] uppercase tracking-wider text-[#5A5A52] font-semibold">
            {issue.category}
          </span>
          <PriorityBadge priority={issue.priority} />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#141414] group-hover:text-[#C92A2A] transition-colors leading-snug">
            {issue.title}
          </h3>
          <p className="text-sm text-[#4A4A45] mt-1 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 font-mono-code text-[11px] text-[#5A5A52]">
          <span className="inline-flex items-center gap-1 text-[#141414] font-semibold truncate max-w-full">
            <MapPin className="w-3.5 h-3.5 text-[#C92A2A] shrink-0" />
            <span className="truncate">{issue.location?.address}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {issue.comments?.length || 0}
          </span>
          <span>{timeAgo(issue.createdAt)}</span>
        </div>
      </div>

      {/* Real Documentary Photo Thumbnail */}
      {issue.photoUrl && (
        <div className="hidden sm:block shrink-0 w-28 h-24 overflow-hidden border-2 border-[#141414] bg-[#F3F0E6]">
          <img
            src={issue.photoUrl}
            alt={issue.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </article>
  );
}
