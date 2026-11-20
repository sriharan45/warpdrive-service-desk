import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Folders
} from 'lucide-react';
import { api } from '../../services/api';
import { Ticket } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { TicketDetailModal } from '../employee/TicketDetailModal';

export const GlobalTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [detailTicketId, setDetailTicketId] = useState<number | null>(null);

  const fetchGlobalTickets = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrgTickets({
        department: selectedDept !== 'All' ? selectedDept : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        priority: selectedPriority !== 'All' ? selectedPriority : undefined,
        search: search.trim() || undefined,
        page,
        page_size: 10,
      });
      setTickets(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error('Failed to load global tickets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalTickets();
  }, [page, selectedDept, selectedStatus, selectedPriority]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchGlobalTickets();
  };

  const departments = ['All', 'IT Support', 'Technical', 'HR', 'Accounts', 'Maintenance'];
  const statuses = ['All', 'Pending', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6">
      {/* Title & Governance Alert */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
            Organization-Wide Queue
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Monitor & Governance Access
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          All Department Ticket Queues
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Global visibility into tickets across all divisions. Ticket status modification is restricted to domain administrators.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <Card className="p-4 space-y-4">
        {/* Department Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Department:
          </span>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => {
                setSelectedDept(dept);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDept === dept
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Secondary Filter Line */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <span className="text-xs text-slate-400 font-medium ml-2">Priority:</span>
            <select
              value={selectedPriority}
              onChange={e => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 lg:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket code, title, employee..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            <button
              onClick={fetchGlobalTickets}
              title="Refresh Queue"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Global Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs">Loading organization tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            icon={<Folders className="w-8 h-8 text-slate-400" />}
            title="No tickets match criteria"
            description="Try clearing search filters or selecting All departments."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Inspection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tickets.map(t => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {t.ticket_code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="department">{t.department}</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="font-semibold">{t.employee_name}</div>
                      <div className="text-[10px] text-slate-400">{t.employee_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="priority" priority={t.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="status" status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDetailTicketId(t.id)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {total > 10 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div>
              Showing {tickets.length} of {total} tickets
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Ticket Inspector Modal */}
      <TicketDetailModal
        ticketId={detailTicketId}
        isOpen={detailTicketId !== null}
        onClose={() => setDetailTicketId(null)}
        isAdmin={true}
      />
    </div>
  );
};
