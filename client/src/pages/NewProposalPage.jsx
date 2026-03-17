import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = ['Health', 'Technology', 'Education', 'Environment', 'Economy', 'Infrastructure', 'Social Justice', 'Agriculture', 'Defence', 'Other'];

export default function NewProposalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', category: '', description: '' });
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="page-container py-20 text-center">
        <p className="font-serif text-2xl text-navy-700 mb-3">Sign in to submit a proposal</p>
        <a href="/login" className="btn-primary">Sign In</a>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.description.length < 100) {
      toast.error('Description must be at least 100 characters for a meaningful proposal.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/proposals', form);
      toast.success('Proposal submitted! It will now go through community voting.');
      navigate(`/proposals/${res.data.proposal._id}`);
    } catch (err) {
      toast.error(err.response?.data?.errors?.[0]?.msg || 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-enter">
      <div className="bg-white border-b border-gray-200">
        <div className="page-container py-8">
          <p className="section-label">New Proposal</p>
          <h1 className="font-serif font-bold text-navy-800 text-3xl">Draft a Law Proposal</h1>
          <p className="font-sans text-gray-500 text-sm mt-1">Write clearly. Be specific. Constitutional proposals have a higher chance of reaching Parliament.</p>
        </div>
      </div>

      <div className="page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div>
              <label className="label">Proposal Title *</label>
              <input type="text" className="input-field" maxLength={200}
                placeholder="e.g., Universal Healthcare ID for Every Indian Citizen"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              <p className="text-xs text-gray-400 mt-1 font-sans">{form.title.length}/200 characters</p>
            </div>

            <div>
              <label className="label">Category *</label>
              <select className="input-field" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required>
                <option value="">Select a category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Full Description *</label>
              <textarea className="input-field resize-none" rows={12}
                placeholder="Describe your proposal in detail. Include: the problem it solves, how it should be implemented, which articles of the Constitution support it, and what the expected impact will be. Minimum 100 characters."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-400 font-sans">Minimum 100 characters for a meaningful proposal</p>
                <p className={`text-xs font-sans font-semibold ${form.description.length >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                  {form.description.length} chars
                </p>
              </div>
            </div>

            <div className="bg-navy-50 border border-navy-200 p-4 text-sm font-sans text-navy-700">
              <strong className="font-semibold">Constitutional Tip:</strong> Reference specific Articles (e.g., Article 21, Article 14) that support your proposal. This improves your AI Constitutional Score.
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary py-3 px-8 text-base flex items-center gap-2">
              {loading ? 'Submitting...' : 'Submit Proposal →'}
            </button>
          </form>

          {/* Tips Sidebar */}
          <aside className="space-y-4">
            <div className="card">
              <p className="section-label mb-3">Writing Tips</p>
              <ul className="space-y-3 text-sm font-sans text-gray-700">
                {[
                  'State the problem clearly in the first sentence',
                  'Include a feasibility plan (budget, timeline)',
                  'Mention which ministry or body would implement it',
                  'Reference relevant constitutional articles',
                  'Avoid vague language — use specific metrics where possible',
                  'Ensure your proposal is non-discriminatory and peaceful',
                ].map((tip, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-sienna-500 font-bold flex-shrink-0">{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card border-sienna-200 bg-sienna-50">
              <p className="text-xs font-sans font-bold text-sienna-700 uppercase tracking-widest mb-2">AI Constitutional Filter</p>
              <p className="text-sm font-sans text-sienna-800 leading-relaxed">
                All proposals are reviewed by our AI engine against the Basic Structure Doctrine. Proposals violating fundamental rights will be moved to Needs Revision.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
