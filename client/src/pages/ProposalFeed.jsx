import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import api from '../api/axios';
import ProposalCard from '../components/ProposalCard';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Health', 'Technology', 'Education', 'Environment', 'Economy', 'Infrastructure', 'Social Justice', 'Agriculture', 'Defence', 'Other'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'upvotes', label: 'Most Upvoted' },
];

export default function ProposalFeed() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [searchInput, setSearchInput] = useState('');

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort, page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const res = await api.get('/proposals', { params });
      setProposals(res.data.proposals);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="page-container py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="section-label">Browse</p>
              <h1 className="font-serif font-bold text-navy-800 text-3xl">Citizen Proposals</h1>
              <p className="font-sans text-gray-500 text-sm mt-1">{total.toLocaleString('en-IN')} proposals from citizens across India</p>
            </div>
            {user && (
              <Link to="/proposals/new" className="btn-sienna flex items-center gap-2 w-fit flex-shrink-0">
                <Plus className="w-4 h-4" /> Submit Proposal
              </Link>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="mt-5 flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                className="input-field pl-9"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary px-4">Search</button>
          </form>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-52 flex-shrink-0">
            <div>
              <p className="label flex items-center gap-2"><SlidersHorizontal className="w-3.5 h-3.5" /> Sort By</p>
              <div className="space-y-1">
                {SORTS.map(s => (
                  <button key={s.value} onClick={() => { setSort(s.value); setPage(1); }}
                    className={`w-full text-left px-3 py-2 text-sm font-sans transition-colors ${
                      sort === s.value ? 'bg-navy-800 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="label">Category</p>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => { setCategory(cat); setPage(1); }}
                    className={`w-full text-left px-3 py-2 text-sm font-sans transition-colors ${
                      category === cat ? 'bg-navy-800 text-white font-semibold' : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Proposals Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card h-48 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : proposals.length === 0 ? (
              <div className="card text-center py-16">
                <p className="font-serif font-semibold text-navy-700 text-xl mb-2">No proposals found</p>
                <p className="font-sans text-gray-500 text-sm mb-4">Try a different search or category filter.</p>
                {user && <Link to="/proposals/new" className="btn-primary">Be the first to propose</Link>}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {proposals.map(p => <ProposalCard key={p._id} proposal={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="btn-secondary px-4 py-2 text-xs disabled:opacity-40">← Prev</button>
                    {[...Array(pages)].map((_, i) => (
                      <button key={i} onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 text-xs font-sans font-semibold border transition-colors ${
                          page === i + 1 ? 'bg-navy-800 text-white border-navy-800' : 'border-gray-300 text-navy-700 hover:border-navy-800'
                        }`}>
                        {i + 1}
                      </button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
                      className="btn-secondary px-4 py-2 text-xs disabled:opacity-40">Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
