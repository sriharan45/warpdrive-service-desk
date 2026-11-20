import React from 'react';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './components/landing/LandingPage';
import { EmployeePortal } from './components/employee/EmployeePortal';
import { DomainAdminPortal } from './components/domain_admin/DomainAdminPortal';
import { OrgAdminPortal } from './components/org_admin/OrgAdminPortal';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-400">
          Initializing WarpDrive Service Desk...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (user.role === 'employee') {
    return <EmployeePortal />;
  }

  if (user.role === 'domain_admin') {
    return <DomainAdminPortal />;
  }

  if (user.role === 'org_admin') {
    return <OrgAdminPortal />;
  }

  return <LandingPage />;
};
export default App;
