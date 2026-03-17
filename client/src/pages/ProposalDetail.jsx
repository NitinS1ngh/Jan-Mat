import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Tag, CheckCircle, MessageCircle, ArrowLeft, User } from 'lucide-react';
import api from '../api/axios';
import VoteButton from '../components/VoteButton';
import LegislativeTimeline from '../components/LegislativeTimeline';
import ConstitutionalBadge from '../components/ConstitutionalBadge';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  Active: 'badge-active',
  Top5: 'badge-top5',
  'Under Discussion': 'badge-discussion',
  Passed: 'badge-passed',
  Rejected: 'badge-rejected',
  'Needs Revision': 'badge-revision',
};

export default function ProposalDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [proposal, setProposal] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, cRes] = await Promise.all([
          api.get(`/proposals/${id}`),
          api.get(`/proposals/${id}/comments`),
        ]);
        setProposal(pRes.data.proposal);
        setComments(cRes.data.comments);
      } catch (err) {
        toast.error('Could not load proposal.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) { toast.error('Please sign in to comment.'); return; }
    setSubmitting(true);
    try {
      const res = await api.post(`/proposals/${id}/comments`, { body: commentText });
      setComments(c => [res.data.comment, ...c]);
      setCommentText('');
      toast.success('Comment posted!');
    } catch (err) {
      toast.error('Could not post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="h-8 w-48 bg-gray-200 animate-pulse mb-4" />
        <div className="h-64 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!proposal) return (
    <div className="page-container py-20 text-center">
      <h2 className="font-serif text-2xl text-navy-700 mb-3">Proposal not found</h2>
      <Link to="/proposals" className="btn-primary">Back to Feed</Link>
    </div>
  );

  const dateStr = new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const statusCls = STATUS_MAP[proposal.status] || 'badge-active';

  return (
    <div className="page-enter">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="page-container py-3">
          <Link to="/proposals" className="flex items-center gap-1.5 text-sm font-sans text-gray-500 hover:text-navy-800 w-fit">
            <ArrowLeft className="w-4 h-4" /> All Proposals
          </Link>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge border-blue-200 text-blue-700 bg-blue-50 text-[10px]">{proposal.category}</span>
              <span className={`${statusCls} text-[10px]`}>{proposal.status === 'Top5' ? "People's Choice" : proposal.status}</span>
            </div>

            <h1 className="font-serif font-bold text-navy-800 text-3xl sm:text-4xl leading-snug mb-5">
              {proposal.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-gray-500 mb-6 pb-6 border-b border-gray-200">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {proposal.author?.name}
                {proposal.author?.aadhaarVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-sienna-400" title="Aadhaar Verified" />
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {dateStr}
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5" />
                {comments.length} comments
              </span>
            </div>

            <div className="prose max-w-none mb-8">
              <p className="font-sans text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {proposal.description}
              </p>
            </div>

            {/* AI Summary */}
            {proposal.whyItMatters && (
              <div className="bg-navy-50 border border-navy-200 p-5 mb-8">
                <p className="section-label text-navy-600 mb-2">AI Impact Analysis</p>
                <p className="font-serif font-semibold text-navy-800 text-lg mb-2">Why It Matters</p>
                <p className="font-sans text-navy-700 text-sm leading-relaxed">{proposal.whyItMatters}</p>
                {proposal.sentimentSummary && (
                  <p className="font-sans text-navy-600 text-sm mt-2 italic border-t border-navy-200 pt-2">
                    Public Sentiment: {proposal.sentimentSummary}
                  </p>
                )}
              </div>
            )}

            {/* Needs Revision Notice */}
            {proposal.status === 'Needs Revision' && proposal.aiSummary && (
              <div className="border border-amber-300 bg-amber-50 p-5 mb-8">
                <p className="text-xs font-sans font-bold uppercase tracking-widest text-amber-700 mb-2">⚠ Constitutional Review Required</p>
                <p className="font-sans text-amber-800 text-sm leading-relaxed">{proposal.aiSummary}</p>
              </div>
            )}

            {/* Votes */}
            <div className="border border-gray-200 bg-white p-4 mb-8">
              <p className="label mb-3">Cast Your Vote</p>
              <VoteButton proposal={proposal} />
            </div>

            {/* Comments */}
            <section>
              <h2 className="font-serif font-semibold text-navy-800 text-xl mb-4">
                Public Debate ({comments.length})
              </h2>
              {user ? (
                <form onSubmit={handleComment} className="mb-6">
                  <textarea
                    className="input-field mb-2 resize-none"
                    rows={3}
                    placeholder="Share your perspective on this proposal..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    maxLength={1000}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{commentText.length}/1000</span>
                    <button type="submit" disabled={submitting || !commentText.trim()} className="btn-primary text-xs py-2 disabled:opacity-50">
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="border border-gray-200 bg-gray-50 p-4 mb-6 text-sm font-sans text-gray-600 text-center">
                  <Link to="/login" className="text-sienna-600 font-semibold">Sign in</Link> to join the debate.
                </div>
              )}

              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm font-sans text-gray-500 text-center py-6 border border-dashed border-gray-200">
                    No comments yet. Be the first to speak up.
                  </p>
                ) : (
                  comments.map(c => (
                    <div key={c._id} className="border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="w-6 h-6 bg-navy-100 flex items-center justify-center">
                            <span className="text-navy-700 text-[10px] font-bold">{c.author?.name?.[0]?.toUpperCase()}</span>
                          </div>
                          <span className="font-semibold text-navy-700">{c.author?.name}</span>
                          {c.author?.aadhaarVerified && <CheckCircle className="w-3 h-3 text-sienna-400" />}
                          <span className="text-gray-400">·</span>
                          <span>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                      <p className="font-sans text-gray-700 text-sm leading-relaxed">{c.body}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card">
              <LegislativeTimeline currentStage={proposal.timelineStage || 'Community Voting'} />
            </div>

            {proposal.constitutionalScore && (
              <ConstitutionalBadge
                score={proposal.constitutionalScore}
                analysis={proposal.constitutionalAnalysis}
              />
            )}

            {proposal.impactScore && (
              <div className="card">
                <p className="section-label mb-2">Impact Score</p>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-serif font-bold text-4xl text-navy-800">{proposal.impactScore}</span>
                  <span className="font-sans text-gray-500 text-sm mb-1">/100</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sienna-500 transition-all duration-500"
                    style={{ width: `${proposal.impactScore}%` }}
                  />
                </div>
              </div>
            )}

            <div className="card">
              <p className="section-label mb-3">Proposal Details</p>
              <dl className="space-y-2 text-sm font-sans">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Category</dt>
                  <dd className="font-semibold text-navy-700">{proposal.category}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Status</dt>
                  <dd className="font-semibold text-navy-700">{proposal.status}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Upvotes</dt>
                  <dd className="font-semibold text-navy-700">{proposal.upvoteCount?.toLocaleString('en-IN')}</dd>
                </div>
                {proposal.analysedAt && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">AI Analysed</dt>
                    <dd className="font-semibold text-navy-700">{new Date(proposal.analysedAt).toLocaleDateString('en-IN')}</dd>
                  </div>
                )}
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
