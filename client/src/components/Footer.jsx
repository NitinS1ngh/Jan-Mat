import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-800 text-navy-300 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-b border-navy-700 pb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-sienna-500 flex items-center justify-center">
                <span className="font-serif font-bold text-white text-xs">जन</span>
              </div>
              <span className="font-serif font-bold text-white text-lg">Jan-Mat</span>
            </div>
            <p className="text-sm leading-relaxed text-navy-400">
              A citizen-powered legislative platform. Propose, debate, and democratically advance laws within India's constitutional framework.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-3">Platform</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/proposals', label: 'Browse Proposals' },
                { to: '/proposals/new', label: 'Submit a Proposal' },
                { to: '/peoples-choice', label: "People's Choice Top 5" },
              ].map(l => (
                <li key={l.to}><Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-sans font-semibold uppercase tracking-widest text-navy-400 mb-3">Legal</h4>
            <p className="text-sm text-navy-400 leading-relaxed">
              All proposals are analysed for compliance with the Indian Constitution's Basic Structure Doctrine before parliamentary consideration.
            </p>
            <p className="text-xs text-navy-500 mt-3">
              Governed under the Constitution of India, 1950.
            </p>
          </div>
        </div>
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-navy-500">
          <p>© 2026 Jan-Mat Platform. Built for the citizens of India.</p>
          <p className="font-sans tracking-wide">लोकतंत्र की आवाज़ — Voice of Democracy</p>
        </div>
      </div>
    </footer>
  );
}
