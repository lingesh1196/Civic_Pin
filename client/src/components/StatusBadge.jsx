import React from 'react';

export const STATUS_STYLES = {
  Open: 'text-[#9A5B13] bg-[#FDF5E6] border-[#EED9B3]',
  'In Progress': 'text-[#1E4B7A] bg-[#EDF4FA] border-[#C4D9EE]',
  Resolved: 'text-[#1F5E3B] bg-[#EAF6EE] border-[#BEE2CB]',
  Rejected: 'text-[#8C2D2D] bg-[#FBECEC] border-[#EAC6C6]',
};

export const PRIORITY_STYLES = {
  Low: 'text-[#6D746F]',
  Medium: 'text-[#4B5563]',
  High: 'text-[#9A5B13] font-semibold',
  Critical: 'text-[#B84A27] font-semibold',
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
  const cls = STATUS_STYLES[status] || 'text-[#5C635E] bg-[#F2EFE9] border-[#E3DDD3]';
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border whitespace-nowrap ${cls}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const cls = PRIORITY_STYLES[priority] || 'text-[#6D746F]';
  return <span className={`text-xs whitespace-nowrap ${cls}`}>{priority} priority</span>;
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
