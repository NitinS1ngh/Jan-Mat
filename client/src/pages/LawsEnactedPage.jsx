import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, CheckCircle, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function LawsEnactedPage() {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/proposals/laws')
      .then(res => setLaws(res.data.proposals))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="bg-navy-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-40" />
        <div className="page-container py-12 relative">
          <div className="flex items-center gap-2 mb-3">
            <Gavel className="w-5 h-5 text-green-400" />
            <p className="text-xs font-sans font-semibold uppercase tracking-[0.2em] text-green-400">Parliament Enacted</p>
          </div>
          <h1 className="font-serif font-bold text-white text-4xl sm:text-5xl mb-3">Laws Enacted</h1>
          <p className="font-sans text-navy-200 text-base max-w-xl">
            These citizen-proposed initiatives have been reviewed by Parliament and officially enacted into law.
            Each entry originated as a public suggestion on Jan-Mat.
          </p>
        </div>
      </div>

      <div className="page-container py-10">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-100" />)}
          </div>
        ) : laws.length === 0 ? (
          <div className="card text-center py-20">
            <Gavel className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h2 className="font-serif font-bold text-navy-700 text-2xl mb-2">No Laws Enacted Yet</h2>
            <p className="font-sans text-gray-500 text-sm mb-4 max-w-md mx-auto">
              Once Parliament reviews and enacts a citizen proposal, it will appear here.
            </p>
            <Link to="/peoples-choice" className="btn-primary">View Top 5 Proposals</Link>
          </div>
        ) : (
          <div className="space-y-5">
            {laws.map((law, index) => (
              <article key={law._id} className="bg-white border border-green-200 overflow-hidden hover:border-green-400 transition-all duration-200">
                <div className="flex">
                  {/* Index */}
                  <div className="bg-green-700 flex items-center justify-center w-14 sm:w-20 flex-shrink-0">
                    <span className="font-serif font-bold text-white text-3xl sm:text-4xl opacity-70">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="badge border-green-200 text-green-700 bg-green-50 text-[10px] mb-2 block w-fit">
                          {law.category}
                        </span>
                        <Link to={`/proposals/${law._id}`}>
                          <h2 className="font-serif font-bold text-navy-800 text-xl sm:text-2xl leading-snug hover:text-navy-600 transition-colors">
                            {law.title}
                          </h2>
                        </Link>
                      </div>

                      {/* Scores */}
                      <div className="flex gap-3 flex-shrink-0">
                        {law.constitutionalScore && (
                          <div className="border border-gray-200 px-3 py-2 text-center min-w-[70px]">
                            <Shield className="w-4 h-4 text-green-600 mx-auto mb-0.5" />
                            <p className="font-serif font-bold text-navy-800 text-xl leading-none">{law.constitutionalScore}</p>
                            <p className="text-[9px] font-sans text-gray-400 uppercase tracking-wide mt-0.5">Const.</p>
                          </div>
                        )}
                        {law.impactScore && (
                          <div className="border border-gray-200 px-3 py-2 text-center min-w-[70px]">
                            <TrendingUp className="w-4 h-4 text-sienna-500 mx-auto mb-0.5" />
                            <p className="font-serif font-bold text-navy-800 text-xl leading-none">{law.impactScore}</p>
                            <p className="text-[9px] font-sans text-gray-400 uppercase tracking-wide mt-0.5">Impact</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Parliament Decision Banner */}
                    <div className="bg-green-50 border border-green-200 p-3 mb-4 flex items-start gap-2">
                      <Gavel className="w-4 h-4 text-green-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-sans font-bold text-green-800">✅ Made into Law by Parliament</p>
                        {law.parliamentDecisionNote && (
                          <p className="text-xs font-sans text-green-700 italic mt-0.5">{law.parliamentDecisionNote}</p>
                        )}
                        {law.parliamentDecisionAt && (
                          <p className="text-[10px] font-sans text-green-600 mt-1">
                            Enacted on{' '}
                            {new Date(law.parliamentDecisionAt).toLocaleDateString('en-IN', {
                              day: 'numeric', month: 'long', year: 'numeric',
                            })}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Why It Matters */}
                    {law.whyItMatters && (
                      <div className="mb-4">
                        <p className="text-[10px] font-sans font-bold text-sienna-600 uppercase tracking-widest mb-1.5">Why It Matters</p>
                        <p className="font-sans text-gray-600 text-sm leading-relaxed">{law.whyItMatters}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-sans">
                        <span>👍 {law.upvoteCount?.toLocaleString('en-IN')} votes</span>
                        {law.author?.aadhaarVerified && (
                          <span className="flex items-center gap-1 text-sienna-500">
                            <CheckCircle className="w-3 h-3" /> Verified Author
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/proposals/${law._id}`}
                        className="text-xs font-sans font-semibold text-navy-700 border border-navy-300 px-3 py-1.5 hover:bg-navy-800 hover:text-white hover:border-navy-800 transition-colors"
                      >
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
              <p className="font-semibold text-navy-700 mb-1">About These Laws</p>
              <p>These proposals originated from citizens on Jan-Mat, were selected by AI Constitutional analysis as Top 5, sent to Parliament for review, and then formally enacted. This page is updated by the admin parliamentary observer in real-time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
