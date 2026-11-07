import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, Globe, UserCheck, Search, Menu, 
  Smartphone, ShieldAlert, Wifi, WifiOff 
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { 
    currentUser, setCurrentUser, db, lang, setLang, 
    t, activeTab, setActiveTab, globalSearch, setGlobalSearch 
  } = useApp();
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 h-16 bg-[#0B192C] text-white border-b border-slate-800 flex items-center justify-between px-4 lg:px-6 shadow-md">
      
      {/* Zone 1: Sidebar Toggle & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition active:scale-95"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <img 
            src="/indus-logo.svg" 
            alt="Indus Logo" 
            className="w-9 h-9 object-contain shrink-0 filter drop-shadow" 
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-base tracking-wider text-white font-display leading-tight">
              {lang === 'ur' ? db.settings.academyNameUrdu : db.settings.academyName}
            </span>
            <span className="text-[10px] font-bold text-amber-400 tracking-widest uppercase">
              {lang === 'ur' ? db.settings.locationUrdu : db.settings.location}
            </span>
          </div>
        </div>
      </div>

      {/* Zone 2: Global Search & Connectivity Tag */}
      <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-slate-900/90 text-xs text-white placeholder-slate-400 rounded-lg pl-9 pr-4 py-2 border border-slate-700 focus:outline-none focus:border-amber-400 transition"
          />
          {globalSearch && (
            <button
              onClick={() => setGlobalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Zone 3: Action Center (Language, PWA Install, Role Switcher, Alerts) */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Network Connectivity Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-[11px] font-mono text-slate-300">
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Synced</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 font-sans">Offline DB</span>
            </>
          )}
        </div>

        {/* PWA Direct Install Button for Android */}
        {isInstallable && !isInstalled && (
          <button
            onClick={install}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow active:scale-95"
            title="Install Native Android PWA"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install Android App</span>
            <span className="sm:hidden">Install</span>
          </button>
        )}

        {/* Bilingual Language Switcher */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-300 transition"
          title="Switch Language (Urdu / English)"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold">{lang === 'en' ? 'اردو' : 'English'}</span>
        </button>

        {/* Announcements Notification Bell */}
        <button
          onClick={() => setActiveTab('notifications')}
          className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Announcements"
        >
          <Bell className="w-4 h-4" />
          {db.announcements.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {db.announcements.length}
            </span>
          )}
        </button>

        {/* Active Role Selector / Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-white transition active:scale-95"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-bold text-[11px] leading-tight truncate max-w-[110px]">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-amber-400 font-semibold uppercase">
                {t(currentUser.role)}
              </span>
            </div>
          </button>

          {/* Quick Role Simulation Modal / Dropdown */}
          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-slate-200">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px]">
                <div className="text-slate-400">Current Simulation Account:</div>
                <div className="font-bold text-white text-xs">{currentUser.name}</div>
                <div className="text-amber-400 font-mono text-[10px]">{currentUser.role.toUpperCase()}</div>
              </div>

              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('switchRole')}
                </div>
                {db.users.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition ${
                      currentUser.id === u.id 
                        ? 'bg-amber-500/20 text-amber-300 font-bold' 
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div>{u.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{t(u.role)}</div>
                    </div>
                    {currentUser.id === u.id && (
                      <UserCheck className="w-4 h-4 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
