import React from 'react';

export const STATUS_DOTS = {
  Open: 'bg-[#D97706]',
  'In Progress': 'bg-[#2563EB]',
  Resolved: 'bg-[#2D6A4F]',
  Rejected: 'bg-[#9F1239]',
};

export const STATUS_TEXT = {
  Open: 'text-[#92400E] bg-[#FEF3C7]/80 border-[#FDE68A]',
  'In Progress': 'text-[#1E40AF] bg-[#DBEAFE]/70 border-[#BFDBFE]',
  Resolved: 'text-[#1B4332] bg-[#D8F3DC]/80 border-[#B7E4C7]',
  Rejected: 'text-[#881337] bg-[#FFE4E6]/80 border-[#FECDD3]',
};

export const PRIORITY_STYLES = {
  Low: 'text-[#57534E]',
  Medium: 'text-[#0369A1]',
  High: 'text-[#C2410C]',
  Critical: 'text-[#C84B31] font-semibold',
};

export const CATEGORIES = [
  'Pothole',
  'Garbage',
  'Streetlight',
  'Water Leak',
  'Drainage',
  'Traffic Signal',
  'Public Safety',
  'Other',
];

export function StatusBadge({ status }) {
  const cls = STATUS_TEXT[status] || 'text-stone-700 bg-stone-100 border-stone-200';
  const dot = STATUS_DOTS[status] || 'bg-stone-500';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || 'text-stone-600';
  return (
    <span className={`font-mono-code text-[11px] uppercase tracking-wider ${cls}`}>
      {priority}
    </span>
  );
}

export function formatTicketId(id = '') {
  const num = String(id).replace(/[^0-9a-zA-Z]/g, '').slice(-4).toUpperCase();
  return `CP-${num || '001'}`;
}

export function timeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
