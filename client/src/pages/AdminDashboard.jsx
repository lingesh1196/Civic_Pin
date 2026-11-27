import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Trash2, Edit3, X, Save, MessageSquare, Eye } from 'lucide-react';
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
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="pb-6 border-b-2 border-[#141414] flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <span className="inline-block bg-[#0F1E36] text-[#FFC700] font-mono-code text-[11px] font-semibold uppercase tracking-widest px-3 py-1">
            MUNICIPAL DISPATCH CONSOLE
          </span>
          <h1 className="font-poster text-4xl sm:text-5xl uppercase text-[#141414] leading-none">
            OPERATIONS LEDGER
          </h1>
          <p className="text-sm text-[#4A4A45]">
            Triage high-vote citizen complaints, assign field crews, inspect photos, and post official updates.
          </p>
        </div>

        {stats && (
          <div className="flex flex-wrap gap-3 font-mono-code">
            <div className="bg-white border-2 border-[#141414] brutal-shadow-sm px-4 py-2">
              <div className="text-[10px] uppercase text-[#5A5A52]">TOTAL</div>
              <div className="font-poster text-2xl text-[#141414]">{stats.total}</div>
            </div>
            <div className="bg-[#FFC700] border-2 border-[#141414] brutal-shadow-sm px-4 py-2">
              <div className="text-[10px] uppercase text-[#141414] font-bold">OPEN</div>
              <div className="font-poster text-2xl text-[#141414]">{stats.open}</div>
            </div>
            <div className="bg-[#0F1E36] border-2 border-[#141414] brutal-shadow-sm px-4 py-2">
              <div className="text-[10px] uppercase text-[#FFC700]">IN PROGRESS</div>
              <div className="font-poster text-2xl text-white">{stats.inProgress}</div>
            </div>
            <div className="bg-[#1B6E3A] border-2 border-[#141414] brutal-shadow-sm px-4 py-2">
              <div className="text-[10px] uppercase text-white/80">RESOLVED</div>
              <div className="font-poster text-2xl text-white">{stats.resolved}</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      {stats?.byCategory?.length > 0 && (
        <div className="bg-white border-2 border-[#141414] brutal-shadow p-5">
          <h2 className="font-mono-code text-xs font-bold uppercase tracking-widest text-[#141414] mb-4">
            COMPLAINTS BY CATEGORY
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.byCategory.map((item) => {
              const pct = stats.total ? Math.round((item.count / stats.total) * 100) : 0;
              return (
                <div key={item.category} className="space-y-1.5">
                  <div className="flex items-center justify-between font-mono-code text-xs">
                    <span className="font-bold text-[#141414] uppercase">{item.category}</span>
                    <span className="text-[#5A5A52]">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 bg-[#F3F0E6] border border-[#141414] overflow-hidden">
                    <div className="h-full bg-[#FFC700] border-r border-[#141414]" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Priority Issue Queue (No Horizontal Scrollbar) */}
      <div className="bg-white border-2 border-[#141414] brutal-shadow overflow-hidden">
        <div className="px-5 py-3.5 bg-[#0F1E36] border-b-2 border-[#141414] flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-mono-code text-xs uppercase tracking-widest font-bold text-[#FFC700]">
            WORK-ORDER PRIORITY QUEUE ({filteredIssues.length})
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', 'Open', 'In Progress', 'Resolved', 'Rejected'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 font-mono-code text-[11px] font-bold uppercase border border-[#FFC700]/40 cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-[#FFC700] text-[#141414] border-[#FFC700]'
                    : 'bg-transparent text-white hover:bg-white/10'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y-2 divide-[#141414]/15">
          {filteredIssues.map((issue) => (
            <div
              key={issue._id}
              className="px-4 py-3.5 hover:bg-[#F3F0E6]/60 flex flex-col md:flex-row md:items-center justify-between gap-3"
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
                    className="w-16 h-14 object-cover border-2 border-[#141414] shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-mono-code text-[11px] font-bold text-[#141414] bg-[#F3F0E6] border border-[#141414] px-1.5 py-0.5 whitespace-nowrap shrink-0">
                      #{formatTicketId(issue._id)}
                    </span>
                    <span className="font-bold text-sm text-[#141414] group-hover:text-[#C92A2A] transition-colors truncate">
                      {issue.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-[#4A4A45]">
                    <span className="truncate max-w-full">{issue.location?.address}</span>
                    <span>·</span>
                    <span className="font-semibold text-[#141414]">{issue.category}</span>
                    <span className="text-[#5A5A52]">({issue.department})</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono-code text-[11px] text-[#5A5A52]">
                    <span>
                      Filed {timeAgo(issue.createdAt)} by {issue.reportedBy?.name}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#141414] font-semibold">
                      <MessageSquare className="w-3 h-3" /> {issue.comments?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Votes, Priority, Status & Actions */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 font-mono-code text-xs font-bold text-[#141414] bg-[#FFC700] border border-[#141414] px-2.5 py-1 whitespace-nowrap">
                  ▲ {issue.upvotes?.length || 0}
                </span>

                <PriorityBadge priority={issue.priority} />
                <StatusBadge status={issue.status} />

                <div className="flex items-center gap-1.5 pl-1">
                  <button
                    onClick={() => setViewing(issue)}
                    title="View photo & comments"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border-2 border-[#141414] bg-white hover:bg-[#F3F0E6] text-[#141414] font-mono-code text-xs font-bold uppercase cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    onClick={() => setEditing({ ...issue })}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border-2 border-[#141414] bg-[#FFC700] hover:bg-[#141414] hover:text-[#FFC700] text-[#141414] font-mono-code text-xs font-bold uppercase transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Update
                  </button>
                  <button
                    onClick={() => handleDelete(issue._id)}
                    title="Delete issue"
                    className="p-1.5 border-2 border-[#141414] bg-white text-[#C92A2A] hover:bg-[#C92A2A] hover:text-white transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-[#141414]/70 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#141414] brutal-shadow max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b-2 border-[#141414] flex items-center justify-between bg-[#0F1E36] text-[#FFC700]">
              <h3 className="font-mono-code text-sm font-bold uppercase tracking-wider">
                UPDATE TICKET #{formatTicketId(editing._id)}
              </h3>
              <button
                onClick={() => setEditing(null)}
                className="p-1 text-white hover:text-[#FFC700] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="text-sm font-bold text-[#141414]">{editing.title}</div>
              {editing.photoUrl && (
                <img
                  src={editing.photoUrl}
                  alt={editing.title}
                  className="w-full h-40 object-cover border-2 border-[#141414]"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-code text-[11px] font-bold uppercase text-[#5A5A52] mb-1">
                    Status
                  </label>
                  <select
                    value={editing.status}
                    onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#141414] text-sm bg-white font-mono-code"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono-code text-[11px] font-bold uppercase text-[#5A5A52] mb-1">
                    Priority
                  </label>
                  <select
                    value={editing.priority}
                    onChange={(e) => setEditing({ ...editing, priority: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#141414] text-sm bg-white font-mono-code"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-mono-code text-[11px] font-bold uppercase text-[#5A5A52] mb-1">
                  Assigned Department
                </label>
                <input
                  type="text"
                  value={editing.department || ''}
                  onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#141414] text-sm"
                />
              </div>

              <div>
                <label className="block font-mono-code text-[11px] font-bold uppercase text-[#5A5A52] mb-1">
                  Official Dispatch / Resolution Note
                </label>
                <textarea
                  rows={3}
                  value={editing.resolutionNote || ''}
                  onChange={(e) => setEditing({ ...editing, resolutionNote: e.target.value })}
                  placeholder="Share crew dispatch details or resolution confirmation..."
                  className="w-full px-3 py-2 border-2 border-[#141414] text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border-2 border-[#141414] bg-white font-mono-code text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="brutal-btn brutal-shadow-sm inline-flex items-center gap-1.5 px-4 py-2 border-2 border-[#141414] bg-[#FFC700] text-[#141414] font-mono-code text-xs font-bold uppercase cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'SAVING...' : 'SAVE UPDATE'}
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
