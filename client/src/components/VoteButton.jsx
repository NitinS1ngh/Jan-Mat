import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VoteButton({ proposal, onVoteUpdate }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    up: proposal.upvoteCount || 0,
    down: proposal.downvoteCount || 0,
  });
  const [userVote, setUserVote] = useState(() => {
    if (!user) return null;
    if (user.votedProposals?.includes(proposal._id)) return 'up';
    if (user.downvotedProposals?.includes(proposal._id)) return 'down';
    return null;
  });

  const vote = async (type) => {
    if (!user) { navigate('/login'); return; }
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.put(`/proposals/${proposal._id}/vote`, { type });
      setCounts({ up: res.data.upvoteCount, down: res.data.downvoteCount });
      setUserVote(res.data.userVote);
      if (onVoteUpdate) onVoteUpdate(res.data);
    } catch (err) {
      toast.error('Vote failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => vote('up')}
        disabled={loading}
        className={`vote-btn flex items-center gap-2 px-3 py-1.5 text-sm font-sans font-medium border transition-all duration-150 disabled:opacity-50 ${
          userVote === 'up'
            ? 'voted-up border-navy-800'
            : 'border-gray-300 text-navy-700 hover:border-navy-800 hover:text-navy-800 bg-white'
        }`}
      >
        <ThumbsUp className="w-3.5 h-3.5" />
        <span className="font-semibold">{counts.up.toLocaleString('en-IN')}</span>
      </button>
      <button
        onClick={() => vote('down')}
        disabled={loading}
        className={`vote-btn flex items-center gap-2 px-3 py-1.5 text-sm font-sans font-medium border transition-all duration-150 disabled:opacity-50 ${
          userVote === 'down'
            ? 'voted-down border-sienna-500'
            : 'border-gray-300 text-navy-700 hover:border-sienna-500 hover:text-sienna-600 bg-white'
        }`}
      >
        <ThumbsDown className="w-3.5 h-3.5" />
        <span className="font-semibold">{counts.down.toLocaleString('en-IN')}</span>
      </button>
    </div>
  );
}
