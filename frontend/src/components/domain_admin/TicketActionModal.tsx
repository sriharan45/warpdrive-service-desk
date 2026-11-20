import React, { useState } from 'react';
import { CheckCircle2, RotateCcw, Play, FileText } from 'lucide-react';
import { Ticket } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface TicketActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  actionType: 'start' | 'complete' | 'reopen' | 'note' | null;
  onSuccess: () => void;
}

export const TicketActionModal: React.FC<TicketActionModalProps> = ({
  isOpen,
  onClose,
  ticket,
  actionType,
  onSuccess,
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  if (!isOpen || !ticket || !actionType) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (actionType === 'start') {
        await api.updateTicketStatus(ticket.id, 'In Progress', undefined, 'Domain admin accepted ticket into active handling');
        addToast(`Ticket ${ticket.ticket_code} moved to In Progress`, 'success');
      } else if (actionType === 'complete') {
        if (!resolutionNotes.trim()) {
          addToast('Please provide resolution notes before completing the ticket', 'warning');
          setIsLoading(false);
          return;
        }
        await api.updateTicketStatus(ticket.id, 'Completed', resolutionNotes.trim(), 'Ticket resolved and marked completed');
        addToast(`Ticket ${ticket.ticket_code} marked Completed`, 'success');
      } else if (actionType === 'reopen') {
        await api.updateTicketStatus(ticket.id, 'Reopened', undefined, resolutionNotes.trim() || 'Ticket reopened for further action');
        addToast(`Ticket ${ticket.ticket_code} reopened`, 'info');
      } else if (actionType === 'note') {
        if (!internalNote.trim()) {
          addToast('Note cannot be empty', 'warning');
          setIsLoading(false);
          return;
        }
        await api.addInternalNote(ticket.id, internalNote.trim());
        addToast('Internal note recorded', 'success');
      }

      setResolutionNotes('');
      setInternalNote('');
      onSuccess();
      onClose();
    } catch (err: any) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const titles = {
    start: 'Accept & Start Handling Ticket',
    complete: 'Mark Ticket Completed',
    reopen: 'Reopen Ticket',
    note: 'Add Internal Domain Note',
  };

  const subtitles = {
    start: `Move ${ticket.ticket_code} from Pending to In Progress.`,
    complete: `Record formal resolution notes and notify ${ticket.employee_name}.`,
    reopen: `Reopen ${ticket.ticket_code} if further investigation or customer follow-up is needed.`,
    note: `Internal notes are confidential and only visible to administrators.`,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titles[actionType]}
      subtitle={subtitles[actionType]}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {actionType === 'start' && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
            <p>
              You are assigning ticket <strong>{ticket.ticket_code}</strong> to yourself and updating its status to <strong>In Progress</strong>.
            </p>
          </div>
        )}

        {actionType === 'complete' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resolution Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="Describe the steps taken to resolve the issue..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {actionType === 'reopen' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Reopening (Optional)
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              placeholder="e.g. Issue recurred, additional testing required..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {actionType === 'note' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confidential Note <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
              placeholder="Add internal debugging notes, vendor ticket IDs, technician logs..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            isLoading={isLoading}
            variant={actionType === 'complete' ? 'primary' : 'primary'}
          >
            {actionType === 'start' && 'Accept Ticket'}
            {actionType === 'complete' && 'Save & Mark Complete'}
            {actionType === 'reopen' && 'Reopen Ticket'}
            {actionType === 'note' && 'Save Note'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
