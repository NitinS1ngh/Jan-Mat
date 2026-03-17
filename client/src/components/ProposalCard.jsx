import { Link } from 'react-router-dom';
import { Calendar, Tag, CheckCircle } from 'lucide-react';
import VoteButton from './VoteButton';

const CATEGORY_COLORS = {
  Health: 'border-green-200 text-green-700 bg-green-50',
  Technology: 'border-blue-200 text-blue-700 bg-blue-50',
  Education: 'border-purple-200 text-purple-700 bg-purple-50',
  Environment: 'border-emerald-200 text-emerald-700 bg-emerald-50',
  Economy: 'border-amber-200 text-amber-700 bg-amber-50',
  Infrastructure: 'border-gray-200 text-gray-700 bg-gray-50',
  'Social Justice': 'border-pink-200 text-pink-700 bg-pink-50',
  Agriculture: 'border-lime-200 text-lime-700 bg-lime-50',
  Defence: 'border-red-200 text-red-700 bg-red-50',
  Other: 'border-gray-200 text-gray-600 bg-gray-50',
};

const STATUS_MAP = {
  Active: { label: 'Active', cls: 'badge-active' },
  Top5: { label: "People's Choice", cls: 'badge-top5' },
  'Under Discussion': { label: 'Under Discussion', cls: 'badge-discussion' },
  Passed: { label: 'Passed', cls: 'badge-passed' },
  Rejected: { label: 'Rejected', cls: 'badge-rejected' },
  'Needs Revision': { label: 'Needs Revision', cls: 'badge-revision' },
  Archived: { label: 'Archived', cls: 'badge-active' },
};

export default function ProposalCard({ proposal }) {
  const status = STATUS_MAP[proposal.status] || STATUS_MAP.Active;
  const catColor = CATEGORY_COLORS[proposal.category] || CATEGORY_COLORS.Other;
  const dateStr = new Date(proposal.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <article className="card-hover group flex flex-col h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <span className={`badge ${catColor} text-[10px]`}>{proposal.category}</span>
          <span className={`${status.cls} text-[10px]`}>{status.label}</span>
        </div>
        {proposal.constitutionalScore && (
          <span className="text-[10px] font-sans font-semibold text-sienna-600 whitespace-nowrap">
            Const. Score: {proposal.constitutionalScore}
          </span>
        )}
      </div>

      <Link to={`/proposals/${proposal._id}`}>
        <h3 className="font-serif font-semibold text-navy-800 text-lg leading-snug mb-2 group-hover:text-navy-600 transition-colors line-clamp-2">
          {proposal.title}
        </h3>
      </Link>

      <p className="text-sm font-sans text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-1">
        {proposal.description.slice(0, 200)}...
      </p>

      <div className="border-t border-gray-100 pt-3 mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {dateStr}
          </span>
          {proposal.author && (
            <span className="flex items-center gap-1 truncate max-w-[100px]">
              {proposal.author.aadhaarVerified && <CheckCircle className="w-3 h-3 text-sienna-400 flex-shrink-0" />}
              <span className="truncate">{proposal.author.name}</span>
            </span>
          )}
        </div>
        <VoteButton proposal={proposal} />
      </div>
    </article>
  );
}
