import React, { useState, useEffect } from 'react';
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
  LogIn,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  KeyRound,
  Database,
  Check,
  Copy
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { api, BASE_URL } from '../../services/api';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

type PortalType = 'employee' | 'domain_admin' | 'org_admin' | 'general';

interface DemoAccount {
  role: string;
  name: string;
  email: string;
  pass: string;
  dept?: string;
  portal: PortalType;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // Employees
  {
    role: 'Employee',
    name: 'Sarah Connor',
    email: 'employee@warpdrive.com',
    pass: 'EmployeePass123!',
    dept: 'Engineering',
    portal: 'employee'
  },
  {
    role: 'Employee',
    name: 'John Doe',
    email: 'john.doe@warpdrive.com',
    pass: 'EmployeePass123!',
    dept: 'Operations',
    portal: 'employee'
  },
  // Domain Admins
  {
    role: 'Domain Admin',
    name: 'Alex Rivera',
    email: 'admin.it@warpdrive.com',
    pass: 'AdminPass123!',
    dept: 'IT Support',
    portal: 'domain_admin'
  },
  {
    role: 'Domain Admin',
    name: 'Elena Vance',
    email: 'admin.tech@warpdrive.com',
    pass: 'AdminPass123!',
    dept: 'Technical',
    portal: 'domain_admin'
  },
  {
    role: 'Domain Admin',
    name: 'Marcus Chen',
    email: 'admin.hr@warpdrive.com',
    pass: 'AdminPass123!',
    dept: 'HR',
    portal: 'domain_admin'
  },
  {
    role: 'Domain Admin',
    name: 'Priya Sharma',
    email: 'admin.accounts@warpdrive.com',
    pass: 'AdminPass123!',
    dept: 'Accounts',
    portal: 'domain_admin'
  },
  {
    role: 'Domain Admin',
    name: 'David Miller',
    email: 'admin.maint@warpdrive.com',
    pass: 'AdminPass123!',
    dept: 'Maintenance',
    portal: 'domain_admin'
  },
  // Organization Admin
  {
    role: 'Organization Admin',
    name: 'Diana Prince',
    email: 'org.admin@warpdrive.com',
    pass: 'OrgAdminPass123!',
    dept: 'Executive Oversight',
    portal: 'org_admin'
  }
];

export const LandingPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Modal & Form State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activePortal, setActivePortal] = useState<PortalType>('general');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Backend Health & Seed State
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'offline'>('checking');
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const checkConnection = () => {
    setBackendStatus('checking');
    api.checkHealth()
      .then(res => {
        if (res && res.status === 'healthy') {
          setBackendStatus('healthy');
        } else {
          setBackendStatus('offline');
        }
      })
      .catch(() => {
        setBackendStatus('offline');
      });
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const openPortalLogin = (portal: PortalType, prefillEmail: string = '', prefillPass: string = '') => {
    setActivePortal(portal);
    setEmail(prefillEmail);
    setPassword(prefillPass);
    setFieldErrors({});
    setLoginError('');
    setShowPassword(false);
    setIsLoginModalOpen(true);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = 'Corporate email address is required';
    } else if (!email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      // Navigation is handled automatically by App.tsx observing useAuth() state
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedDemoDatabase = async () => {
    setIsSeedingDemo(true);
    try {
      const res = await api.setupDemo();
      addToast(res.message || 'Demo database accounts verified and seeded successfully!', 'success');
      checkConnection();
    } catch (err: any) {
      addToast(err.message || 'Failed to verify demo accounts. Ensure backend is running.', 'error');
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast(`Copied "${text}" to clipboard`, 'info', 2000);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Dynamic portal details
  const portalMeta = {
    employee: {
      badge: 'Employee Portal',
      title: 'Employee Request Sign In',
      subtitle: 'Sign in with your corporate email to submit requests and track personal tickets',
      accentColor: 'blue',
      icon: <Bot className="w-5 h-5 text-blue-400" />
    },
    domain_admin: {
      badge: 'Department Admin',
      title: 'Department Administrator Sign In',
      subtitle: 'Sign in to manage authorized IT Support, Technical, HR, Accounts, or Maintenance queues',
      accentColor: 'indigo',
      icon: <Server className="w-5 h-5 text-indigo-400" />
    },
    org_admin: {
      badge: 'Organization Admin',
      title: 'Organization Administrator Sign In',
      subtitle: 'Sign in to access global analytics, audit logs, and cross-department governance',
      accentColor: 'emerald',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    general: {
      badge: 'Enterprise Access',
      title: 'WarpDrive Enterprise Sign In',
      subtitle: 'Enter your verified corporate credentials to access your authorized workspace',
      accentColor: 'blue',
      icon: <Lock className="w-5 h-5 text-blue-400" />
    }
  }[activePortal];

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
            {backendStatus === 'healthy' && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Backend API Connected • ML 97.5%
              </div>
            )}
            {backendStatus === 'checking' && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/50">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                Connecting to API...
              </div>
            )}
            {backendStatus === 'offline' && (
              <button
                onClick={checkConnection}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60 transition-colors"
                title="Backend may be waking up or unreachable. Click to retry connection."
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>API Offline / Spin-up</span>
                <RefreshCw className="w-3 h-3 ml-1 text-rose-400" />
              </button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => openPortalLogin('general')}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="text-slate-200 border-slate-700 hover:bg-slate-800"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Render Free Tier Spin-up Notice */}
        {backendStatus === 'offline' && (
          <div className="mb-8 p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-semibold text-amber-100">Render Free Tier Backend Notice: </span>
                Backend service at <code className="px-1.5 py-0.5 rounded bg-slate-950/70 text-xs text-amber-300 font-mono">{BASE_URL}</code> may be cold-starting (takes 30–50s on Render free tier).
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkConnection}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="text-amber-200 border-amber-700 hover:bg-amber-900/50 whitespace-nowrap text-xs shrink-0"
            >
              Check Health Again
            </Button>
          </div>
        )}

        {/* Hero Header */}
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

        {/* 3 Core Login Portals */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Enterprise Login Portals
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select your authorized portal to open the secure sign-in form.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Portal 1: Employee */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-blue-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-900/60 text-blue-300 border border-blue-800 mb-2">
                  Employee Portal
                </div>
                <h3 className="text-xl font-bold text-white">
                  Employee Service Portal
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
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>Automatic department & priority detection</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <Button
                  onClick={() => openPortalLogin('employee')}
                  className="w-full bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Employee Login
                </Button>
              </div>
            </div>

            {/* Portal 2: Department Admin */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Server className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-800 mb-2">
                  Domain Admin
                </div>
                <h3 className="text-xl font-bold text-white">
                  Department Admin Portal
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Authorized to manage assigned department queues. Process pending requests, append internal notes, record resolution summaries, or reopen tickets.
                </p>

                <p className="text-[11px] font-semibold text-indigo-300 mt-3 mb-2">
                  Authorized Department Queues:
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['IT Support', 'Technical', 'HR', 'Accounts', 'Maintenance'].map(dept => (
                    <span
                      key={dept}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] text-slate-300"
                    >
                      {dept}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Pending → In Progress → Completed workflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Strict backend department isolation</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60">
                <Button
                  onClick={() => openPortalLogin('domain_admin')}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Department Admin Login
                </Button>
              </div>
            </div>

            {/* Portal 3: Organization Admin */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between shadow-xl">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-900/60 text-emerald-300 border border-emerald-800 mb-2">
                  Executive Monitor
                </div>
                <h3 className="text-xl font-bold text-white">
                  Organization Admin Portal
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
                  onClick={() => openPortalLogin('org_admin')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Organization Admin Login
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Credentials Reference Section */}
        <div className="mb-16 p-6 rounded-2xl bg-slate-800/40 border border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">
                <Database className="w-3.5 h-3.5" />
                Verified Seeded Demo Accounts (Reference)
              </div>
              <h3 className="text-lg font-bold text-white">
                Official Demo Credentials
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Use these verified credentials in each portal's login form. Click "Fill Form" to populate the credentials into the sign-in modal.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDemoDatabase}
              isLoading={isSeedingDemo}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSeedingDemo ? 'animate-spin' : ''}`} />}
              className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800 shrink-0"
              title="Ensure demo accounts exist and password hashes match in the live database"
            >
              Verify Database Demo Accounts
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employee Demo Accounts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <Bot className="w-4 h-4" />
                <span>Employee Accounts</span>
              </div>

              <div className="space-y-2">
                {DEMO_ACCOUNTS.filter(a => a.portal === 'employee').map(acc => (
                  <div
                    key={acc.email}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{acc.name}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{acc.email}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Pass: {acc.pass}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(acc.email, `emp-${acc.email}`)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy email"
                      >
                        {copiedKey === `emp-${acc.email}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openPortalLogin('employee', acc.email, acc.pass)}
                        className="px-2 py-1 rounded bg-blue-600/20 text-blue-300 hover:bg-blue-600/40 border border-blue-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Fill Form
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Domain Admin Demo Accounts */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                <Server className="w-4 h-4" />
                <span>Department Admin Accounts</span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {DEMO_ACCOUNTS.filter(a => a.portal === 'domain_admin').map(acc => (
                  <div
                    key={acc.email}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">{acc.dept}</span>
                        <span className="text-[10px] text-slate-400 truncate">({acc.name})</span>
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{acc.email}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Pass: {acc.pass}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(acc.email, `admin-${acc.email}`)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy email"
                      >
                        {copiedKey === `admin-${acc.email}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openPortalLogin('domain_admin', acc.email, acc.pass)}
                        className="px-2 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Fill Form
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Org Admin Demo Account */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Organization Admin Account</span>
              </div>

              <div className="space-y-2">
                {DEMO_ACCOUNTS.filter(a => a.portal === 'org_admin').map(acc => (
                  <div
                    key={acc.email}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{acc.name}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{acc.email}</p>
                      <p className="text-[10px] text-slate-500 font-mono">Pass: {acc.pass}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => copyToClipboard(acc.email, `org-${acc.email}`)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Copy email"
                      >
                        {copiedKey === `org-${acc.email}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openPortalLogin('org_admin', acc.email, acc.pass)}
                        className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/40 border border-emerald-500/30 text-[11px] font-semibold transition-colors"
                      >
                        Fill Form
                      </button>
                    </div>
                  </div>
                ))}

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300">Authentication Policy: </span>
                  Passwords are encrypted using bcrypt (12 rounds) and verified against PostgreSQL on Neon. JWT tokens expire after 24 hours.
                </div>
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
                Employees describe issues in natural language. Assistant clarifies requirements and renders a confirmation card before submission.
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

      {/* Enterprise Authentication Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title={portalMeta.title}
        subtitle={portalMeta.subtitle}
        maxWidth="md"
      >
        <div className="space-y-4">
          {/* Portal Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActivePortal('employee')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activePortal === 'employee'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => setActivePortal('domain_admin')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activePortal === 'domain_admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dept Admin
            </button>
            <button
              type="button"
              onClick={() => setActivePortal('org_admin')}
              className={`flex-1 py-1.5 rounded-lg transition-all ${
                activePortal === 'org_admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Org Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            {loginError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Corporate Email / User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled={isSubmitting}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                  }}
                  placeholder={
                    activePortal === 'employee'
                      ? 'employee@warpdrive.com'
                      : activePortal === 'domain_admin'
                      ? 'admin.it@warpdrive.com'
                      : activePortal === 'org_admin'
                      ? 'org.admin@warpdrive.com'
                      : 'name@warpdrive.com'
                  }
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.email
                      ? 'border border-rose-500 focus:ring-rose-500'
                      : 'border border-slate-700 focus:ring-blue-500'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-slate-500">Bcrypt encrypted</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isSubmitting}
                  onChange={e => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your secure password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                    fieldErrors.password
                      ? 'border border-rose-500 focus:ring-rose-500'
                      : 'border border-slate-700 focus:ring-blue-500'
                  } ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-rose-400 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Quick Demo Credentials Tip */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-300">Demo Password Pattern: </span>
                <code className="text-blue-300 bg-slate-950 px-1.5 py-0.5 rounded">RoleNamePass123!</code>
              </div>
              <span className="text-[10px] text-slate-500">e.g. EmployeePass123!</span>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsLoginModalOpen(false)}
                disabled={isSubmitting}
                className="w-full sm:w-1/3 text-slate-300 border-slate-700 hover:bg-slate-800 text-xs"
              >
                Back to Portals
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full sm:w-2/3"
                leftIcon={<LogIn className="w-4 h-4" />}
              >
                {isSubmitting ? 'Authenticating...' : `Sign In to Service Desk`}
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 WarpDrive Tech Works. All rights reserved. Enterprise Service Desk Platform.</p>
      </footer>
    </div>
  );
};
