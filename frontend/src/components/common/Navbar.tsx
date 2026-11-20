import React from 'react';
import { Sun, Moon, LogOut, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Badge } from './Badge';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadge = () => {
    if (!user) return null;
    if (user.role === 'org_admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800/50">
          <ShieldCheck className="w-3.5 h-3.5" />
          Organization Administrator
        </span>
      );
    }
    if (user.role === 'domain_admin') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50">
          <ShieldCheck className="w-3.5 h-3.5" />
          Domain Admin • {user.department}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50">
        Employee • {user.department || 'Staff'}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                WarpDrive
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                Service Desk
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
              WarpDrive Tech Works
            </p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          {/* Role Indicator */}
          <div className="hidden sm:block">
            {getRoleBadge()}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* User info & Logout */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white font-semibold text-xs shadow-sm">
                {user.full_name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 ml-1 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
