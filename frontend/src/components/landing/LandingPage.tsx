import React, { useState } from 'react';
import {
  Zap,
  Bot,
  ShieldCheck,
  BrainCircuit,
  Lock,
  ArrowRight,
  Sparkles,
  Server,
  Users,
  Building,
  CheckCircle2,
  Cpu,
  LogIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export const LandingPage: React.FC = () => {
  const { login, quickLogin, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                WarpDrive
              </span>
              <span className="text-xs text-slate-400 font-medium ml-2">
                Tech Works
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ML Model Online • 97.5% Accuracy
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoginModalOpen(true)}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="text-slate-200 border-slate-700 hover:bg-slate-800"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 text-blue-400 border border-blue-800/60 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Enterprise IT, HR, Technical, Accounts & Facilities Orchestration
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Intelligent Service Desk <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Built for Modern Enterprise
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            WarpDrive Tech Works unified service desk with natural language AI assistance, verified Scikit-learn department routing, and strict role-based authorization across domain silos.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-left">
            <div>
              <p className="text-2xl font-black text-white">97.5%</p>
              <p className="text-xs text-slate-400 font-medium">Verified Classifier Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-black text-blue-400">5</p>
              <p className="text-xs text-slate-400 font-medium">Isolated Domain Queues</p>
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-400">&lt; 50ms</p>
              <p className="text-xs text-slate-400 font-medium">Inference Routing Latency</p>
            </div>
            <div>
              <p className="text-2xl font-black text-indigo-400">100%</p>
              <p className="text-xs text-slate-400 font-medium">Audit Trail Governance</p>
            </div>
          </div>
        </div>

        {/* 3 Core Roles - Instant One-Click Access Cards */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              One-Click Enterprise Role Access
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select a role below to instantly explore the dashboard with pre-seeded demo accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Role 1: Employee */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-900/60 text-blue-300 border border-blue-800 mb-2">
                  Employee Role
                </div>
                <h3 className="text-xl font-bold text-white">
                  Employee Portal
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Submit requests via conversational AI assistant, receive real-time ML category predictions, review ticket confirmation cards, and track personal ticket status.
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>AI Chat: "How can we assist you today?"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Strict isolation: view own requests only</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-col gap-2">
                <Button
                  onClick={() => quickLogin('employee')}
                  isLoading={isLoading}
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Launch as Sarah (Employee)
                </Button>
                <button
                  onClick={() => quickLogin('john')}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors py-1"
                >
                  Or launch as John Doe (Operations)
                </button>
              </div>
            </div>

            {/* Role 2: Domain Administrator */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Server className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-800 mb-2">
                  Domain Admin
                </div>
                <h3 className="text-xl font-bold text-white">
                  Domain Administrator
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Authorized to manage a single department's queue. Accepts tickets (Pending → In Progress), adds internal notes, marks complete with resolution notes, or reopens tickets.
                </p>

                <p className="text-[11px] font-semibold text-indigo-300 mt-3 mb-2">
                  Select Department Queue:
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => quickLogin('admin_it')}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-indigo-950/80 border border-slate-700 hover:border-indigo-500/60 text-[11px] text-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span>IT Support</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => quickLogin('admin_tech')}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-indigo-950/80 border border-slate-700 hover:border-indigo-500/60 text-[11px] text-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span>Technical</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => quickLogin('admin_hr')}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-indigo-950/80 border border-slate-700 hover:border-indigo-500/60 text-[11px] text-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span>HR</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </button>
                  <button
                    onClick={() => quickLogin('admin_accounts')}
                    className="text-left px-2.5 py-1.5 rounded-lg bg-slate-900/70 hover:bg-indigo-950/80 border border-slate-700 hover:border-indigo-500/60 text-[11px] text-slate-200 transition-colors flex items-center justify-between"
                  >
                    <span>Accounts</span>
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60">
                <Button
                  onClick={() => quickLogin('admin_maint')}
                  isLoading={isLoading}
                  variant="outline"
                  size="sm"
                  className="w-full text-slate-200 border-slate-700 hover:bg-slate-800"
                >
                  Launch Maintenance Admin
                </Button>
              </div>
            </div>

            {/* Role 3: Organization Administrator */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-900/60 text-emerald-300 border border-emerald-800 mb-2">
                  Executive Monitor
                </div>
                <h3 className="text-xl font-bold text-white">
                  Organization Administrator
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Global visibility across all 5 departments. Real-time workload distribution charts, ticket trends, conversation histories, audit trail, and ML metrics.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300">
                  <strong>Strict Governance Rule:</strong> Organization administrators have supervisor/monitor permissions and cannot alter domain ticket statuses.
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <Button
                  onClick={() => quickLogin('org_admin')}
                  isLoading={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Launch as Diana (Org Admin)
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-800">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-900/40 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/60">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Conversational Ticket Creation
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Employees describe issues in plain English. Assistant clarifies requirements and renders a confirmation card before submission.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-900/40 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-800/60">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Scikit-Learn ML Routing
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                TF-IDF vectorizer + Logistic Regression classifier trained on diverse enterprise dataset across 5 departments.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/60">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Backend-Enforced Authorization
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero leakage across department boundaries. Every endpoint validates JWT claims and departmental privileges.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Manual Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Enterprise Account Sign In"
        subtitle="Sign in with your WarpDrive Tech Works corporate credentials"
        maxWidth="md"
      >
        <form onSubmit={handleManualLogin} className="space-y-4">
          {loginError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {loginError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Corporate Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. employee@warpdrive.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your secure password"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400">
            <strong>Demo Credentials:</strong><br />
            Employee: <code>employee@warpdrive.com</code> / <code>EmployeePass123!</code><br />
            IT Admin: <code>admin.it@warpdrive.com</code> / <code>AdminPass123!</code><br />
            Org Admin: <code>org.admin@warpdrive.com</code> / <code>OrgAdminPass123!</code>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              isLoading={isSubmitting}
              className="w-full"
            >
              Sign In to Service Desk
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 WarpDrive Tech Works. All rights reserved. Enterprise Service Desk Platform.</p>
      </footer>
    </div>
  );
};
