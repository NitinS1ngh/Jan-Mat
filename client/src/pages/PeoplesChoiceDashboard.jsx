import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Star, TrendingUp, MessageSquare, CheckCircle, AlertCircle, Gavel } from 'lucide-react';
import api from '../api/axios';
import LegislativeTimeline from '../components/LegislativeTimeline';

const STATUS_TRACKER = ['Active', 'Top5', 'Under Discussion', 'Passed'];

const DECISION_STYLES = {
  'Made into Law': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', dot: 'bg-green-500', label: '✅ Made into Law' },
  'Rejected by Parliament': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', dot: 'bg-red-500', label: '❌ Rejected by Parliament' },
  'Under Parliamentary Review': { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-800', dot: 'bg-amber-500', label: '🔄 Under Parliamentary Review' },
};

function StatusTracker({ currentStatus, parliamentDecision }) {
  const steps = [
    { key: 'Active', label: 'Citizen Idea' },
    { key: 'Top5', label: 'AI Verified' },
    { key: 'Under Discussion', label: 'Parliamentary Review' },
    { key: 'Passed', label: 'Enacted' },
  ];

  // Override index based on parliament decision so the tracker
  // advances even if proposal.status stays 'Top5'
  let currentIdx = steps.findIndex(s => s.key === currentStatus);
  if (parliamentDecision === 'Made into Law') {
    currentIdx = 3; // all 4 steps lit
  } else if (parliamentDecision === 'Under Parliamentary Review' || parliamentDecision === 'Rejected by Parliament') {
    currentIdx = Math.max(currentIdx, 2); // at least Parliamentary Review lit
  }

  return (
    <div className="flex items-center gap-0 mt-3">
      {steps.map((step, i) => {
        const isDone = i <= currentIdx;
        // For "Enacted" step, use green colour when Made into Law
        const isEnacted = step.key === 'Passed' && parliamentDecision === 'Made into Law';
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className={`flex flex-col items-center gap-1 flex-1 ${i === 0 ? 'items-start' : i === steps.length - 1 ? 'items-end' : 'items-center'}`}>
              <div className={`w-3 h-3 rounded-full border-2 transition-all ${
                isEnacted ? 'bg-green-500 border-green-500' : isDone ? 'bg-sienna-500 border-sienna-500' : 'bg-white border-gray-300'
              }`} />
              <span className={`text-[9px] font-sans font-semibold uppercase tracking-wide whitespace-nowrap ${
                isEnacted ? 'text-green-600' : isDone ? 'text-sienna-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 ${i < currentIdx ? 'bg-sienna-500' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PeoplesChoiceDashboard() {
  const [top5, setTop5] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/proposals/top5')
      .then(res => setTop5(res.data.proposals))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="bg-navy-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40" />
        <div className="page-container py-12 relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5 text-sienna-400" />
                <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-sienna-400">People's Choice</p>
              </div>
              <h1 className="font-serif font-bold text-white text-4xl sm:text-5xl mb-3">The Top 5 Proposals</h1>
              <p className="font-sans text-navy-200 text-base max-w-xl">
                Each month, our AI Constitutional Analyst reviews the top 50 most-voted proposals and surfaces the 5 most impactful, legally viable ideas for Parliamentary consideration.
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="text-xs font-sans text-navy-400 uppercase tracking-widest mb-1">AI Engine Status</p>
              <div className="flex items-center gap-2 justify-end">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-sans text-white font-medium">Active · Weekly Cycle</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-10">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-gray-100" />)}
          </div>
        ) : top5.length === 0 ? (
          <div className="card text-center py-20">
            <Star className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h2 className="font-serif font-bold text-navy-700 text-2xl mb-2">No Top 5 Yet</h2>
            <p className="font-sans text-gray-500 text-sm mb-4 max-w-md mx-auto">
              The AI Constitutional Analyst hasn't run yet, or there aren't enough proposals. Check back after the weekly analysis cycle.
            </p>
            <Link to="/proposals" className="btn-primary">Browse & Vote on Proposals</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {top5.map((proposal, index) => (
              <article key={proposal._id} className="bg-white border border-gray-200 overflow-hidden hover:border-navy-300 transition-all duration-200">
                <div className="flex">
                  {/* Rank Number */}
                  <div className="bg-navy-800 flex items-center justify-center w-14 sm:w-20 flex-shrink-0">
                    <span className="font-serif font-bold text-white text-3xl sm:text-4xl opacity-60">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="badge border-blue-200 text-blue-700 bg-blue-50 text-[10px] mb-2 block w-fit">{proposal.category}</span>
                        <Link to={`/proposals/${proposal._id}`}>
                          <h2 className="font-serif font-bold text-navy-800 text-xl sm:text-2xl leading-snug hover:text-navy-600 transition-colors">
                            {proposal.title}
                          </h2>
                        </Link>
                      </div>
                      {/* Scores */}
                      <div className="flex gap-3 flex-shrink-0">
                        {proposal.constitutionalScore && (
                          <div className="border border-gray-200 px-3 py-2 text-center min-w-[70px]">
                            <Shield className="w-4 h-4 text-green-600 mx-auto mb-0.5" />
                            <p className="font-serif font-bold text-navy-800 text-xl leading-none">{proposal.constitutionalScore}</p>
                            <p className="text-[9px] font-sans text-gray-400 uppercase tracking-wide mt-0.5">Const.</p>
                          </div>
                        )}
                        {proposal.impactScore && (
                          <div className="border border-gray-200 px-3 py-2 text-center min-w-[70px]">
                            <TrendingUp className="w-4 h-4 text-sienna-500 mx-auto mb-0.5" />
                            <p className="font-serif font-bold text-navy-800 text-xl leading-none">{proposal.impactScore}</p>
                            <p className="text-[9px] font-sans text-gray-400 uppercase tracking-wide mt-0.5">Impact</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Why It Matters */}
                    {proposal.whyItMatters && (
                      <div className="mb-4">
                        <p className="text-[10px] font-sans font-bold text-sienna-600 uppercase tracking-widest mb-1.5">Why It Matters</p>
                        <p className="font-sans text-gray-600 text-sm leading-relaxed">{proposal.whyItMatters}</p>
                      </div>
                    )}

                    {/* Constitutional Analysis */}
                    {proposal.constitutionalAnalysis && (
                      <div className="bg-green-50 border border-green-200 p-3 mb-4 flex gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-sans text-green-800 leading-relaxed">{proposal.constitutionalAnalysis}</p>
                      </div>
                    )}

                    {/* Sentiment */}
                    {proposal.sentimentSummary && (
                      <div className="flex items-start gap-2 mb-4">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs font-sans text-gray-500 italic">{proposal.sentimentSummary}</p>
                      </div>
                    )}

                    {/* Status Tracker */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-gray-400 mb-2">Legislative Journey</p>
                      <StatusTracker currentStatus={proposal.status} parliamentDecision={proposal.parliamentDecision} />
                    </div>

                    {/* Parliament Decision (read-only) */}
                    {proposal.parliamentDecision && (() => {
                      const style = DECISION_STYLES[proposal.parliamentDecision];
                      return (
                        <div className={`mt-4 p-3 border ${style?.bg} ${style?.border} flex items-start gap-3`}>
                          <Gavel className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style?.text}`} />
                          <div>
                            <p className={`text-xs font-sans font-bold ${style?.text}`}>
                              Parliament's Decision: {style?.label}
                            </p>
                            {proposal.parliamentDecisionNote && (
                              <p className={`text-xs font-sans mt-1 italic ${style?.text} opacity-80`}>
                                {proposal.parliamentDecisionNote}
                              </p>
                            )}
                            {proposal.parliamentDecisionAt && (
                              <p className="text-[10px] font-sans text-gray-400 mt-1">
                                Decided on: {new Date(proposal.parliamentDecisionAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-sans">
                        <span>👍 {proposal.upvoteCount?.toLocaleString('en-IN')} votes</span>
                        {proposal.author?.aadhaarVerified && (
                          <span className="flex items-center gap-1 text-sienna-500"><CheckCircle className="w-3 h-3" /> Verified Author</span>
                        )}
                      </div>
                      <Link to={`/proposals/${proposal._id}`}
                        className="text-xs font-sans font-semibold text-navy-700 border border-navy-300 px-3 py-1.5 hover:bg-navy-800 hover:text-white hover:border-navy-800 transition-colors">
                        Read Full Proposal →
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 border border-gray-200 bg-gray-50 p-5 text-sm font-sans text-gray-600 leading-relaxed">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-navy-700 mb-1">About the AI Constitutional Analysis</p>
              <p>All Top 5 proposals are filtered by our AI Constitutional Analyst using the Basic Structure Doctrine of the Indian Constitution. Proposals violating Fundamental Rights (Articles 14, 19, 21) or the principles of Secularism, Federalism, or Judicial Independence are automatically excluded. This list is advisory and does not constitute official Parliamentary agenda.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
