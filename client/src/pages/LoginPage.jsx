import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/proposals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <p className="section-label">Access Jan-Mat</p>
          <h1 className="font-serif font-bold text-navy-800 text-3xl mb-2">Sign in to your account</h1>
          <p className="font-sans text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-sienna-600 font-semibold hover:underline">Register here</Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-navy-50 border border-navy-200 p-3 mb-6 text-xs font-sans text-navy-700">
          <strong className="font-semibold">Demo credentials:</strong>
          <span className="ml-2 text-navy-600">Citizen: priya@example.com / Citizen@123</span>
          <span className="mx-2">|</span>
          <span className="text-navy-600">Admin: admin@janmat.gov.in / Admin@123</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-700">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Aadhaar Mock */}
        <div className="mt-6 border-t border-gray-200 pt-6">
          <button className="w-full flex items-center justify-center gap-2.5 border border-gray-300 py-2.5 text-sm font-sans font-medium text-navy-700 hover:border-navy-400 hover:bg-navy-50 transition-colors">
            <CheckCircle className="w-4 h-4 text-sienna-500" />
            Sign in with Aadhaar / DigiLocker (Mock)
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">Aadhaar integration would use UIDAI API in production</p>
        </div>
      </div>
    </div>
  );
}
