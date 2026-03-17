import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Eye, EyeOff, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', aadhaarVerified: false });
  const [otp, setOtp] = useState('');
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    
    setLoading(true);
    try {
      const res = await register(form.name, form.email, form.password, form.aadhaarVerified, form.phone);
      toast.success(res.message || 'OTP sent to your email');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) { toast.error('Please enter a valid 6-digit code'); return; }

    setLoading(true);
    try {
      await verifyOtp(form.email, otp);
      toast.success('Email verified! Welcome to Jan-Mat.');
      navigate('/proposals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    try {
      const res = await resendOtp(form.email);
      toast.success(res.message || 'A new OTP has been sent.');
      setOtp('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const mockAadhaar = () => {
    setForm(f => ({ ...f, aadhaarVerified: true }));
    toast.success('Aadhaar verification simulated! Your account will be marked as Verified.');
  };

  if (step === 2) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white p-8 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-sienna-500"></div>
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center text-navy-800 border-[6px] border-white shadow-sm">
              <Mail className="w-6 h-6" />
            </div>
          </div>
          
          <h1 className="font-serif font-bold text-navy-800 text-2xl text-center mb-2">Check your inbox</h1>
          <p className="font-sans text-gray-500 text-sm text-center mb-8 px-4">
            We've sent a 6-digit verification code to <strong className="text-navy-700">{form.email}</strong>. Entering it helps us prevent spam.
          </p>

          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div>
              <input 
                type="text" 
                className="w-full text-center text-3xl tracking-[0.5em] font-mono p-4 border border-gray-300 focus:border-navy-500 focus:ring-1 focus:ring-navy-500 outline-none transition-colors"
                placeholder="000000" 
                maxLength={6}
                value={otp} 
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                required 
                autoFocus
              />
            </div>
            
            <button type="submit" disabled={loading || otp.length < 6}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
              {loading ? 'Verifying...' : 'Verify Email & Login'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-sans flex flex-col gap-4 border-t border-gray-100 pt-6">
            <p className="text-gray-500">
              Didn't receive the code?
            </p>
            <button 
              onClick={handleResendOtp} 
              disabled={resending}
              className="flex items-center justify-center gap-2 text-sienna-600 font-semibold hover:text-sienna-700 transition-colors mx-auto w-fit"
            >
              <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
            <button 
              onClick={() => setStep(1)} 
              className="text-gray-400 hover:text-navy-600 text-xs mt-2 underline underline-offset-4 decoration-gray-300"
            >
              Change email address
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="section-label">Join the Platform</p>
          <h1 className="font-serif font-bold text-navy-800 text-3xl mb-2">Create your Jan-Mat account</h1>
          <p className="font-sans text-gray-500 text-sm">
            Already registered?{' '}
            <Link to="/login" className="text-sienna-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input-field" placeholder="Priya Sharma"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input-field" placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Mobile Number <span className="text-gray-400 font-normal ml-1">(Optional - for SMS updates)</span></label>
            <input type="tel" className="input-field" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
                placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-navy-700">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Aadhaar Verify */}
          <div className={`border p-4 transition-all ${form.aadhaarVerified ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${form.aadhaarVerified ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <p className="text-sm font-sans font-semibold text-navy-800">Aadhaar / DigiLocker Verify</p>
                  <p className="text-xs text-gray-500">Get a verified badge — boosts your proposal's visibility</p>
                </div>
              </div>
              {form.aadhaarVerified ? (
                <span className="text-xs font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-1">✓ Verified</span>
              ) : (
                <button type="button" onClick={mockAadhaar}
                  className="text-xs font-sans font-semibold text-sienna-600 border border-sienna-300 px-3 py-1.5 hover:bg-sienna-500 hover:text-white hover:border-sienna-500 transition-colors whitespace-nowrap">
                  Verify →
                </button>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
            {loading ? 'Sending Code...' : 'Continue to Email Verification'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
          By registering, you agree to engage constructively within the bounds of the Indian Constitution.
        </p>
      </div>
    </div>
  );
}
