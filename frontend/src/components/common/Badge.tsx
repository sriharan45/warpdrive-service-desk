import React from 'react';
import { TicketStatus, TicketPriority } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'priority' | 'department' | 'outline' | 'default';
  status?: TicketStatus | string;
  priority?: TicketPriority | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  status,
  priority,
  className = '',
}) => {
  // Status Variant
  if (variant === 'status' || status) {
    const s = status || children;
    let colorStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

    if (s === 'Pending') {
      colorStyle = 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50';
    } else if (s === 'In Progress') {
      colorStyle = 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50';
    } else if (s === 'Completed') {
      colorStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50';
    } else if (s === 'Reopened') {
      colorStyle = 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorStyle} ${className}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s === 'Pending' ? 'bg-amber-500 animate-pulse' : s === 'In Progress' ? 'bg-blue-500 animate-pulse' : s === 'Completed' ? 'bg-emerald-500' : 'bg-purple-500'}`} />
        {children || s}
      </span>
    );
  }

  // Priority Variant
  if (variant === 'priority' || priority) {
    const p = priority || children;
    let prioStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

    if (p === 'Urgent') {
      prioStyle = 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50';
    } else if (p === 'High') {
      prioStyle = 'bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50';
    } else if (p === 'Medium') {
      prioStyle = 'bg-sky-50 text-sky-700 border-sky-200/80 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50';
    } else if (p === 'Low') {
      prioStyle = 'bg-slate-50 text-slate-600 border-slate-200/80 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800/50';
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${prioStyle} ${className}`}>
        {children || p}
      </span>
    );
  }

  // Department Variant
  if (variant === 'department') {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 ${className}`}>
        {children}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`}>
      {children}
    </span>
  );
};
