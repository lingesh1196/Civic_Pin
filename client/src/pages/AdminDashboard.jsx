import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, Edit3, X, Save, MessageSquare, Eye, Shield } from 'lucide-react';
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
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-6 border-b border-[#E6E8EC] flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2563EB]">
            <Shield className="w-3.5 h-3.5" /> Municipal Operations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1220]">
            Admin Dispatch Console
          </h1>
          <p className="text-sm text-[#64748B]">
            Review evidence photos, reply to citizens, assign departments, and track resolution SLAs.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">Total</div>
              <div className="text-xl font-bold text-[#0B1220]">{stats.total}</div>
            </div>
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">Open</div>
              <div className="text-xl font-bold text-[#D97706]">{stats.open}</div>
            </div>
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">In Progress</div>
              <div className="text-xl font-bold text-[#2563EB]">{stats.inProgress}</div>
            </div>
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">Resolved</div>
              <div className="text-xl font-bold text-[#059669]">{stats.resolved}</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {stats?.byCategory?.length > 0 && (
        <div className="premium-card rounded-2xl p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-4">
            Reports by Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.byCategory.map((item) => {
              const pct = stats.total ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0B1220]">{item.category}</span>
                    <span className="font-mono-code text-[#64748B]">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Priority Issue Queue (Zero Horizontal Scroll) */}
      <div className="premium-card rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 bg-[#F8FAFC] border-b border-[#E6E8EC] flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[#0B1220]">
            Priority Queue <span className="text-[#64748B] font-normal">({filteredIssues.length})</span>
          </h2>
          <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
            {['All', 'Open', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  statusFilter === st
                    ? 'bg-white text-[#0B1220] shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1220]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#F1F5F9]">
          {filteredIssues.map((issue) => (
            <div
              key={issue._id}
              className="px-4 py-3.5 hover:bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
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
                    className="w-16 h-14 rounded-xl object-cover border border-[#E6E8EC] shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono-code text-[11px] text-[#64748B] whitespace-nowrap shrink-0">
                      #{formatTicketId(issue._id)}
                    </span>
                    <span className="font-semibold text-sm text-[#0B1220] group-hover:text-[#2563EB] transition-colors truncate">
                      {issue.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[#64748B]">
                    <span className="truncate max-w-full">{issue.location?.address}</span>
                    <span className="text-[#CBD5E1]">·</span>
                    <span className="font-medium text-[#334155]">{issue.category}</span>
                    <span>({issue.department})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-[#94A3B8]">
                    <span>
                      Filed {timeAgo(issue.createdAt)} by {issue.reportedBy?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#475569] font-medium">
                      <MessageSquare className="w-3 h-3" /> {issue.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Votes, Priority, Status & Actions */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2.5 shrink-0">
                <span className="inline-flex items-center gap-1 font-mono-code text-xs font-semibold text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] px-2.5 py-1 rounded-lg whitespace-nowrap">
                  ▲ {issue.upvotes?.length || 0}
                </span>

                <PriorityBadge priority={issue.priority} />
                <StatusBadge status={issue.status} />

                <div className="flex items-center gap-1.5 pl-1">
                  <button
                    onClick={() => setViewing(issue)}
                    title="View photo & comments"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:border-[#94A3B8] text-[#475569] hover:text-[#0B1220] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => setEditing({ ...issue })}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B1220] hover:bg-[#2563EB] text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Update
                  </button>
                  <button
                    onClick={() => handleDelete(issue._id)}
                    title="Delete issue"
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#0B1220]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-[#E6E8EC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E6E8EC] flex items-center justify-between bg-[#F8FAFC]">
              <h3 className="text-base font-bold text-[#0B1220]">
                Update #{formatTicketId(editing._id)}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0B1220] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="text-sm font-semibold text-[#0B1220]">{editing.title}</div>
              {editing.photoUrl && (
                <img
                  src={editing.photoUrl}
                  alt={editing.title}
                  className="w-full h-40 object-cover rounded-xl border border-[#E6E8EC]"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Status</label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Priority</label>
                  <select
                    value={editing.priority}
                    onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm bg-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Assigned Department
                </label>
                <input
                  type="text"
                  value={editing.department || ''}
                  onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">
                  Official Dispatch / Resolution Note
                </label>
                <textarea
                  rows={3}
                  value={editing.resolutionNote || ''}
                  onChange={(e) => setEditing({ ...editing, resolutionNote: e.target.value })}
                  placeholder="Share crew dispatch details or resolution confirmation..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-sm focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold cursor-pointer"
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
