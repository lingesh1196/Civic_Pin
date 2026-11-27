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
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Editorial Civic Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E4DFD3]">
        <div className="space-y-1.5">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#18181B]">
            Neighborhood Civic Log
          </h1>
          <p className="text-sm sm:text-[15px] text-[#57534E] max-w-xl">
            Street-level reports filed by residents, prioritized by community votes, and tracked through municipal repair.
          </p>
        </div>

        {stats && (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono-code text-xs text-[#57534E]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
              <strong className="text-[#18181B]">{stats.open}</strong> open
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <strong className="text-[#18181B]">{stats.inProgress}</strong> in progress
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
              <strong className="text-[#18181B]">{stats.resolved}</strong> resolved
            </span>
            <span className="text-[#2D6A4F] font-semibold border-l border-[#D6D0C4] pl-4">
              {stats.resolutionRate}% fixed
            </span>
          </div>
        )}
      </section>

      {/* Filter & View Bar */}
      <section className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                status === tab
                  ? 'bg-[#18181B] text-[#FFFDF9]'
                  : 'bg-white border border-[#E4DFD3] text-[#57534E] hover:border-[#18181B] hover:text-[#18181B]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search street, area, issue..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#E4DFD3] text-sm focus:outline-none focus:border-[#18181B]"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E4DFD3] text-sm text-[#18181B] focus:outline-none focus:border-[#18181B]"
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
            className="px-3 py-1.5 rounded-lg bg-white border border-[#E4DFD3] text-sm text-[#18181B] focus:outline-none focus:border-[#18181B]"
          >
            <option value="upvotes">Top voted</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>

          <div className="inline-flex rounded-lg border border-[#E4DFD3] bg-white p-0.5">
            <button
              onClick={() => setViewMode('split')}
              title="Split view"
              className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                viewMode === 'split' ? 'bg-[#18181B] text-white' : 'text-[#57534E] hover:text-[#18181B]'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                viewMode === 'list' ? 'bg-[#18181B] text-white' : 'text-[#57534E] hover:text-[#18181B]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              title="Map view"
              className={`px-2.5 py-1 rounded-md text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                viewMode === 'map' ? 'bg-[#18181B] text-white' : 'text-[#57534E] hover:text-[#18181B]'
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
            <div key={n} className="h-32 rounded-xl bg-[#EAE5DA] animate-pulse" />
          ))}
        </div>
      ) : issues.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E4DFD3] p-12 text-center space-y-1.5">
          <p className="font-display text-lg font-semibold text-[#18181B]">No reports match these filters</p>
          <p className="text-sm text-[#78716C]">Try switching status tabs or clearing your search query.</p>
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
