import React from 'react';
import {
  LayoutDashboard,
  Bot,
  Ticket,
  UserCheck,
  Shield,
  History,
  BrainCircuit,
  Sliders,
  Folders
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user } = useAuth();
  if (!user) return null;

  let navItems: { id: string; label: string; icon: React.ReactNode }[] = [];

  if (user.role === 'employee') {
    navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'chat', label: 'AI Support', icon: <Bot className="w-5 h-5" /> },
      { id: 'tickets', label: 'My Tickets', icon: <Ticket className="w-5 h-5" /> },
      { id: 'profile', label: 'Settings', icon: <Sliders className="w-5 h-5" /> },
    ];
  } else if (user.role === 'domain_admin') {
    navItems = [
      { id: 'dashboard', label: 'Department Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'queue', label: 'Ticket Queues', icon: <Folders className="w-5 h-5" /> },
      { id: 'profile', label: 'Domain Settings', icon: <Sliders className="w-5 h-5" /> },
    ];
  } else if (user.role === 'org_admin') {
    navItems = [
      { id: 'dashboard', label: 'Executive Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
      { id: 'all_tickets', label: 'Organization Queues', icon: <Folders className="w-5 h-5" /> },
      { id: 'audit_logs', label: 'Audit Trail', icon: <History className="w-5 h-5" /> },
      { id: 'ml_metrics', label: 'ML Model Analytics', icon: <BrainCircuit className="w-5 h-5" /> },
    ];
  }

  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 min-h-[calc(100vh-4rem)]">
      {/* Department Context Indicator */}
      <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
          Current Context
        </p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
          {user.role === 'org_admin' ? 'Global Organization' : user.department || 'General Enterprise'}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
          {user.role.replace('_', ' ')}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 dark:bg-blue-600'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
