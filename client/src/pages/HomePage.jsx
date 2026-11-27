import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Columns2, List, Map as MapIcon } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../components/StatusBadge';
import IssueCard from '../components/IssueCard';
import IssueMap from '../components/IssueMap';
import IssueDetailModal from '../components/IssueDetailModal';

const STATUS_TABS = ['All', 'Open', 'In Progress', 'Resolved'];

export default function HomePage({ refreshSignal, onOpenReport }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ledgerRef = useRef(null);

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
    <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Iconic Municipal Poster Hero */}
      <section className="space-y-6 pb-10 border-b-2 border-[#141414]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-[#0F1E36] text-[#FFC700] font-mono-code text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5">
            MUNICIPAL CORPORATION · DIGITAL COMPLAINT CELL
          </span>
          <span className="font-mono-code text-[11px] uppercase tracking-widest text-[#5A5A52]">
            LIVE LEDGER · UPDATED EVERY REQUEST
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8 space-y-6">
            <h1 className="font-poster text-6xl sm:text-7xl md:text-[84px] uppercase leading-[0.94] text-[#141414]">
              <span className="block">THE POTHOLE</span>
              <span className="block">WON&apos;T FIX</span>
              <span className="inline-block bg-[#FFC700] px-3 py-1 mt-1">ITSELF.</span>
            </h1>

            <p className="text-base sm:text-[17px] text-[#4A4A45] max-w-2xl leading-relaxed">
              CivicPin is a public reporting channel for everyday civic faults — potholes, overflowing garbage,
              dead streetlights, burst mains. Attach a photo and a location, get a ticket number instantly, and
              let your neighbours push it up the ward&apos;s work order queue. Administrators watch every ticket
              move on one dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={onOpenReport}
                className="brutal-btn brutal-shadow bg-[#FFC700] text-[#141414] border-2 border-[#141414] font-mono-code text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3.5 cursor-pointer"
              >
                + FILE A COMPLAINT
              </button>
              <button
                onClick={() => ledgerRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="brutal-btn brutal-shadow bg-white text-[#141414] border-2 border-[#141414] font-mono-code text-xs sm:text-sm font-bold uppercase tracking-wider px-6 py-3.5 cursor-pointer"
              >
                BROWSE LIVE LEDGER →
              </button>
            </div>
          </div>

          {/* Right: Live Municipal Counter Box */}
          {stats && (
            <div className="lg:col-span-4 bg-white border-2 border-[#141414] brutal-shadow p-5 space-y-4">
              <div className="font-mono-code text-[11px] font-bold uppercase tracking-widest text-[#5A5A52] border-b-2 border-[#141414] pb-2">
                WARD WORK-ORDER TELEMETRY
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F3F0E6] border border-[#141414] p-3">
                  <div className="font-mono-code text-[10px] uppercase text-[#5A5A52]">OPEN</div>
                  <div className="font-poster text-3xl text-[#141414] mt-0.5">{stats.open}</div>
                </div>
                <div className="bg-[#F3F0E6] border border-[#141414] p-3">
                  <div className="font-mono-code text-[10px] uppercase text-[#5A5A52]">IN PROGRESS</div>
                  <div className="font-poster text-3xl text-[#0F1E36] mt-0.5">{stats.inProgress}</div>
                </div>
                <div className="bg-[#F3F0E6] border border-[#141414] p-3">
                  <div className="font-mono-code text-[10px] uppercase text-[#5A5A52]">RESOLVED</div>
                  <div className="font-poster text-3xl text-[#1B6E3A] mt-0.5">{stats.resolved}</div>
                </div>
                <div className="bg-[#FFC700] border border-[#141414] p-3">
                  <div className="font-mono-code text-[10px] uppercase text-[#141414] font-bold">FIXED RATE</div>
                  <div className="font-poster text-3xl text-[#141414] mt-0.5">{stats.resolutionRate}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Filter & View Bar */}
      <section ref={ledgerRef} className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`px-3.5 py-2 border-2 border-[#141414] font-mono-code text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  status === tab
                    ? 'bg-[#141414] text-[#FFC700]'
                    : 'bg-white text-[#141414] hover:bg-[#FFC700]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#141414] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search street, ward, ticket..."
                className="w-full pl-9 pr-3 py-2 bg-white border-2 border-[#141414] text-sm font-mono-code focus:outline-none focus:bg-[#FFFDF5]"
              />
            </div>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 bg-white border-2 border-[#141414] font-mono-code text-xs font-semibold uppercase text-[#141414] focus:outline-none"
            >
              <option value="All">ALL CATEGORIES</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 bg-white border-2 border-[#141414] font-mono-code text-xs font-semibold uppercase text-[#141414] focus:outline-none"
            >
              <option value="upvotes">TOP VOTED</option>
              <option value="newest">NEWEST</option>
              <option value="oldest">OLDEST</option>
            </select>

            <div className="inline-flex border-2 border-[#141414] bg-white">
              <button
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-2 font-mono-code text-xs font-bold inline-flex items-center gap-1 cursor-pointer ${
                  viewMode === 'split' ? 'bg-[#141414] text-[#FFC700]' : 'text-[#141414] hover:bg-[#F3F0E6]'
                }`}
              >
                <Columns2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SPLIT</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-2 font-mono-code text-xs font-bold inline-flex items-center gap-1 border-l-2 border-[#141414] cursor-pointer ${
                  viewMode === 'list' ? 'bg-[#141414] text-[#FFC700]' : 'text-[#141414] hover:bg-[#F3F0E6]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LIST</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-2 font-mono-code text-xs font-bold inline-flex items-center gap-1 border-l-2 border-[#141414] cursor-pointer ${
                  viewMode === 'map' ? 'bg-[#141414] text-[#FFC700]' : 'text-[#141414] hover:bg-[#F3F0E6]'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">MAP</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Workspace */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-[#E5E0D0] border-2 border-[#141414] animate-pulse" />
            ))}
          </div>
        ) : issues.length === 0 ? (
          <div className="bg-white border-2 border-[#141414] brutal-shadow p-12 text-center space-y-2">
            <p className="font-poster text-2xl uppercase text-[#141414]">NO TICKETS MATCH THIS FILTER</p>
            <p className="font-mono-code text-xs text-[#5A5A52]">
              Clear your search query or file a new complaint.
            </p>
          </div>
        ) : viewMode === 'map' ? (
          <div className="border-2 border-[#141414] brutal-shadow">
            <IssueMap issues={issues} onSelectIssue={setSelectedIssue} height="600px" />
          </div>
        ) : viewMode === 'list' ? (
          <div className="max-w-4xl space-y-4">
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
            <div className="lg:col-span-7 space-y-4">
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
            <div className="lg:col-span-5 lg:sticky lg:top-24 border-2 border-[#141414] brutal-shadow">
              <IssueMap
                issues={issues}
                onSelectIssue={setSelectedIssue}
                highlightedId={hoveredId}
              />
            </div>
          </div>
        )}
      </section>

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
