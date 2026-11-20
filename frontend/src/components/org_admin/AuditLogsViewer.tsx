import React, { useEffect, useState } from 'react';
import { History, RefreshCw, Shield, User, FileText, Lock } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

export const AuditLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAuditLogs(60);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    if (action.includes('STATUS')) return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (action.includes('LOGIN')) return 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
              Security Governance
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Immutable System Audit Logs
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            System Activity & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full compliance audit log recording user logins, status transitions, internal notes, and ticket lifecycle events.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchLogs}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
        >
          Refresh Audit Trail
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs">Loading audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No audit log entries recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Actor Email</th>
                  <th className="py-3 px-4">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-mono text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                      {log.entity_type} {log.entity_id && `#${log.entity_id}`}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                      {log.user_email || 'system'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md truncate">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
