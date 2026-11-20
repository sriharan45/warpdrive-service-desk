import React, { useState } from 'react';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { EmployeeDashboard } from './EmployeeDashboard';
import { AIChatAssistant } from './AIChatAssistant';
import { MyTickets } from './MyTickets';
import { EmployeeSettings } from './EmployeeSettings';

export const EmployeePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <EmployeeDashboard
              onStartChat={() => setActiveTab('chat')}
              onViewAllTickets={() => setActiveTab('tickets')}
            />
          )}
          {activeTab === 'chat' && (
            <AIChatAssistant onViewTickets={() => setActiveTab('tickets')} />
          )}
          {activeTab === 'tickets' && (
            <MyTickets onCreateTicket={() => setActiveTab('chat')} />
          )}
          {activeTab === 'profile' && <EmployeeSettings />}
        </main>
      </div>
    </div>
  );
};
