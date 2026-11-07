import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole } from './types';
import { SplashScreen } from './components/common/SplashScreen';
import { DocumentModal } from './components/documents/DocumentModal';
import { PortalSelectionScreen } from './features/authentication/PortalSelectionScreen';
import { LoginScreen } from './features/authentication/LoginScreen';
import { AdminDashboard } from './features/dashboards/AdminDashboard';
import { TeacherDashboard } from './features/dashboards/TeacherDashboard';
import { AccountantDashboard } from './features/dashboards/AccountantDashboard';
import { ParentDashboard } from './features/dashboards/ParentDashboard';
import { AccessDeniedScreen } from './features/authentication/AccessDeniedScreen';
import { ShieldCheck, Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { 
    showSplash, 
    dismissSplash, 
    db, 
    currentUser, 
    isAuthenticated, 
    isAuthLoading, 
    loginUser, 
    logout 
  } = useApp();

  const [selectedPortal, setSelectedPortal] = useState<UserRole | null>(null);

  // 1. Initial Academy Splash Screen
  if (showSplash) {
    return (
      <SplashScreen
        onDismiss={dismissSplash}
        academyName={db.settings.academyName}
        location={db.settings.location}
        tagline={db.settings.tagline}
        director={db.settings.directorName}
      />
    );
  }

  // 2. Firebase Security Session Check
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B192C] text-white flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-amber-400/40 p-3 shadow-2xl flex items-center justify-center mb-5 animate-pulse">
          <img 
            src="/indus-logo.svg" 
            alt="Indus Academy Emblem" 
            className="w-14 h-14 object-contain" 
          />
        </div>
        <h2 className="text-xl font-extrabold font-display text-white tracking-wide">
          INDUS ACADEMY – KALABAGH
        </h2>
        <div className="flex items-center gap-2 mt-3 text-xs font-medium text-amber-300">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
          <span>Verifying Firebase Security Session...</span>
        </div>
        <div className="mt-8 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Cloud Firestore & Auth TLS 1.3</span>
        </div>
      </div>
    );
  }

  // 3. Unauthenticated Gateway: 4 Portals Selection or Portal-Specific Login
  if (!isAuthenticated) {
    if (!selectedPortal) {
      return (
        <PortalSelectionScreen 
          onSelectPortal={(portal) => setSelectedPortal(portal)} 
        />
      );
    }

    return (
      <LoginScreen
        portal={selectedPortal}
        onBack={() => setSelectedPortal(null)}
        onLoginSuccess={(user) => {
          loginUser(user);
          setSelectedPortal(null);
        }}
      />
    );
  }

  // 4. Authenticated Role-Based Dashboard Routing with Strict Route Guards
  const renderDashboardByRole = () => {
    switch (currentUser.role) {
      case 'super_admin':
      case 'principal':
        return <AdminDashboard onLogout={logout} />;
      case 'teacher':
        return <TeacherDashboard onLogout={logout} />;
      case 'accountant':
        return <AccountantDashboard onLogout={logout} />;
      case 'parent':
        return <ParentDashboard onLogout={logout} />;
      default:
        return (
          <AccessDeniedScreen
            attemptedRole={currentUser.role}
            onGoToAuthorizedDashboard={() => {}}
            onLogout={logout}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 antialiased text-slate-900 flex flex-col">
      <main className="flex-1 p-3 sm:p-5 lg:p-6 pb-20 max-w-7xl mx-auto w-full">
        {renderDashboardByRole()}
      </main>

      {/* Official Academy Document Modal (Fee Receipts, ID Cards, Result Cards) */}
      <DocumentModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
