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
      className={`group bg-white rounded-xl border transition-all cursor-pointer p-4 flex gap-3.5 sm:gap-4 items-start ${
        isHighlighted
          ? 'border-[#C84B31] ring-1 ring-[#C84B31]/20'
          : 'border-[#E4DFD3] hover:border-[#C7BFB0]'
      }`}
    >
      {/* Tactile Upvote Column */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUpvote(issue._id);
        }}
        title={hasUpvoted ? 'Remove upvote' : 'Upvote to prioritize'}
        className={`shrink-0 w-12 py-2 rounded-lg border flex flex-col items-center justify-center transition-colors cursor-pointer ${
          hasUpvoted
            ? 'bg-[#C84B31] border-[#C84B31] text-white'
            : 'bg-[#FAF8F4] border-[#E4DFD3] text-[#44403C] hover:border-[#C84B31] hover:text-[#C84B31]'
        }`}
      >
        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
        <span className="font-mono-code text-sm font-semibold leading-none mt-0.5">
          {upvoteCount}
        </span>
      </button>

      {/* Main Dispatch Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span className="font-mono-code text-[11px] text-[#78716C]">
            #{formatTicketId(issue._id)}
          </span>
          <StatusBadge status={issue.status} />
          <span className="text-xs font-medium text-[#57534E]">{issue.category}</span>
          <span className="text-[#D6D0C4]">·</span>
          <PriorityBadge priority={issue.priority} />
        </div>

        <div>
          <h3 className="text-[16px] font-semibold text-[#18181B] group-hover:text-[#C84B31] transition-colors leading-snug">
            {issue.title}
          </h3>
          <p className="text-sm text-[#57534E] mt-1 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-[#78716C]">
          <span className="inline-flex items-center gap-1 text-[#44403C] font-medium truncate max-w-full">
            <MapPin className="w-3.5 h-3.5 text-[#C84B31] shrink-0" />
            <span className="truncate">{issue.location?.address}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {issue.comments?.length || 0}
          </span>
          <span className="font-mono-code text-[11px]">{timeAgo(issue.createdAt)}</span>
        </div>
      </div>

      {/* Real Documentary Photo Thumbnail */}
      {issue.photoUrl && (
        <div className="hidden sm:block shrink-0 w-28 h-24 rounded-lg overflow-hidden border border-[#E4DFD3] bg-[#F2EFE9]">
          <img
            src={issue.photoUrl}
            alt={issue.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </article>
  );
}
