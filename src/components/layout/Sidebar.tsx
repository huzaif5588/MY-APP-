import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarCheck, 
  CreditCard, Award, BookOpen, Clock, FileText, 
  HeartHandshake, DollarSign, Library, Bus, 
  Package, BarChart3, Bell, Smartphone, Settings,
  X, ShieldCheck
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  labelKey: any;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, currentUser, t, lang, db } = useApp();

  const navItems: NavItem[] = [
    { id: 'dashboard', labelKey: 'dashboard', icon: LayoutDashboard, allowedRoles: ['super_admin', 'principal', 'accountant', 'teacher'] },
    { id: 'students', labelKey: 'students', icon: Users, allowedRoles: ['super_admin', 'principal', 'teacher'], badge: db.students.length },
    { id: 'teachers', labelKey: 'teachers', icon: GraduationCap, allowedRoles: ['super_admin', 'principal'], badge: db.teachers.length },
    { id: 'attendance', labelKey: 'attendance', icon: CalendarCheck, allowedRoles: ['super_admin', 'principal', 'teacher'] },
    { id: 'fees', labelKey: 'fees', icon: CreditCard, allowedRoles: ['super_admin', 'principal', 'accountant'] },
    { id: 'examinations', labelKey: 'examinations', icon: Award, allowedRoles: ['super_admin', 'principal', 'teacher'] },
    { id: 'classes', labelKey: 'classes', icon: BookOpen, allowedRoles: ['super_admin', 'principal'] },
    { id: 'timetable', labelKey: 'timetable', icon: Clock, allowedRoles: ['super_admin', 'principal', 'teacher'] },
    { id: 'homework', labelKey: 'homework', icon: FileText, allowedRoles: ['super_admin', 'principal', 'teacher', 'parent'] },
    { id: 'parents', labelKey: 'parents', icon: HeartHandshake, allowedRoles: ['super_admin', 'principal', 'parent'] },
    { id: 'accounts', labelKey: 'accounts', icon: DollarSign, allowedRoles: ['super_admin', 'accountant'] },
    { id: 'library', labelKey: 'library', icon: Library, allowedRoles: ['super_admin', 'principal', 'teacher'] },
    { id: 'transport', labelKey: 'transport', icon: Bus, allowedRoles: ['super_admin', 'principal'] },
    { id: 'inventory', labelKey: 'inventory', icon: Package, allowedRoles: ['super_admin'] },
    { id: 'reports', labelKey: 'reports', icon: BarChart3, allowedRoles: ['super_admin', 'principal', 'accountant'] },
    { id: 'notifications', labelKey: 'notifications', icon: Bell, allowedRoles: ['super_admin', 'principal', 'accountant', 'teacher', 'parent'], badge: db.announcements.length },
    { id: 'androidApk', labelKey: 'androidApk', icon: Smartphone, allowedRoles: ['super_admin', 'principal', 'accountant', 'teacher', 'parent'] },
    { id: 'settings', labelKey: 'settings', icon: Settings, allowedRoles: ['super_admin'] },
  ];

  const visibleItems = navItems.filter(item => item.allowedRoles.includes(currentUser.role));

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`no-print fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-[#0B192C] text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header in Drawer */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <img src="/indus-logo.svg" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-white text-sm font-display">INDUS ACADEMY</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Pill in Sidebar */}
        <div className="p-4 mx-3 my-2 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-sm flex items-center justify-center shadow">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-xs text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-amber-400 font-semibold tracking-wide uppercase">
                {t(currentUser.role)}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {lang === 'ur' ? 'مرکزی مینیو' : 'ACADEMY MODULES'}
          </div>

          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span className="truncate">{t(item.labelKey)}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive 
                      ? 'bg-slate-950 text-amber-300 font-bold' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Academy Footer Info */}
        <div className="p-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>v1.0 Production Core</span>
          </div>
          <span className="font-mono">Kalabagh</span>
        </div>
      </aside>
    </>
  );
};
