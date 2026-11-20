import React, { useEffect, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Eye,
  Shield,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DomainAdminMetrics, Ticket } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { TicketActionModal } from './TicketActionModal';
import { TicketDetailModal } from '../employee/TicketDetailModal';

export const DepartmentDashboard: React.FC<{ onViewQueue: () => void }> = ({ onViewQueue }) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DomainAdminMetrics | null>(null);
  const [urgentTickets, setUrgentTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [actionType, setActionType] = useState<'start' | 'complete' | 'reopen' | 'note' | null>(null);
  const [detailTicketId, setDetailTicketId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [m, t] = await Promise.all([
        api.getDomainMetrics(),
        api.getDomainTickets({ priority: 'Urgent', page_size: 5 })
      ]);
      setMetrics(m);
      setUrgentTickets(t.items);
    } catch (err) {
      console.error('Failed to load domain dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-950 border border-slate-800 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Department Queue Administrator
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Authorized Domain: {user?.department}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {user?.department} Operations Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Backend-enforced access boundary: You can only view and process tickets routed to {user?.department}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-slate-200 border-slate-700 hover:bg-slate-800"
          >
            Refresh Data
          </Button>
          <Button
            size="sm"
            onClick={onViewQueue}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Open Ticket Queue
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Department</span>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {isLoading ? '...' : metrics?.total_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">All tickets assigned</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Pending</span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {isLoading ? '...' : metrics?.pending_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Needs acceptance</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
          <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">In Progress</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {isLoading ? '...' : metrics?.in_progress_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Under active work</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
          <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {isLoading ? '...' : metrics?.completed_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Successfully resolved</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between border-l-4 border-l-rose-500">
          <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">Urgent Tickets</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {isLoading ? '...' : metrics?.urgent_tickets ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">High priority SLA</span>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-slate-400">Avg Resolution</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {isLoading ? '...' : `${metrics?.avg_resolution_time_hours ?? 0}h`}
          </p>
          <span className="text-[10px] text-slate-400">Turnaround time</span>
        </Card>
      </div>

      {/* Urgent Attention Queue */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              High Priority & Urgent Queue
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tickets requiring rapid turnaround in {user?.department}
            </p>
          </div>
          <button
            onClick={onViewQueue}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">Loading queue...</div>
        ) : urgentTickets.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No urgent or pending critical tickets in {user?.department}. All clear!
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {urgentTickets.map(t => (
              <div
                key={t.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                      {t.ticket_code}
                    </span>
                    <Badge variant="priority" priority={t.priority} />
                    <Badge variant="status" status={t.status} />
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1">
                    {t.subject}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Requested by <strong>{t.employee_name}</strong> • {new Date(t.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {t.status === 'Pending' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(t);
                        setActionType('start');
                      }}
                      leftIcon={<Play className="w-3 h-3" />}
                    >
                      Start
                    </Button>
                  )}
                  {t.status === 'In Progress' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedTicket(t);
                        setActionType('complete');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500"
                      leftIcon={<CheckCircle2 className="w-3 h-3" />}
                    >
                      Complete
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailTicketId(t.id)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Modal */}
      <TicketActionModal
        isOpen={selectedTicket !== null && actionType !== null}
        onClose={() => {
          setSelectedTicket(null);
          setActionType(null);
        }}
        ticket={selectedTicket}
        actionType={actionType}
        onSuccess={fetchDashboardData}
      />

      {/* Detail Modal */}
      <TicketDetailModal
        ticketId={detailTicketId}
        isOpen={detailTicketId !== null}
        onClose={() => setDetailTicketId(null)}
        isAdmin={true}
      />
    </div>
  );
};
