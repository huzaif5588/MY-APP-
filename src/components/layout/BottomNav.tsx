import React from 'react';
import { useApp } from '../../context/AppContext';
import { LayoutDashboard, Users, CalendarCheck, CreditCard, Menu } from 'lucide-react';

interface BottomNavProps {
  onOpenSidebar: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenSidebar }) => {
  const { activeTab, setActiveTab, t } = useApp();

  const tabs = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard },
    { id: 'students', labelKey: 'students', icon: Users },
    { id: 'attendance', labelKey: 'attendance', icon: CalendarCheck },
    { id: 'fees', labelKey: 'fees', icon: CreditCard },
  ];

  return (
    <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0B192C]/95 backdrop-blur-md border-t border-slate-800 text-slate-400 pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center h-full transition active:scale-95 ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5 mb-1 shrink-0" />
              <span className="text-[10px] leading-tight truncate max-w-[58px]">
                {t(tab.labelKey as any)}
              </span>
            </button>
          );
        })}

        {/* 5th button: Open Full Sidebar Menu */}
        <button
          onClick={onOpenSidebar}
          className="flex flex-col items-center justify-center h-full text-slate-400 hover:text-slate-200 active:scale-95"
        >
          <Menu className="w-5 h-5 mb-1 shrink-0" />
          <span className="text-[10px] leading-tight truncate">Menu</span>
        </button>
      </div>
    </nav>
  );
};
