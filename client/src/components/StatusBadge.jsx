import React from 'react';

export const STATUS_STYLES = {
  Open: 'bg-[#FFC700] text-[#141414] border-[#141414]',
  'In Progress': 'bg-[#0F1E36] text-[#FFC700] border-[#141414]',
  Resolved: 'bg-[#1B6E3A] text-white border-[#141414]',
  Rejected: 'bg-[#C92A2A] text-white border-[#141414]',
};

export const PRIORITY_STYLES = {
  Low: 'text-[#5A5A52]',
  Medium: 'text-[#0F1E36]',
  High: 'text-[#B45309] font-bold',
  Critical: 'text-[#C92A2A] font-bold',
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
  const cls = STATUS_STYLES[status] || 'bg-white text-[#141414] border-[#141414]';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 font-mono-code text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap ${cls}`}
    >
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || 'text-[#5A5A52]';
  return (
    <span className={`font-mono-code text-[10px] uppercase tracking-widest whitespace-nowrap ${cls}`}>
      [{priority}]
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
