import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('janmat_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => { setToken(null); localStorage.removeItem('janmat_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: t, user: u } = res.data;
      localStorage.setItem('janmat_token', t);
      setToken(t);
      setUser(u);
      return u;
    } catch (err) {
      if (err.response?.data?.needsVerification) {
        throw { needsVerification: true, email: err.response.data.email };
      }
      throw err;
    }
  };

  const register = async (name, email, password, aadhaarVerified = false, phone = '') => {
    const res = await api.post('/auth/register', { name, email, password, aadhaarVerified, phone: phone || null });
    // Registration now sends an OTP email, it does not return a token.
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    const { token: t, user: u } = res.data;
    localStorage.setItem('janmat_token', t);
    setToken(t);
    setUser(u);
    return u;
  };

  const resendOtp = async (email) => {
    const res = await api.post('/auth/resend-otp', { email });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('janmat_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, verifyOtp, resendOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
