import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { StatusBadge, PriorityBadge, formatTicketId, timeAgo } from '../components/StatusBadge';
import IssueDetailModal from '../components/IssueDetailModal';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    const [issuesRes, statsRes] = await Promise.all([
      apiRequest('/api/issues?sort=upvotes'),
      apiRequest('/api/stats'),
    ]);
    setIssues(issuesRes.issues || []);
    setStats(statsRes);
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAll();
    }
  }, [user]);

  if (authLoading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const filteredIssues =
    statusFilter === 'All' ? issues : issues.filter((i) => i.status === statusFilter);

  async function handleSaveUpdate(e) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await apiRequest(`/api/issues/${editing._id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: editing.status,
          priority: editing.priority,
          department: editing.department,
          resolutionNote: editing.resolutionNote,
        }),
      });
      setEditing(null);
      await loadAll();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this civic issue report permanently?')) return;
    await apiRequest(`/api/issues/${id}`, { method: 'DELETE' });
    await loadAll();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="pb-6 border-b border-[#E3DDD3] space-y-2">
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#1C211E]">
          Admin dispatch
        </h1>
        <p className="text-[15px] text-[#5C635E]">
          Review resident reports, inspect photos, reply to comments, and update repair status.
        </p>
        {stats && (
          <p className="text-sm text-[#6D746F] pt-1">
            <strong className="text-[#1C211E] font-semibold">{stats.total}</strong> total —{' '}
            <strong className="text-[#9A5B13] font-semibold">{stats.open}</strong> open,{' '}
            <strong className="text-[#1E4B7A] font-semibold">{stats.inProgress}</strong> in progress,{' '}
            <strong className="text-[#1F5E3B] font-semibold">{stats.resolved}</strong> resolved.
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {['All', 'Open', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'border-[#B84A27] text-[#1C211E] font-semibold'
                  : 'border-transparent text-[#6D746F] hover:text-[#1C211E]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-xs text-[#6D746F]">
          Showing {filteredIssues.length} {filteredIssues.length === 1 ? 'report' : 'reports'}
        </span>
      </div>

      {/* Flat Hairline-Divided Queue (Zero Horizontal Scroll) */}
      <div className="divide-y divide-[#E3DDD3] border-t border-b border-[#E3DDD3]">
        {filteredIssues.map((issue) => (
          <div
            key={issue._id}
            className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left: Photo + Details */}
            <div
              onClick={() => setViewing(issue)}
              className="min-w-0 flex-1 flex items-start gap-3.5 cursor-pointer group"
            >
              {issue.photoUrl && (
                <img
                  src={issue.photoUrl}
                  alt={issue.title}
                  className="w-16 h-14 rounded object-cover border border-[#E3DDD3] shrink-0"
                />
              )}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-[#8A918C] whitespace-nowrap shrink-0">
                    #{formatTicketId(issue._id)}
                  </span>
                  <span className="font-serif-editorial text-lg font-medium text-[#1C211E] group-hover:text-[#B84A27] transition-colors truncate">
                    {issue.title}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[#5C635E]">
                  <span className="truncate max-w-full">{issue.location?.address}</span>
                  <span>·</span>
                  <span className="font-medium text-[#1C211E]">{issue.category}</span>
                  <span className="text-[#8A918C]">({issue.department})</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#8A918C]">
                  <span>
                    Filed {timeAgo(issue.createdAt)} by {issue.reportedBy?.name}
                  </span>
                  <span>·</span>
                  <span>{issue.comments?.length || 0} comments</span>
                </div>
              </div>
            </div>

            {/* Right: Votes, Status & Plain Actions */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 shrink-0 text-xs">
              <span className="px-2 py-1 rounded bg-[#F4EFE7] text-[#1C211E] font-semibold whitespace-nowrap">
                ▲ {issue.upvotes?.length || 0}
              </span>
              <PriorityBadge priority={issue.priority} />
              <StatusBadge status={issue.status} />

              <div className="flex items-center gap-2 pl-1">
                <button
                  onClick={() => setViewing(issue)}
                  className="px-2.5 py-1.5 rounded border border-[#DDD6CB] bg-white hover:border-[#1C211E] text-[#1C211E] font-medium cursor-pointer whitespace-nowrap"
                >
                  View
                </button>
                <button
                  onClick={() => setEditing({ ...issue })}
                  className="px-2.5 py-1.5 rounded bg-[#1C211E] hover:bg-[#B84A27] text-white font-medium cursor-pointer whitespace-nowrap transition-colors"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(issue._id)}
                  className="text-[#8A918C] hover:text-[#8C2D2D] underline underline-offset-2 cursor-pointer px-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-[#1C211E]/50 flex items-center justify-center p-4">
          <div className="bg-[#FCFAF7] rounded-lg max-w-lg w-full shadow-xl border border-[#DDD6CB] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E3DDD3] flex items-center justify-between">
              <h3 className="font-serif-editorial text-xl font-medium text-[#1C211E]">
                Update #{formatTicketId(editing._id)}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1 text-[#6D746F] hover:text-[#1C211E] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="text-sm font-semibold text-[#1C211E]">{editing.title}</div>
              {editing.photoUrl && (
                <img
                  src={editing.photoUrl}
                  alt={editing.title}
                  className="w-full h-40 object-cover rounded border border-[#E3DDD3]"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#5C635E] mb-1">Status</label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-[#DDD6CB] text-sm bg-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5C635E] mb-1">Priority</label>
                  <select
                    value={editing.priority}
                    onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-[#DDD6CB] text-sm bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C635E] mb-1">
                  Assigned department
                </label>
                <input
                  type="text"
                  value={editing.department || ''}
                  onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-[#DDD6CB] text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5C635E] mb-1">
                  Official update / resolution note
                </label>
                <textarea
                  rows={3}
                  value={editing.resolutionNote || ''}
                  onChange={(e) => setEditing({ ...editing, resolutionNote: e.target.value })}
                  placeholder="Share crew dispatch details or resolution confirmation..."
                  className="w-full px-3 py-2 rounded-md border border-[#DDD6CB] text-sm bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-md text-sm text-[#5C635E] hover:text-[#1C211E] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-[#1C211E] hover:bg-[#B84A27] text-white text-sm font-medium cursor-pointer transition-colors"
                >
                  {saving ? 'Saving...' : 'Save update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Photo & Comments Modal */}
      {viewing && (
        <IssueDetailModal
          issue={viewing}
          user={user}
          onClose={() => setViewing(null)}
          onIssueUpdated={(updated) => {
            setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
            setViewing(updated);
          }}
          onRequireAuth={() => setViewing(null)}
        />
      )}
    </div>
  );
}
