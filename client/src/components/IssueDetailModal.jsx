import React, { useState } from 'react';
import {
  X,
  ArrowBigUp,
  MapPin,
  Building2,
  User,
  Clock,
  CheckCircle2,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { StatusBadge, PriorityBadge, timeAgo } from './StatusBadge';
import { apiRequest } from '../api/client';

export default function IssueDetailModal({ issue, user, onClose, onIssueUpdated, onRequireAuth }) {
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  if (!issue) return null;

  const hasUpvoted = user ? issue.upvotes?.includes(user.id) : false;

  async function handleUpvote() {
    if (!user) {
      onRequireAuth();
      return;
    }
    const data = await apiRequest(`/api/issues/${issue._id}/upvote`, { method: 'POST' });
    onIssueUpdated(data.issue);
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (!commentText.trim()) return;
    setPosting(true);
    try {
      const data = await apiRequest(`/api/issues/${issue._id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text: commentText }),
      });
      setCommentText('');
      onIssueUpdated(data.issue);
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={issue.status} />
              <PriorityBadge priority={issue.priority} />
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {issue.category}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{issue.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {issue.photoUrl && (
            <img
              src={issue.photoUrl}
              alt={issue.title}
              className="w-full max-h-72 object-cover rounded-xl border border-slate-200"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium text-slate-900">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {issue.location?.address}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" /> {issue.department}
                </span>
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Reported by {issue.reportedBy?.name}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {timeAgo(issue.createdAt)}
                </span>
              </div>
            </div>

            <button
              onClick={handleUpvote}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                hasUpvoted
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
              }`}
            >
              <ArrowBigUp className={`w-5 h-5 ${hasUpvoted ? 'fill-white' : ''}`} />
              <span>{hasUpvoted ? 'Upvoted' : 'Upvote Priority'}</span>
              <span className="px-2 py-0.5 rounded-md bg-black/10 text-xs">
                {issue.upvotes?.length || 0}
              </span>
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1.5">Description</h3>
            <p className="text-sm text-slate-700 leading-relaxed">{issue.description}</p>
          </div>

          {issue.resolutionNote && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Official Authority Update
              </div>
              <p className="text-sm text-emerald-800">{issue.resolutionNote}</p>
            </div>
          )}

          {issue.statusHistory?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Status Timeline</h3>
              <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                {issue.statusHistory.map((step, idx) => (
                  <li key={idx} className="ml-5">
                    <span className="absolute -left-2 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white" />
                    <div className="flex items-center gap-2">
                      <StatusBadge status={step.status} />
                      <span className="text-xs text-slate-500">
                        by {step.updatedBy} · {timeAgo(step.updatedAt)}
                      </span>
                    </div>
                    {step.note && <p className="text-xs text-slate-600 mt-1">{step.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">
              Community Discussion ({issue.comments?.length || 0})
            </h3>

            <div className="space-y-3 mb-4">
              {(!issue.comments || issue.comments.length === 0) && (
                <p className="text-sm text-slate-500 italic">No comments yet. Share an update or add context.</p>
              )}
              {issue.comments?.map((c) => (
                <div
                  key={c._id}
                  className={`p-3 rounded-xl border text-sm ${
                    c.userRole === 'admin'
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-slate-900 inline-flex items-center gap-1.5">
                      {c.userName}
                      {c.userRole === 'admin' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-semibold">
                          <ShieldCheck className="w-3 h-3" /> Official
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-slate-700">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? 'Add a comment or status update...' : 'Sign in to join the discussion'}
                className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={posting || !commentText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-sm font-medium cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
