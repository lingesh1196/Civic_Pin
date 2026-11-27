import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const [showMap, setShowMap] = useState(false);
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
      setIssues((prev) => {
        const updatedList = prev.map((i) => (i._id === issueId ? data.issue : i));
        if (sort === 'upvotes') {
          return [...updatedList].sort(
            (a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
          );
        }
        return updatedList;
      });
      if (selectedIssue?._id === issueId) {
        setSelectedIssue(data.issue);
      }
      apiRequest('/api/stats').then(setStats).catch(() => {});
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  }

  function handleIssueUpdated(updated) {
    setIssues((prev) => {
      const updatedList = prev.map((i) => (i._id === updated._id ? updated : i));
      if (sort === 'upvotes') {
        return [...updatedList].sort(
          (a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0)
        );
      }
      return updatedList;
    });
    setSelectedIssue(updated);
    apiRequest('/api/stats').then(setStats).catch(() => {});
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Simple, human intro */}
      <section className="space-y-2 pb-6 border-b border-[#E3DDD3]">
        <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#1C211E] tracking-tight">
          Local civic issues reported by residents
        </h1>
        <p className="text-[15.5px] text-[#5C635E] max-w-2xl leading-relaxed">
          Potholes, uncollected garbage, broken streetlights, and water leaks. Upvote the ones affecting your street so local teams fix them first.
        </p>
        {stats && (
          <p className="text-sm text-[#6D746F] pt-1">
            <strong className="text-[#1C211E] font-semibold">{stats.total}</strong> reports filed —{' '}
            <strong className="text-[#9A5B13] font-semibold">{stats.open}</strong> open,{' '}
            <strong className="text-[#1E4B7A] font-semibold">{stats.inProgress}</strong> in progress,{' '}
            <strong className="text-[#1F5E3B] font-semibold">{stats.resolved}</strong> resolved ({stats.resolutionRate}% fixed).
          </p>
        )}
      </section>

      {/* Plain, honest filter bar */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatus(tab)}
              className={`pb-1 border-b-2 transition-colors cursor-pointer ${
                status === tab
                  ? 'border-[#B84A27] text-[#1C211E] font-semibold'
                  : 'border-transparent text-[#6D746F] hover:text-[#1C211E]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search street or issue..."
            className="px-3 py-1.5 rounded-md bg-white border border-[#DDD6CB] text-[#1C211E] placeholder:text-[#8A918C] focus:outline-none focus:border-[#1C211E] w-48 sm:w-56"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-white border border-[#DDD6CB] text-[#1C211E] focus:outline-none focus:border-[#1C211E]"
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
            className="px-3 py-1.5 rounded-md bg-white border border-[#DDD6CB] text-[#1C211E] focus:outline-none focus:border-[#1C211E]"
          >
            <option value="upvotes">Most upvoted</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button
            onClick={() => setShowMap((v) => !v)}
            className={`px-3 py-1.5 rounded-md border text-sm font-medium cursor-pointer transition-colors ${
              showMap
                ? 'bg-[#1C211E] text-white border-[#1C211E]'
                : 'bg-white text-[#1C211E] border-[#DDD6CB] hover:border-[#1C211E]'
            }`}
          >
            {showMap ? 'Hide map' : 'Show map'}
          </button>
        </div>
      </section>

      {/* Main Content */}
      {loading ? (
        <div className="py-12 text-sm text-[#6D746F]">Loading reports...</div>
      ) : issues.length === 0 ? (
        <div className="py-14 text-center border-t border-[#E3DDD3] space-y-1">
          <p className="font-serif-editorial text-xl text-[#1C211E]">No reports match your filters.</p>
          <p className="text-sm text-[#6D746F]">Try clearing your search or switching tabs.</p>
        </div>
      ) : (
        <div className={showMap ? 'grid grid-cols-1 lg:grid-cols-12 gap-8 items-start' : ''}>
          <div className={`${showMap ? 'lg:col-span-7' : 'max-w-4xl'} divide-y divide-[#E3DDD3] border-t border-b border-[#E3DDD3]`}>
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

          {showMap && (
            <div className="lg:col-span-5 lg:sticky lg:top-6">
              <IssueMap
                issues={issues}
                onSelectIssue={setSelectedIssue}
                highlightedId={hoveredId}
              />
            </div>
          )}
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
