import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  Shield, Zap, TrendingUp, CheckCircle, XCircle, Clock, AlertTriangle,
  RefreshCw, Gavel, X, FileText, ChevronDown,
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Active', 'Top5', 'Under Discussion', 'Passed', 'Rejected', 'Needs Revision', 'Archived'];
const TIMELINE_OPTIONS = ['Drafted', 'Community Voting', 'AI Constitutional Check', 'Sent to Parliament'];
const PARLIAMENT_DECISIONS = ['Under Parliamentary Review', 'Made into Law', 'Rejected by Parliament'];

const DECISION_STYLES = {
  'Made into Law': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', dot: 'bg-green-500' },
  'Rejected by Parliament': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', dot: 'bg-red-500' },
  'Under Parliamentary Review': { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', dot: 'bg-amber-500' },
};

/* ─── Parliament Decision Modal ──────────────────────────────────────── */
function ParliamentModal({ onClose, onSaved }) {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [decisions, setDecisions] = useState({}); // { [id]: { decision, note } }

  useEffect(() => {
    api.get('/admin/parliament-proposals')
      .then(res => {
        const list = res.data.proposals;
        setProposals(list);
        // Prefill existing decisions
        const prefilled = {};
        list.forEach(p => {
          prefilled[p._id] = {
            decision: p.parliamentDecision || 'Under Parliamentary Review',
            note: p.parliamentDecisionNote || '',
          };
        });
        setDecisions(prefilled);
      })
      .catch(() => toast.error('Failed to load parliament proposals'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (id) => {
    const { decision, note } = decisions[id] || {};
    if (!decision) return;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await api.put(`/admin/proposals/${id}/parliament-decision`, { decision, note });
      toast.success('Parliament decision saved!');
      setProposals(prev =>
        prev.map(p => p._id === id ? { ...p, parliamentDecision: decision, parliamentDecisionNote: note } : p)
      );
      onSaved();
    } catch {
      toast.error('Failed to save decision.');
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  const setField = (id, field, val) =>
    setDecisions(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-navy-700" />
            <h2 className="font-serif font-bold text-navy-800 text-xl">Parliament Decision Panel</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 animate-pulse rounded" />
              ))}
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="font-serif text-navy-700 text-lg mb-1">No proposals sent to Parliament yet</p>
              <p className="text-sm font-sans text-gray-500">Change a proposal's timeline stage to "Sent to Parliament" to see it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {proposals.map(proposal => {
                const d = decisions[proposal._id] || {};
                const style = DECISION_STYLES[proposal.parliamentDecision];
                return (
                  <div key={proposal._id} className="border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif font-semibold text-navy-800 text-sm leading-snug">{proposal.title}</h3>
                        <span className="text-[10px] font-sans text-gray-400">{proposal.category}</span>
                      </div>
                      {proposal.parliamentDecision && style && (
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold px-2 py-1 border ${style.bg} ${style.border} ${style.text} flex-shrink-0`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {proposal.parliamentDecision}
                        </span>
                      )}
                    </div>

                    {/* Decision select */}
                    <div className="mb-2">
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Parliament's Decision
                      </label>
                      <div className="relative">
                        <select
                          className="w-full border border-gray-300 text-sm font-sans px-3 py-2 bg-white focus:outline-none focus:border-navy-800 appearance-none pr-8"
                          value={d.decision || 'Under Parliamentary Review'}
                          onChange={e => setField(proposal._id, 'decision', e.target.value)}
                        >
                          {PARLIAMENT_DECISIONS.map(dec => (
                            <option key={dec} value={dec}>{dec}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Note textarea */}
                    <div className="mb-3">
                      <label className="block text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Parliament's Note (optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="E.g. Passed in Lok Sabha on 15 March 2026 with amendments..."
                        className="w-full border border-gray-300 text-sm font-sans px-3 py-2 bg-white focus:outline-none focus:border-navy-800 resize-none"
                        value={d.note || ''}
                        onChange={e => setField(proposal._id, 'note', e.target.value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Link
                        to={`/proposals/${proposal._id}`}
                        target="_blank"
                        className="text-xs font-sans text-navy-600 underline underline-offset-2"
                      >
                        View proposal ↗
                      </Link>
                      <button
                        onClick={() => handleSave(proposal._id)}
                        disabled={!!saving[proposal._id]}
                        className="flex items-center gap-1.5 bg-navy-800 text-white text-xs font-sans font-semibold px-4 py-2 hover:bg-navy-700 transition-colors disabled:opacity-60"
                      >
                        {saving[proposal._id] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                        Save Decision
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 flex-shrink-0">
          <p className="text-[10px] font-sans text-gray-400">
            Only proposals with timeline stage "Sent to Parliament" appear here. Decisions are visible to citizens in read-only mode.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [top5, setTop5] = useState([]);
  const [needsRevision, setNeedsRevision] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysing, setAnalysing] = useState(false);
  const [showParliamentModal, setShowParliamentModal] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, top5Res] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/top5'),
      ]);
      setStats(statsRes.data);
      setTop5(top5Res.data.top5);
      setNeedsRevision(top5Res.data.needsRevision);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const triggerAnalysis = async () => {
    setAnalysing(true);
    try {
      await api.post('/admin/trigger-analysis');
      toast.success('AI analysis complete! Top 5 has been updated.');
      await fetchData();
    } catch (err) {
      toast.error('AI analysis failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setAnalysing(false);
    }
  };

  const updateStatus = async (id, status, timelineStage) => {
    try {
      await api.put(`/admin/proposals/${id}/status`, { status, timelineStage });
      toast.success('Status updated!');
      await fetchData();
    } catch {
      toast.error('Status update failed.');
    }
  };

  if (authLoading) return <div className="page-container py-20 text-center"><p className="font-sans text-gray-500">Loading...</p></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div className="page-enter">
      {/* Parliament Decision Modal */}
      {showParliamentModal && (
        <ParliamentModal
          onClose={() => setShowParliamentModal(false)}
          onSaved={fetchData}
        />
      )}

      {/* Header */}
      <div className="bg-navy-800">
        <div className="page-container py-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-sienna-400" />
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-sienna-400">Admin · Parliamentary Observer</p>
              </div>
              <h1 className="font-serif font-bold text-white text-3xl">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Parliament Decision Button */}
              <button
                onClick={() => setShowParliamentModal(true)}
                className="flex items-center gap-2 bg-white/10 border border-white/20 text-white px-5 py-2.5 text-sm font-sans font-semibold hover:bg-white/20 transition-colors"
              >
                <Gavel className="w-4 h-4 text-green-400" />
                Parliament Decision
              </button>

              {/* Trigger AI Analysis */}
              <button
                onClick={triggerAnalysis}
                disabled={analysing}
                className="flex items-center gap-2 bg-sienna-500 text-white px-5 py-2.5 text-sm font-sans font-semibold border border-sienna-500 hover:bg-sienna-600 transition-colors disabled:opacity-60"
              >
                {analysing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {analysing ? 'Running AI Analysis...' : 'Trigger AI Analysis'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {[
              { label: 'Total Proposals', value: stats.total, icon: TrendingUp, color: 'text-navy-700' },
              { label: 'Active', value: stats.active, icon: Clock, color: 'text-blue-600' },
              { label: "People's Top 5", value: stats.top5, icon: Shield, color: 'text-sienna-600' },
              { label: 'Passed', value: stats.passed, icon: CheckCircle, color: 'text-green-600' },
              { label: 'Needs Revision', value: stats.needsRevision, icon: AlertTriangle, color: 'text-amber-600' },
            ].map(s => (
              <div key={s.label} className="card text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <p className="font-serif font-bold text-navy-800 text-2xl">{s.value}</p>
                <p className="text-xs font-sans text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Top 5 Management */}
        <div className="mb-10">
          <h2 className="font-serif font-bold text-navy-800 text-2xl mb-4">Current People's Top 5</h2>
          {loading ? (
            <div className="card animate-pulse h-40" />
          ) : top5.length === 0 ? (
            <div className="card text-center py-10">
              <p className="font-serif text-navy-600 text-lg mb-2">No Top 5 proposals yet</p>
              <p className="font-sans text-gray-500 text-sm mb-4">Click "Trigger AI Analysis" to generate the Top 5.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {top5.map((proposal, i) => (
                <div key={proposal._id} className="card flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-10 h-10 bg-navy-800 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif font-bold text-sienna-400 text-lg">{i + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-navy-800 text-base mb-1 truncate">{proposal.title}</h3>
                    <div className="flex flex-wrap gap-2 text-xs font-sans text-gray-500 mb-1">
                      <span>Category: {proposal.category}</span>
                      <span>·</span>
                      <span>👍 {proposal.upvoteCount?.toLocaleString('en-IN')}</span>
                      {proposal.constitutionalScore && <span>· Const: {proposal.constitutionalScore}/100</span>}
                    </div>
                    {/* Parliament Decision badge on card */}
                    {proposal.parliamentDecision && (() => {
                      const style = DECISION_STYLES[proposal.parliamentDecision];
                      return (
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-sans font-semibold px-2 py-0.5 border mb-2 ${style?.bg} ${style?.border} ${style?.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style?.dot}`} />
                          {proposal.parliamentDecision}
                        </span>
                      );
                    })()}
                    <div className="flex flex-wrap gap-2 items-center">
                      <select
                        className="border border-gray-300 text-xs font-sans px-2 py-1.5 bg-white focus:outline-none focus:border-navy-800"
                        value={proposal.status}
                        onChange={e => updateStatus(proposal._id, e.target.value, proposal.timelineStage)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <select
                        className="border border-gray-300 text-xs font-sans px-2 py-1.5 bg-white focus:outline-none focus:border-navy-800"
                        value={proposal.timelineStage || 'Community Voting'}
                        onChange={e => updateStatus(proposal._id, proposal.status, e.target.value)}
                      >
                        {TIMELINE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Link to={`/proposals/${proposal._id}`}
                        className="text-xs font-sans text-navy-600 border border-navy-300 px-2 py-1.5 hover:bg-navy-800 hover:text-white hover:border-navy-800 transition-colors">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Needs Revision */}
        {needsRevision.length > 0 && (
          <div>
            <h2 className="font-serif font-bold text-navy-800 text-2xl mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Flagged: Needs Constitutional Revision ({needsRevision.length})
            </h2>
            <div className="space-y-3">
              {needsRevision.map(proposal => (
                <div key={proposal._id} className="border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="font-sans font-semibold text-navy-800 text-sm mb-1">{proposal.title}</h3>
                      {proposal.aiSummary && (
                        <p className="text-xs font-sans text-amber-800 leading-relaxed mt-1">
                          <strong>AI Flag:</strong> {proposal.aiSummary}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <select
                        className="border border-amber-300 text-xs font-sans px-2 py-1.5 bg-white focus:outline-none"
                        value={proposal.status}
                        onChange={e => updateStatus(proposal._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <Link to={`/proposals/${proposal._id}`}
                        className="text-xs font-sans text-amber-700 border border-amber-300 px-2 py-1.5 hover:bg-amber-200 transition-colors">
                        View →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
