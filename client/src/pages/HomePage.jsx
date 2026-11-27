import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Columns2, List, Map as MapIcon } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../components/StatusBadge';
import IssueCard from '../components/IssueCard';
import IssueMap from '../components/IssueMap';
import IssueDetailModal from '../components/IssueDetailModal';

const STATUS_TABS = ['All', 'Open', 'In Progress', 'Resolved'];

export default function HomePage({ refreshSignal }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState('split');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('upvotes');

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (status !== 'All') params.set('status', status);
      if (search.trim()) params.set('search', search.trim());
      if (sort) params.set('sort', sort);

      const [issuesRes, statsRes] = await Promise.all([
        apiRequest(`/api/issues?${params.toString()}`),
        apiRequest('/api/stats'),
      ]);
      setIssues(issuesRes.issues || []);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load issues:', err);
    } finally {
      setLoading(false);
    }
  }, [category, status, search, sort]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshSignal]);

  async function handleUpvote(issueId) {
    if (!user) {
      navigate('/auth');
      return;
    }
    try {
      const data = await apiRequest(`/api/issues/${issueId}/upvote`, { method: 'POST' });
      setIssues((prev) => prev.map((i) => (i._id === issueId ? data.issue : i)));
      if (selectedIssue?._id === issueId) {
        setSelectedIssue(data.issue);
      }
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  }

  function handleIssueUpdated(updated) {
    setIssues((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    setSelectedIssue(updated);
  }

  return (
    <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Refined Minimal Header + Live Metrics */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-[#E6E8EC]">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#2563EB]">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            Live Civic Feed
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0B1220]">
            Local Infrastructure &amp; Issue Tracker
          </h1>
          <p className="text-sm text-[#64748B] max-w-xl">
            Report street-level faults with photos and coordinates, upvote urgent issues, and follow transparent municipal resolution.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">Open</div>
              <div className="text-xl font-bold text-[#0B1220] mt-0.5">{stats.open}</div>
            </div>
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">In Progress</div>
              <div className="text-xl font-bold text-[#2563EB] mt-0.5">{stats.inProgress}</div>
            </div>
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">Resolved</div>
              <div className="text-xl font-bold text-[#059669] mt-0.5">{stats.resolved}</div>
            </div>
            <div className="bg-white border border-[#E6E8EC] rounded-xl px-4 py-2.5 shadow-2xs">
              <div className="text-[11px] font-medium text-[#64748B]">Resolution Rate</div>
              <div className="text-xl font-bold text-[#0B1220] mt-0.5">{stats.resolutionRate}%</div>
            </div>
          </div>
        )}
      </section>

      {/* Filter & View Bar */}
      <section className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] w-fit">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                status === tab
                  ? 'bg-white text-[#0B1220] shadow-xs'
                  : 'text-[#64748B] hover:text-[#0B1220]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search street, area, issue..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-sm text-[#0B1220] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-semibold text-[#334155] focus:outline-none focus:border-[#2563EB]"
          >
            <option value="upvotes">Top voted</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          <div className="inline-flex rounded-xl border border-[#E2E8F0] bg-[#F1F5F9] p-1">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'split' ? 'bg-white text-[#0B1220] shadow-xs' : 'text-[#64748B] hover:text-[#0B1220]'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-white text-[#0B1220] shadow-xs' : 'text-[#64748B] hover:text-[#0B1220]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'map' ? 'bg-white text-[#0B1220] shadow-xs' : 'text-[#64748B] hover:text-[#0B1220]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-[#E2E8F0]/60 animate-pulse" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="premium-card rounded-2xl p-12 text-center space-y-1.5">
          <p className="text-base font-semibold text-[#0B1220]">No issues match your filters</p>
          <p className="text-sm text-[#64748B]">Try clearing your search or switching status tabs.</p>
        </div>
      ) : viewMode === 'map' ? (
        <IssueMap issues={issues} onSelectIssue={setSelectedIssue} height="600px" />
      ) : viewMode === 'list' ? (
        <div className="max-w-4xl space-y-3">
          {issues.map((issue) => (
            <IssueCard
              key={issue._id}
              issue={issue}
              currentUserId={user?.id}
              onUpvote={handleUpvote}
              onSelect={setSelectedIssue}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            {issues.map((issue) => (
              <IssueCard
                key={issue._id}
                issue={issue}
                currentUserId={user?.id}
                onUpvote={handleUpvote}
                onSelect={setSelectedIssue}
                onHover={setHoveredId}
                isHighlighted={hoveredId === issue._id}
              />
            ))}
          </div>
          <div className="lg:col-span-5 lg:sticky lg:top-20">
            <IssueMap
              issues={issues}
              onSelectIssue={setSelectedIssue}
              highlightedId={hoveredId}
            />
          </div>
        </div>
      )}

      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          user={user}
          onClose={() => setSelectedIssue(null)}
          onIssueUpdated={handleIssueUpdated}
          onRequireAuth={() => {
            setSelectedIssue(null);
            navigate('/auth');
          }}
        />
      )}
    </div>
  );
}
