import { Shield, Star } from 'lucide-react';

export default function ConstitutionalBadge({ score, analysis }) {
  const color =
    score >= 80 ? 'text-green-700 bg-green-50 border-green-200' :
    score >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-red-700 bg-red-50 border-red-200';

  return (
    <div className={`border p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-sans font-bold uppercase tracking-widest">Constitutional Score</p>
        <span className="ml-auto text-2xl font-serif font-bold">{score}<span className="text-base font-sans font-normal">/100</span></span>
      </div>
      {analysis && (
        <p className="text-xs font-sans leading-relaxed opacity-90 mt-1">{analysis}</p>
      )}
    </div>
  );
}
