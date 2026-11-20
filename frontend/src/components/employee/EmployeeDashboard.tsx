import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Bot,
  Ticket as TicketIcon,
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Ticket } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TicketDetailModal } from './TicketDetailModal';

interface EmployeeDashboardProps {
  onStartChat: () => void;
  onViewAllTickets: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  onStartChat,
  onViewAllTickets,
}) => {
  const { user } = useAuth();
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, in_progress: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const res = await api.getMyTickets({ page: 1, page_size: 5 });
        setRecentTickets(res.items);
        
        // Count statuses
        const allRes = await api.getMyTickets({ page: 1, page_size: 100 });
        const p = allRes.items.filter(t => t.status === 'Pending').length;
        const inp = allRes.items.filter(t => t.status === 'In Progress').length;
        const comp = allRes.items.filter(t => t.status === 'Completed').length;
        setCounts({
          total: allRes.total,
          pending: p,
          in_progress: inp,
          completed: comp,
        });
      } catch (err) {
        console.error('Error loading employee dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-sm mb-4 border border-blue-400/30">
            <Sparkles className="w-3.5 h-3.5" />
            WarpDrive Intelligent Service Desk
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Need hardware fixes, software bug reports, salary slip audits, leave applications, or office maintenance? Our AI assistant analyzes and routes requests instantly.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={onStartChat}
              className="bg-white text-blue-800 hover:bg-blue-50 shadow-md font-semibold"
              leftIcon={<Bot className="w-4 h-4 text-blue-600" />}
            >
              Ask AI Assistant
            </Button>
            <Button
              onClick={onViewAllTickets}
              variant="outline"
              className="border-blue-300/40 text-white hover:bg-blue-600/30 font-semibold"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View My Tickets ({counts.total})
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Requests</span>
            <TicketIcon className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {isLoading ? '...' : counts.total}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Submitted requests</span>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {isLoading ? '...' : counts.pending}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Awaiting technician</span>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">In Progress</span>
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 mt-2">
            {isLoading ? '...' : counts.in_progress}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Being actively handled</span>
        </Card>

        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {isLoading ? '...' : counts.completed}
          </p>
          <span className="text-[11px] text-slate-400 mt-1">Resolved requests</span>
        </Card>
      </div>

      {/* Recent Requests Section */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Your latest submitted service desk tickets
            </p>
          </div>
          <button
            onClick={onViewAllTickets}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">Loading activity...</div>
        ) : recentTickets.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No service requests yet. Start a chat with the assistant above!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {recentTickets.map(t => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {t.ticket_code}
                    </span>
                    <Badge variant="department">{t.department}</Badge>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-1">
                    {t.subject}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant="status" status={t.status} />
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {new Date(t.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Ticket Details Modal */}
      <TicketDetailModal
        ticketId={selectedTicketId}
        isOpen={selectedTicketId !== null}
        onClose={() => setSelectedTicketId(null)}
        isAdmin={false}
      />
    </div>
  );
};
