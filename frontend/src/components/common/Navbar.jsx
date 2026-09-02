import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-[rgba(11,19,43,0.95)] backdrop-blur-xl border-b-2 border-[rgba(255,0,127,0.15)] px-4 md:px-8 sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between h-[70px] gap-4 md:gap-8">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 md:gap-3 text-white transition-all hover:scale-105">
          <span className="text-2xl font-black text-[#00e5ff] [text-shadow:0_0_20px_rgba(0,229,255,0.3)]">⟨⟩</span>
          <span className="text-lg md:text-xl font-black tracking-[0.15em]">EVENT HORIZON</span>
          <span className="hidden md:block text-[0.55rem] font-bold tracking-[0.1em] text-[#00e5ff] bg-[rgba(0,229,255,0.1)] border border-[rgba(0,229,255,0.2)] px-2 py-0.5 rounded-full uppercase">
            SECURE
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className={`md:hidden flex flex-col gap-1 p-2 rounded-lg transition-all hover:bg-[rgba(0,229,255,0.05)] ${
            mobileMenuOpen ? 'active' : ''
          }`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className={`w-7 h-0.5 bg-[#00e5ff] rounded transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <span className={`w-7 h-0.5 bg-[#00e5ff] rounded transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-7 h-0.5 bg-[#00e5ff] rounded transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>

        {/* Navigation Menu */}
        <div
          className={`${
            mobileMenuOpen
              ? 'absolute top-[70px] left-0 right-0 flex flex-col bg-[rgba(11,19,43,0.98)] backdrop-blur-xl border-b border-[rgba(255,0,127,0.1)] p-4 gap-1 shadow-[0_20px_40px_rgba(0,0,0,0.3)]'
              : 'hidden md:flex items-center gap-1 flex-1 justify-center'
          }`}
        >
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(0,229,255,0.05)] rounded-lg transition-all text-sm md:text-[0.85rem] font-medium tracking-wide"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span></span> Dashboard
          </Link>
          <Link
            to="/threats"
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(0,229,255,0.05)] rounded-lg transition-all text-sm md:text-[0.85rem] font-medium tracking-wide"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span></span> Threats
          </Link>
          <Link
            to="/analytics"
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(0,229,255,0.05)] rounded-lg transition-all text-sm md:text-[0.85rem] font-medium tracking-wide"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span></span> Analytics
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 text-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(0,229,255,0.05)] rounded-lg transition-all text-sm md:text-[0.85rem] font-medium tracking-wide"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span></span> Settings
          </Link>
        </div>

        {/* User Section */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-3 px-2 py-1 md:px-3 md:py-1.5 rounded-full bg-[rgba(0,229,255,0.03)] border border-[rgba(0,229,255,0.05)] hover:bg-[rgba(0,229,255,0.06)] hover:border-[rgba(0,229,255,0.1)] transition-all">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center bg-gradient-to-r from-[#00e5ff] to-[#ff007f] text-white font-bold text-sm shadow-[0_0_20px_rgba(255,0,127,0.15)] overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="hidden md:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-white">{user?.username || 'User'}</span>
              <span className="text-[0.55rem] font-medium text-[rgba(0,229,255,0.4)] uppercase tracking-wider">{user?.role || 'Analyst'}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-[rgba(255,0,127,0.1)] border border-[rgba(255,0,127,0.2)] rounded-full text-[#ff007f] text-[0.65rem] md:text-[0.7rem] font-semibold uppercase tracking-wider font-mono transition-all hover:bg-[rgba(255,0,127,0.2)] hover:shadow-[0_0_30px_rgba(255,0,127,0.15)] hover:-translate-y-0.5 active:scale-95"
          >
            <span className="text-base md:text-lg">⏻</span>
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;