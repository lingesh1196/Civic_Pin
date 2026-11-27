import React from 'react';

export const STATUS_DOTS = {
  Open: 'bg-[#F59E0B]',
  'In Progress': 'bg-[#2563EB]',
  Resolved: 'bg-[#10B981]',
  Rejected: 'bg-[#EF4444]',
};

export const STATUS_TEXT = {
  Open: 'text-[#B45309] bg-[#FFFBEB] border-[#FDE68A]',
  'In Progress': 'text-[#1D4ED8] bg-[#EFF6FF] border-[#BFDBFE]',
  Resolved: 'text-[#047857] bg-[#ECFDF5] border-[#A7F3D0]',
  Rejected: 'text-[#B91C1C] bg-[#FEF2F2] border-[#FECACA]',
};

export const PRIORITY_STYLES = {
  Low: 'text-[#64748B]',
  Medium: 'text-[#0284C7]',
  High: 'text-[#D97706] font-semibold',
  Critical: 'text-[#DC2626] font-semibold',
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
  const cls = STATUS_TEXT[status] || 'text-slate-700 bg-slate-50 border-slate-200';
  const dot = STATUS_DOTS[status] || 'bg-slate-400';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || 'text-slate-500';
  return (
    <span className={`font-mono-code text-[11px] uppercase tracking-wider whitespace-nowrap ${cls}`}>
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
