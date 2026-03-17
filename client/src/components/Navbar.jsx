import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { to: '/proposals', label: 'Proposals' },
    { to: '/peoples-choice', label: "People's Choice" },
    { to: '/laws', label: 'Laws Enacted' },
  ];

  return (
    <nav className="bg-navy-800 border-b border-navy-700 sticky top-0 z-50">
      <div className="page-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-sienna-500 flex items-center justify-center">
              <span className="font-serif font-bold text-white text-sm">जन</span>
            </div>
            <div>
              <span className="font-serif font-bold text-white text-lg leading-none">Jan-Mat</span>
              <span className="block text-navy-300 text-[10px] font-sans tracking-[0.15em] uppercase leading-none">People's Voice</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {user?.role !== 'admin' && navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-sans font-medium tracking-wide transition-colors duration-150 ${
                  location.pathname === link.to
                    ? 'text-sienna-400 border-b border-sienna-400 pb-0.5'
                    : 'text-navy-200 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-sans font-medium text-navy-200 hover:text-white transition-colors duration-150"
                >
                  <div className="w-7 h-7 rounded-full bg-sienna-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name[0].toUpperCase()}</span>
                  </div>
                  <span className="hidden lg:block max-w-[120px] truncate">{user.name}</span>
                  {user.aadhaarVerified && (
                    <span className="text-[9px] bg-sienna-500 text-white px-1.5 py-0.5 font-semibold tracking-wide">VERIFIED</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 shadow-elevated py-1 z-50">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-sans text-navy-700 hover:bg-navy-50 transition-colors"
                      >
                        <Shield className="w-4 h-4 text-sienna-500" />
                        Admin Dashboard
                      </Link>
                    )}
                    {user.role !== 'admin' && (
                      <Link
                        to="/proposals/new"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-sans text-navy-700 hover:bg-navy-50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-navy-400" />
                        New Proposal
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-sans text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-sans font-medium text-navy-200 hover:text-white transition-colors">Sign In</Link>
                <Link to="/register" className="btn-sienna text-xs py-2 px-4">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-navy-200 hover:text-white p-1">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-navy-700 py-3 pb-4">
            {user?.role !== 'admin' && navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block px-1 py-2.5 text-sm font-sans text-navy-200 hover:text-white">
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-1 py-2.5 text-sm font-sans text-sienna-400">Admin Dashboard</Link>
                )}
                {user.role !== 'admin' && (
                  <Link to="/proposals/new" onClick={() => setMenuOpen(false)} className="block px-1 py-2.5 text-sm font-sans text-navy-200">New Proposal</Link>
                )}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block mt-1 text-sm font-sans text-red-400 px-1 py-2">Sign Out</button>
              </>
            ) : (
              <div className="flex gap-3 mt-2 px-1">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-xs py-2">Sign In</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-sienna text-xs py-2">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
