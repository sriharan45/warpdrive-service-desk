import React, { useState } from 'react';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { GlobalDashboard } from './GlobalDashboard';
import { GlobalTickets } from './GlobalTickets';
import { AuditLogsViewer } from './AuditLogsViewer';
import { MLModelInspector } from './MLModelInspector';

export const OrgAdminPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <GlobalDashboard
              onViewAllTickets={() => setActiveTab('all_tickets')}
              onViewAuditLogs={() => setActiveTab('audit_logs')}
              onViewMLMetrics={() => setActiveTab('ml_metrics')}
            />
          )}
          {activeTab === 'all_tickets' && <GlobalTickets />}
          {activeTab === 'audit_logs' && <AuditLogsViewer />}
          {activeTab === 'ml_metrics' && <MLModelInspector />}
        </main>
      </div>
    </div>
  );
};
