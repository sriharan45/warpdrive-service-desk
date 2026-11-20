import React from 'react';
import { User, Shield, Moon, Sun, KeyRound, Building, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const EmployeeSettings: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Account & Preferences
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          View your profile details and configure service desk preferences.
        </p>
      </div>

      {/* User Profile Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          User Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400">Full Name</label>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {user.full_name}
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-400">Official Email</label>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
              {user.email}
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-400">Authorized Role</label>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
              {user.role.replace('_', ' ')}
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-400">Department</label>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
              {user.department || 'Not Assigned'}
            </p>
          </div>
        </div>
      </Card>

      {/* Appearance Card */}
      <Card className="p-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Interface Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Switch between light and dark mode for comfortable viewing.
          </p>
        </div>
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="sm"
          leftIcon={theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </Card>

      {/* Governance & SLA Notice */}
      <Card className="p-6 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-500" />
          Enterprise Service Level Agreement (SLA)
        </h4>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          All service desk tickets are automatically routed using WarpDrive ML classifiers. Urgent tickets are acknowledged within 15 minutes by on-duty domain administrators.
        </p>
      </Card>
    </div>
  );
};
