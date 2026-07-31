import React, { useState, useEffect } from 'react';
import { Menu, Clock, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ title, subtitle, onMenuClick }) => {
  const { user } = useAuth();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200/80 flex items-center px-4 gap-3 shadow-sm">
      {/* Hamburger — hidden on desktop */}
      <button
        onClick={onMenuClick}
        className="lg:hidden btn btn-ghost btn-icon flex-shrink-0"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-slate-800 truncate leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-slate-500 hidden sm:block truncate">{subtitle}</p>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Clock — visible only on sm+ */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <span className="font-mono font-semibold text-slate-800">{time}</span>
          <span className="text-slate-400 hidden lg:inline">• {dateStr}</span>
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
