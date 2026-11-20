import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Building,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  RefreshCw,
  ArrowRight,
  BrainCircuit,
  Eye
} from 'lucide-react';
import { api } from '../../services/api';
import { OrgAdminMetrics, DepartmentDistribution } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface GlobalDashboardProps {
  onViewAllTickets: () => void;
  onViewAuditLogs: () => void;
  onViewMLMetrics: () => void;
}

export const GlobalDashboard: React.FC<GlobalDashboardProps> = ({
  onViewAllTickets,
  onViewAuditLogs,
  onViewMLMetrics,
}) => {
  const [metrics, setMetrics] = useState<OrgAdminMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGlobalMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getOrgMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load org metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner with Supervisor Rule */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              Executive Organization Console
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
              Monitor / Supervisor Mode
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            WarpDrive Tech Works Global Service Operations
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global monitoring across IT Support, Technical, HR, Accounts, and Facilities. Status modification is restricted to domain administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchGlobalMetrics}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={onViewAllTickets}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            All Queues
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Org Tickets</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {isLoading ? '...' : metrics?.total_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Across 5 departments</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Pending</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {isLoading ? '...' : metrics?.pending_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Needs domain pickup</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">In Progress</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {isLoading ? '...' : metrics?.in_progress_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Active handling</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {isLoading ? '...' : metrics?.completed_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Resolved tickets</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-indigo-500">
          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">Resolution Rate</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {isLoading ? '...' : `${metrics?.resolution_rate_percentage ?? 0}%`}
          </p>
          <span className="text-[10px] text-slate-400">Overall efficiency</span>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Workload Distribution Chart */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Department Workload Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ticket volume across the 5 enterprise domains
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              5 Domains
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading distribution...</div>
          ) : (
            <div className="space-y-4 pt-2">
              {metrics?.department_distribution.map(d => {
                const totalTickets = metrics.total_tickets || 1;
                const pct = Math.round((d.total / totalTickets) * 100);

                return (
                  <div key={d.department} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {d.department}
                      </span>
                      <div className="flex items-center gap-2 text-slate-500">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          {d.total} tickets
                        </span>
                        <span>({pct}%)</span>
                      </div>
                    </div>

                    {/* Stacked Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                      <div
                        style={{ width: `${(d.completed / (d.total || 1)) * 100}%` }}
                        className="bg-emerald-500 h-full"
                        title={`Completed: ${d.completed}`}
                      />
                      <div
                        style={{ width: `${(d.in_progress / (d.total || 1)) * 100}%` }}
                        className="bg-blue-500 h-full"
                        title={`In Progress: ${d.in_progress}`}
                      />
                      <div
                        style={{ width: `${(d.pending / (d.total || 1)) * 100}%` }}
                        className="bg-amber-500 h-full"
                        title={`Pending: ${d.pending}`}
                      />
                    </div>

                    {/* Breakdown sub-labels */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {d.pending} Pending
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {d.in_progress} In Progress
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {d.completed} Completed
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* 7-Day Ticket Trend Activity */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                7-Day Activity & Throughput Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daily created vs completed ticket volume
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-blue-500" />
                Created
              </span>
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
                Completed
              </span>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading trend...</div>
          ) : (
            <div className="pt-6">
              {/* SVG Trend Bars */}
              <div className="grid grid-cols-7 gap-2 items-end h-48 border-b border-slate-200 dark:border-slate-800 pb-2">
                {metrics?.recent_trend.map(pt => {
                  const maxVal = Math.max(
                    ...metrics.recent_trend.map(t => Math.max(t.created, t.completed)),
                    5
                  );
                  const createdH = Math.max(8, Math.round((pt.created / maxVal) * 160));
                  const completedH = Math.max(8, Math.round((pt.completed / maxVal) * 160));

                  return (
                    <div key={pt.date} className="flex flex-col items-center gap-1">
                      <div className="flex items-end gap-1 w-full justify-center">
                        {/* Created bar */}
                        <div
                          style={{ height: `${createdH}px` }}
                          className="w-3 rounded-t bg-blue-500/80 hover:bg-blue-600 transition-all"
                          title={`Created: ${pt.created}`}
                        />
                        {/* Completed bar */}
                        <div
                          style={{ height: `${completedH}px` }}
                          className="w-3 rounded-t bg-emerald-500/80 hover:bg-emerald-600 transition-all"
                          title={`Completed: ${pt.completed}`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 font-medium truncate">
                        {pt.date}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Quick links */}
              <div className="mt-4 flex items-center justify-between text-xs pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewAuditLogs}
                  leftIcon={<Clock className="w-3.5 h-3.5" />}
                >
                  View Audit Logs
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onViewMLMetrics}
                  leftIcon={<BrainCircuit className="w-3.5 h-3.5" />}
                >
                  View ML Metrics
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
