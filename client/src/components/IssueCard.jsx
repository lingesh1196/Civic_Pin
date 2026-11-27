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
      className={`premium-card group rounded-2xl p-4 flex gap-4 items-start cursor-pointer ${
        isHighlighted ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15' : ''
      }`}
    >
      {/* Tactile Upvote Pill */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onUpvote(issue._id);
        }}
        title={hasUpvoted ? 'Remove upvote' : 'Upvote to prioritize'}
        className={`shrink-0 w-12 py-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
          hasUpvoted
            ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm shadow-[#2563EB]/25'
            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:border-[#2563EB] hover:text-[#2563EB] hover:bg-[#EFF6FF]'
        }`}
      >
        <ChevronUp className="w-4 h-4 stroke-[2.5]" />
        <span className="font-mono-code text-xs font-semibold leading-none mt-1">
          {upvoteCount}
        </span>
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-code text-[11px] font-medium text-[#64748B]">
            #{formatTicketId(issue._id)}
          </span>
          <StatusBadge status={issue.status} />
          <span className="text-xs font-medium text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
            {issue.category}
          </span>
          <PriorityBadge priority={issue.priority} />
        </div>

        <div>
          <h3 className="text-[15px] font-semibold text-[#0B1220] group-hover:text-[#2563EB] transition-colors leading-snug">
            {issue.title}
          </h3>
          <p className="text-[13px] text-[#64748B] mt-1 line-clamp-2 leading-relaxed">
            {issue.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-xs text-[#64748B]">
          <span className="inline-flex items-center gap-1.5 text-[#334155] font-medium truncate max-w-full">
            <MapPin className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
            <span className="truncate">{issue.location?.address}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {issue.comments?.length || 0}
          </span>
          <span className="font-mono-code text-[11px] text-[#94A3B8]">{timeAgo(issue.createdAt)}</span>
        </div>
      </div>

      {/* Photo Thumbnail */}
      {issue.photoUrl && (
        <div className="hidden sm:block shrink-0 w-28 h-24 rounded-xl overflow-hidden border border-[#E6E8EC] bg-[#F1F5F9]">
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
