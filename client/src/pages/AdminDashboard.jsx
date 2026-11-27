import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, Edit3, X, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { StatusBadge, PriorityBadge, formatTicketId, timeAgo } from '../components/StatusBadge';

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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-5 border-b border-[#E4DFD3] flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono-code text-[11px] uppercase tracking-widest text-[#C84B31] mb-1">
            Municipal Dispatch Console
          </div>
          <h1 className="font-display text-3xl font-bold text-[#18181B]">Operations Ledger</h1>
          <p className="text-sm text-[#57534E] mt-1">
            Triage high-vote citizen reports, assign field crews, and publish official status updates.
          </p>
        </div>

        {stats && (
          <div className="flex flex-wrap gap-6 font-mono-code text-xs">
            <div>
              <div className="text-[#78716C] uppercase text-[10px]">Total</div>
              <div className="text-2xl font-bold text-[#18181B]">{stats.total}</div>
            </div>
            <div>
              <div className="text-[#78716C] uppercase text-[10px]">Open</div>
              <div className="text-2xl font-bold text-[#D97706]">{stats.open}</div>
            </div>
            <div>
              <div className="text-[#78716C] uppercase text-[10px]">In Progress</div>
              <div className="text-2xl font-bold text-[#2563EB]">{stats.inProgress}</div>
            </div>
            <div>
              <div className="text-[#78716C] uppercase text-[10px]">Resolved</div>
              <div className="text-2xl font-bold text-[#2D6A4F]">{stats.resolved}</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {stats?.byCategory?.length > 0 && (
        <div className="bg-white rounded-xl border border-[#E4DFD3] p-5">
          <h2 className="font-mono-code text-[11px] uppercase tracking-wider text-[#78716C] mb-3">
            Reports by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.byCategory.map((item) => {
              const pct = stats.total ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#18181B]">{item.category}</span>
                    <span className="font-mono-code text-[#78716C]">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#EFECE4] overflow-hidden">
                    <div className="h-full rounded-full bg-[#18181B]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Priority Issue Queue */}
      <div className="bg-white rounded-xl border border-[#E4DFD3] overflow-hidden">
        <div className="px-5 py-3.5 bg-[#FAF8F4] border-b border-[#E4DFD3] flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono-code text-xs uppercase tracking-wider font-semibold text-[#18181B]">
            Priority Queue ({filteredIssues.length})
          </h2>
          <div className="flex items-center gap-1.5">
            {['All', 'Open', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-[#18181B] text-white'
                    : 'bg-white border border-[#E4DFD3] text-[#57534E] hover:border-[#18181B]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#EFECE4]">
          {filteredIssues.map((issue) => (
            <div
              key={issue._id}
              className="px-4 py-3.5 hover:bg-[#FAF8F4] flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              {/* Left: Photo Thumbnail + Ticket, Title, Address & Dept */}
              <div
                onClick={() => setViewing(issue)}
                className="min-w-0 flex-1 flex items-start gap-3 cursor-pointer group"
              >
                {issue.photoUrl && (
                  <img
                    src={issue.photoUrl}
                    alt={issue.title}
                    className="w-16 h-14 rounded-lg object-cover border border-[#E4DFD3] shrink-0 group-hover:opacity-90 transition-opacity"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono-code text-[11px] text-[#78716C] whitespace-nowrap shrink-0">
                      #{formatTicketId(issue._id)}
                    </span>
                    <span className="font-semibold text-sm text-[#18181B] group-hover:text-[#C84B31] transition-colors truncate">
                      {issue.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#57534E]">
                    <span className="truncate max-w-full">{issue.location?.address}</span>
                    <span className="text-[#D6D0C4]">·</span>
                    <span className="font-medium text-[#18181B]">{issue.category}</span>
                    <span className="text-[#78716C]">({issue.department})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#78716C]">
                    <span>
                      Filed {timeAgo(issue.createdAt)} by {issue.reportedBy?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#57534E]">
                      <MessageSquare className="w-3 h-3" /> {issue.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Votes, Priority, Status & Actions */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2.5 shrink-0">
                <span className="inline-flex items-center gap-1 font-mono-code text-xs font-semibold text-[#C84B31] bg-[#C84B31]/10 px-2.5 py-1 rounded whitespace-nowrap">
                  ▲ {issue.upvotes?.length || 0}
                </span>

                <PriorityBadge priority={issue.priority} />
                <StatusBadge status={issue.status} />

                <div className="flex items-center gap-1.5 pl-1">
                  <button
                    onClick={() => setViewing(issue)}
                    title="View photo & comments"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E4DFD3] hover:border-[#18181B] text-[#57534E] hover:text-[#18181B] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => setEditing({ ...issue })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#D6D0C4] hover:border-[#18181B] hover:bg-[#18181B] hover:text-white text-[#18181B] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Update
                  </button>
                  <button
                    onClick={() => handleDelete(issue._id)}
                    title="Delete issue"
                    className="p-1.5 rounded-lg text-[#78716C] hover:text-[#9F1239] hover:bg-[#FFE4E6] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 bg-[#18181B]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E4DFD3] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E4DFD3] flex items-center justify-between bg-[#FAF8F4]">
              <h3 className="font-display text-lg font-bold text-[#18181B]">
                Update #{formatTicketId(editing._id)}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="text-sm font-semibold text-[#18181B]">{editing.title}</div>
              {editing.photoUrl && (
                <img
                  src={editing.photoUrl}
                  alt={editing.title}
                  className="w-full h-40 object-cover rounded-xl border border-[#E4DFD3]"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">Status</label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6D0C4] text-sm bg-white"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#57534E] mb-1">Priority</label>
                  <select
                    value={editing.priority}
                    onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6D0C4] text-sm bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1">Assigned Department</label>
                <input
                  type="text"
                  value={editing.department || ''}
                  onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D0C4] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1">
                  Official Dispatch / Resolution Note
                </label>
                <textarea
                  rows={3}
                  value={editing.resolutionNote || ''}
                  onChange={(e) => setEditing({ ...editing, resolutionNote: e.target.value })}
                  placeholder="Share crew dispatch details or resolution confirmation..."
                  className="w-full px-3 py-2 rounded-lg border border-[#D6D0C4] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-[#57534E] hover:bg-[#F2EFE9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C84B31] hover:bg-[#B03E26] text-white text-sm font-semibold cursor-pointer"
                >
                  <Save className="w-4 h-4" />
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
