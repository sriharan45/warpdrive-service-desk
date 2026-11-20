import React, { useEffect, useState } from 'react';
import {
  X,
  Clock,
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldAlert,
  Calendar,
  Sparkles
} from 'lucide-react';
import { TicketDetail } from '../../types';
import { api } from '../../services/api';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface TicketDetailModalProps {
  ticketId: number | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticketId,
  isOpen,
  onClose,
  isAdmin = false,
}) => {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ticketId && isOpen) {
      setIsLoading(true);
      setError(null);
      api.getTicketDetail(ticketId)
        .then(data => setTicket(data))
        .catch(err => setError(err.message || 'Failed to load ticket details'))
        .finally(() => setIsLoading(false));
    } else {
      setTicket(null);
    }
  }, [ticketId, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ticket ? `${ticket.ticket_code} — ${ticket.subject}` : 'Ticket Details'}
      subtitle={ticket ? `Created by ${ticket.employee_name} (${ticket.employee_email})` : ''}
      maxWidth="2xl"
    >
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs">Loading ticket data...</p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          {error}
        </div>
      ) : ticket ? (
        <div className="space-y-6">
          {/* Status & Department Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Current Status
                </span>
                <div className="mt-1">
                  <Badge variant="status" status={ticket.status} />
                </div>
              </div>

              <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Department
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5 block">
                  {ticket.department}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Priority
                </span>
                <div className="mt-1">
                  <Badge variant="priority" priority={ticket.priority} />
                </div>
              </div>

              <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Category
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 block">
                  {ticket.category}
                </span>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Issue Description
            </h4>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </div>
          </div>

          {/* ML Classification Details */}
          {ticket.ml_predicted_department && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  Automated ML routing predicted: <strong>{ticket.ml_predicted_department}</strong>
                </span>
              </div>
              {ticket.ml_confidence && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 font-bold text-[11px]">
                  {Math.round(ticket.ml_confidence * 100)}% confidence
                </span>
              )}
            </div>
          )}

          {/* Resolution Notes (If completed) */}
          {ticket.resolution_notes && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Resolution Summary</span>
              </div>
              <p className="mt-1 text-emerald-800 dark:text-emerald-300 leading-relaxed">
                {ticket.resolution_notes}
              </p>
            </div>
          )}

          {/* Internal Notes (Admin Only) */}
          {isAdmin && ticket.internal_notes && ticket.internal_notes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                Internal Domain Notes (Confidential)
              </h4>
              <div className="space-y-2">
                {ticket.internal_notes.map(note => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 dark:text-amber-400 mb-1">
                      <span>{note.author_name}</span>
                      <span>{new Date(note.created_at).toLocaleString()}</span>
                    </div>
                    <p className="leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status History Timeline */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Status Lifecycle History
            </h4>
            <div className="border-l-2 border-slate-200 dark:border-slate-700 ml-2 space-y-4 py-1">
              {ticket.status_history?.map(hist => (
                <div key={hist.id} className="relative pl-6">
                  <span className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {hist.old_status === 'None'
                        ? 'Ticket Created'
                        : `Status changed to ${hist.new_status}`}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(hist.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    by {hist.changed_by_name} {hist.notes && `— "${hist.notes}"`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );
};
