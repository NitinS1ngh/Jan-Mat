import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, FileText, Gavel, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';


const HOW_IT_WORKS = [
  { icon: FileText, num: '01', title: 'Draft Your Proposal', desc: 'Write a detailed law proposal using our structured template. Any verified Indian citizen can participate.' },
  { icon: Users, num: '02', title: 'Community Votes', desc: 'Citizens upvote, downvote, and debate. The most supported ideas gain traction through collective voice.' },
  { icon: CheckCircle, num: '03', title: 'AI Constitutional Check', desc: 'Our AI engine — guided by the Indian Constitution — filters for legal viability and surfaces the top 5.' },
  { icon: Gavel, num: '04', title: 'Parliamentary Review', desc: 'The monthly Top 5 report is forwarded to Parliamentary observers for potential legislative action.' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: 'Proposals Submitted', value: '...' },
    { label: 'Active Voters', value: '...' },
    { label: 'Laws Passed', value: '7' },
    { label: 'Categories', value: '10' },
  ]);

  useEffect(() => {
    api.get('/proposals/stats')
      .then(res => {
        setStats([
          { label: 'Proposals Submitted', value: res.data.proposalsCount.toLocaleString('en-IN') + '+' },
          { label: 'Active Voters', value: res.data.usersCount.toLocaleString('en-IN') },
          { label: 'Laws Passed', value: '7' },
          { label: 'Categories', value: '10' },
        ]);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-grain opacity-50" />
        <div className="page-container py-20 md:py-28 relative">
          <div className="max-w-3xl">
            <p className="section-label text-sienna-400 mb-4">Jan-Mat · People's Voice</p>
            <h1 className="font-serif font-bold text-white text-4xl sm:text-5xl md:text-6xl leading-tight mb-6">
              Laws by the People,<br />
              <span className="text-sienna-400">for the People.</span>
            </h1>
            <p className="font-sans text-navy-200 text-lg leading-relaxed mb-8 max-w-2xl">
              India's first citizen-powered legislative platform. Submit law proposals, vote on ideas that matter, and watch the best — constitutionally vetted — ones reach Parliament.
            </p>
            <div className="flex flex-wrap gap-3">
              {user ? (
                <Link to="/proposals/new" className="btn-sienna flex items-center gap-2 px-6 py-3 text-base">
                  Submit a Proposal <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link to="/register" className="btn-sienna flex items-center gap-2 px-6 py-3 text-base">
                  Join Jan-Mat <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link to="/proposals" className="btn-secondary flex items-center gap-2 px-6 py-3 text-base border-navy-400 text-navy-200 hover:bg-navy-700 hover:text-white">
                Browse Proposals
              </Link>
            </div>

            {/* Mock Aadhaar / DigiLocker CTA */}
            <div className="mt-8 inline-flex items-center gap-3 border border-navy-600 bg-navy-700 px-4 py-3">
              <div className="w-6 h-6 bg-sienna-500 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-sans font-semibold text-white">Verify with Aadhaar / DigiLocker</p>
                <p className="text-[11px] font-sans text-navy-400">Verified citizens get a ✓ badge and enhanced proposal visibility</p>
              </div>
              <button className="ml-2 text-[11px] font-sans font-semibold text-sienna-400 border border-sienna-500 px-3 py-1.5 hover:bg-sienna-500 hover:text-white transition-colors whitespace-nowrap">
                Verify Now →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-gray-200">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className={`px-6 py-5 ${i > 0 ? 'border-l border-gray-200' : ''}`}>
                <p className="font-serif font-bold text-navy-800 text-2xl">{stat.value}</p>
                <p className="text-xs font-sans text-gray-500 mt-0.5 uppercase tracking-wide">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="page-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left: Heading */}
            <div className="md:sticky md:top-24">
              <p className="section-label">How It Works</p>
              <h2 className="font-serif font-bold text-navy-800 text-4xl leading-snug mb-4">
                Democracy,<br />reimagined.
              </h2>
              <p className="font-sans text-gray-600 leading-relaxed mb-6">
                Jan-Mat combines the wisdom of crowds with constitutional rigour. Your proposals are taken seriously — not just as data points, but as genuine legislative intent.
              </p>
              <Link to="/peoples-choice" className="btn-primary flex items-center gap-2 w-fit">
                See Current Top 5 <Star className="w-4 h-4" />
              </Link>
            </div>

            {/* Right: Steps */}
            <div className="space-y-0">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={i} className="flex gap-5 pb-8 border-b border-gray-100 last:border-0 last:pb-0 group">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-navy-50 border border-navy-200 flex items-center justify-center group-hover:bg-navy-800 transition-colors duration-200">
                      <step.icon className="w-5 h-5 text-navy-600 group-hover:text-white transition-colors duration-200" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-sans font-bold text-sienna-500 tracking-widest uppercase">{step.num}</span>
                      <h3 className="font-serif font-semibold text-navy-800 text-lg">{step.title}</h3>
                    </div>
                    <p className="font-sans text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-sienna-500">
        <div className="page-container py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-white text-2xl md:text-3xl">Have an idea for India?</h2>
            <p className="font-sans text-sienna-100 text-sm mt-1">It takes 5 minutes to submit a proposal that could become law.</p>
          </div>
          <Link to="/proposals/new" className="flex-shrink-0 bg-white text-sienna-600 px-6 py-3 text-sm font-sans font-semibold border border-white hover:bg-sienna-50 transition-colors flex items-center gap-2">
            Draft a Proposal <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
