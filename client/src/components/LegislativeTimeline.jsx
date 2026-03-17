import { CheckCircle, Circle, Clock } from 'lucide-react';

const STAGES = [
  { key: 'Drafted', label: 'Drafted', desc: 'Citizen submits the proposal' },
  { key: 'Community Voting', label: 'Community Voting', desc: 'Public votes & debates' },
  { key: 'AI Constitutional Check', label: 'AI Constitutional Check', desc: 'Verified against Indian Constitution' },
  { key: 'Sent to Parliament', label: 'Sent to Parliament', desc: 'Forwarded for legislative review' },
];

export default function LegislativeTimeline({ currentStage }) {
  const currentIdx = STAGES.findIndex(s => s.key === currentStage);

  return (
    <div className="py-4">
      <p className="section-label mb-4">Legislative Journey</p>
      <div className="space-y-0">
        {STAGES.map((stage, i) => {
          const isDone = i < currentIdx;
          const isCurrent = i === currentIdx;
          const isPending = i > currentIdx;
          return (
            <div key={stage.key} className={`timeline-step flex gap-4 pb-6 ${isDone ? 'completed' : ''}`}>
              {/* Icon */}
              <div className="flex-shrink-0 w-10 flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone ? 'bg-navy-800 border-navy-800' :
                  isCurrent ? 'bg-sienna-500 border-sienna-500' :
                  'bg-white border-gray-200'
                }`}>
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-white" />
                  ) : isCurrent ? (
                    <Clock className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
              </div>

              {/* Text */}
              <div className="pt-1.5">
                <p className={`font-sans font-semibold text-sm ${
                  isDone ? 'text-navy-800' :
                  isCurrent ? 'text-sienna-600' :
                  'text-gray-400'
                }`}>
                  {stage.label}
                  {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-wider bg-sienna-100 text-sienna-600 px-1.5 py-0.5 font-bold">Current</span>}
                </p>
                <p className={`text-xs mt-0.5 font-sans ${isPending ? 'text-gray-300' : 'text-gray-500'}`}>
                  {stage.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
