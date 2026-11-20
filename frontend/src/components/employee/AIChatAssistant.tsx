import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { ConfirmationCardPayload, Ticket } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  confirmationCard?: ConfirmationCardPayload | null;
  createdTicket?: Ticket | null;
}

export const AIChatAssistant: React.FC<{ onViewTickets: () => void }> = ({ onViewTickets }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        "Hello! I am your WarpDrive AI Service Desk Assistant. I can help resolve questions or draft support requests for IT, Technical, HR, Accounts, and Facilities teams.\n\nHow can we assist you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const samplePrompts = [
    'My laptop is not connecting to Wi-Fi on the 3rd floor.',
    'I need help with an incorrect deduction in my salary slip.',
    'Application crashes with 500 error on the checkout page.',
    'The office AC is blowing warm air in the conference room.',
    'Need to apply for 5 days of earned leave next week.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsgId = Math.random().toString(36).substring(7);
    const userMessage: Message = { id: userMsgId, sender: 'user', content: text };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await api.sendChatMessage(text, conversationId);
      setConversationId(res.conversation_id);

      const assistantMessage: Message = {
        id: Math.random().toString(36).substring(7),
        sender: 'assistant',
        content: res.reply,
        confirmationCard: res.confirmation_card,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      addToast(err.message || 'Error communicating with assistant', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTicket = async (card: ConfirmationCardPayload, msgId: string) => {
    if (!conversationId) return;
    setIsSubmittingTicket(true);
    try {
      const created = await api.createTicketFromChat({
        ...card,
        conversation_id: conversationId,
      });

      addToast(`Ticket ${created.ticket_code} created successfully!`, 'success');

      // Update message to replace confirmation card with success card
      setMessages(prev =>
        prev.map(m =>
          m.id === msgId
            ? {
                ...m,
                confirmationCard: null,
                createdTicket: created,
              }
            : m
        )
      );
    } catch (err: any) {
      addToast(err.message || 'Failed to create ticket', 'error');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleResetChat = () => {
    setConversationId(undefined);
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'assistant',
        content:
          "Hello! Ready to assist you with another request. Describe your issue in plain language.",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              WarpDrive AI Support Assistant
              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Natural language diagnosis & automatic ML department classification
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleResetChat}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          New Conversation
        </Button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-[85%] sm:max-w-xl space-y-3`}>
              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm shadow-blue-500/20'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {/* Confirmation Card (Explicit Confirmation before submission) */}
              {msg.confirmationCard && (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border-2 border-blue-500/40 shadow-lg space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Ticket Preview & Confirmation
                      </span>
                    </div>
                    <Badge variant="status" status="Pending">Draft</Badge>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {msg.confirmationCard.subject}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                      {msg.confirmationCard.description}
                    </p>
                  </div>

                  {/* Attributes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Target Department
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                        {msg.confirmationCard.department}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        ML Confidence
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                        {msg.confirmationCard.confidence_percentage}% match
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Priority & Category
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="priority" priority={msg.confirmationCard.priority} />
                        <span className="text-[11px] text-slate-500 truncate">
                          {msg.confirmationCard.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      isLoading={isSubmittingTicket}
                      onClick={() => handleConfirmTicket(msg.confirmationCard!, msg.id)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Confirm & Create Ticket
                    </Button>
                  </div>
                </div>
              )}

              {/* Created Ticket Confirmation */}
              {msg.createdTicket && (
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="text-sm font-bold">
                      Ticket Successfully Submitted!
                    </span>
                  </div>
                  <p className="text-xs">
                    Your request has been routed to <strong>{msg.createdTicket.department}</strong>.
                    Unique Ticket Code: <code className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900 font-mono font-bold">{msg.createdTicket.ticket_code}</code>
                  </p>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onViewTickets}
                      className="border-emerald-600 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/50"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      View in My Tickets
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                You
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>Analyzing issue and predicting department routing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 overflow-x-auto flex gap-2 no-scrollbar">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-left text-xs px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap shrink-0 transition-colors"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your issue (e.g. My laptop is not connecting to Wi-Fi)..."
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          size="md"
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
