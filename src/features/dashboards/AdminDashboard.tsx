import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, Users, GraduationCap, CalendarCheck, 
  CreditCard, Award, BookOpen, Clock, FileText, 
  DollarSign, Library, Bus, Package, BarChart3, 
  Bell, Smartphone, Settings, LogOut, ShieldCheck, 
  CloudUpload, CheckCircle2, UserCheck, Key, Globe 
} from 'lucide-react';
import { seedFirestoreDatabase } from '../../firebase/services/seedService';

// Dedicated Modules
import { DashboardModule } from '../../components/modules/DashboardModule';
import { StudentsModule } from '../../components/modules/StudentsModule';
import { TeachersModule } from '../../components/modules/TeachersModule';
import { AttendanceModule } from '../../components/modules/AttendanceModule';
import { FeesModule } from '../../components/modules/FeesModule';
import { ExaminationsModule } from '../../components/modules/ExaminationsModule';
import { ClassesModule } from '../../components/modules/ClassesModule';
import { TimetableModule } from '../../components/modules/TimetableModule';
import { HomeworkModule } from '../../components/modules/HomeworkModule';
import { AccountsModule } from '../../components/modules/AccountsModule';
import { LibraryModule } from '../../components/modules/LibraryModule';
import { TransportModule } from '../../components/modules/TransportModule';
import { InventoryModule } from '../../components/modules/InventoryModule';
import { ReportsModule } from '../../components/modules/ReportsModule';
import { NotificationsModule } from '../../components/modules/NotificationsModule';
import { AndroidApkModule } from '../../components/modules/AndroidApkModule';
import { SettingsModule } from '../../components/modules/SettingsModule';

import { AccessDeniedScreen } from '../authentication/AccessDeniedScreen';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const { currentUser, db, t, lang, setLang } = useApp();

  // Route Guard: Deny access if role is not super_admin or principal
  if (currentUser.role !== 'super_admin' && currentUser.role !== 'principal') {
    return (
      <AccessDeniedScreen
        attemptedRole="Super Administrator & Principal Portal"
        onGoToAuthorizedDashboard={() => {}}
        onLogout={onLogout}
      />
    );
  }

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [seedStatus, setSeedStatus] = useState<string>('');
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const handleSeedCloudFirestore = async () => {
    setIsSeeding(true);
    const result = await seedFirestoreDatabase();
    setIsSeeding(false);
    if (result.success) {
      setSeedStatus(`Successfully initialized Cloud Firestore with ${result.count} official Indus Academy documents!`);
    } else {
      setSeedStatus('Firestore already populated or connection verified.');
    }
    setTimeout(() => setSeedStatus(''), 5000);
  };

  const adminNav = [
    { id: 'dashboard', label: '1. Executive Dashboard', icon: LayoutDashboard },
    { id: 'students', label: '2. Student Directory', icon: Users },
    { id: 'admission', label: '3. Admission Management', icon: Users },
    { id: 'teachers', label: '4. Teacher & Faculty Management', icon: GraduationCap },
    { id: 'accountants', label: '5. Accountant Management', icon: DollarSign },
    { id: 'parents', label: '6. Parent Management', icon: UserCheck },
    { id: 'attendance', label: '7. Attendance Sessions', icon: CalendarCheck },
    { id: 'fees', label: '8. Fee Vouchers & Collection', icon: CreditCard },
    { id: 'examinations', label: '9. Examination & Results', icon: Award },
    { id: 'classes', label: '10. Classes & Sections', icon: BookOpen },
    { id: 'subjects', label: '11. Subjects Curriculum', icon: BookOpen },
    { id: 'timetable', label: '12. Timetable Management', icon: Clock },
    { id: 'homework', label: '13. Homework Diary', icon: FileText },
    { id: 'accounts', label: '14. Institutional Accounts', icon: DollarSign },
    { id: 'salaries', label: '15. Faculty Salary Payroll', icon: DollarSign },
    { id: 'library', label: '16. Library Management', icon: Library },
    { id: 'transport', label: '17. Fleet & Transport Routes', icon: Bus },
    { id: 'inventory', label: '18. Inventory & Assets', icon: Package },
    { id: 'notifications', label: '19. Official Announcements', icon: Bell },
    { id: 'reports', label: '20. Reports & Analytics', icon: BarChart3 },
    { id: 'backup', label: '21. Backup & Restore', icon: Settings },
    { id: 'permissions', label: '22. RBAC Permissions', icon: Key },
    { id: 'settings', label: '23. Academy Settings', icon: Settings },
    { id: 'androidApk', label: 'Android APK & Code Suite', icon: Smartphone },
  ];

  return (
    <div className="space-y-6">
      
      {/* Admin Executive Top Bar */}
      <div className="bg-[#0B192C] text-white p-5 rounded-2xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-lg flex items-center justify-center shadow">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-full border border-amber-800">
                DIRECTOR & SUPER ADMIN
              </span>
              <span className="text-xs text-slate-400 font-mono">Principal Sir Noman</span>
            </div>
            <h1 className="text-xl font-bold font-display text-white mt-0.5">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300">
              INDUS ACADEMY – KALABAGH • Complete Executive Administration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* Cloud Firestore Sync Button */}
          <button
            onClick={handleSeedCloudFirestore}
            disabled={isSeeding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow active:scale-95"
            title="Populate or Synchronize Cloud Firestore with Academy Records"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>{isSeeding ? 'Syncing...' : 'Sync Firestore'}</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {seedStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{seedStatus}</span>
        </div>
      )}

      {/* Admin 23-Module Horizontal Navigation Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs overflow-x-auto flex items-center gap-1.5">
        {adminNav.map(nav => {
          const Icon = nav.icon;
          const isActive = activeTab === nav.id;

          return (
            <button
              key={nav.id}
              onClick={() => setActiveTab(nav.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-2 transition ${
                isActive 
                  ? 'bg-[#0B192C] text-amber-300 shadow font-bold' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{nav.label}</span>
            </button>
          );
        })}
      </div>

      {/* Dedicated Module Screen Router */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && <DashboardModule />}
        {(activeTab === 'students' || activeTab === 'admission') && <StudentsModule />}
        {activeTab === 'teachers' && <TeachersModule />}
        {activeTab === 'accountants' && <FeesModule />}
        {activeTab === 'parents' && <StudentsModule />}
        {activeTab === 'attendance' && <AttendanceModule />}
        {activeTab === 'fees' && <FeesModule />}
        {activeTab === 'examinations' && <ExaminationsModule />}
        {(activeTab === 'classes' || activeTab === 'subjects') && <ClassesModule />}
        {activeTab === 'timetable' && <TimetableModule />}
        {activeTab === 'homework' && <HomeworkModule />}
        {(activeTab === 'accounts' || activeTab === 'salaries') && <AccountsModule />}
        {activeTab === 'library' && <LibraryModule />}
        {activeTab === 'transport' && <TransportModule />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'notifications' && <NotificationsModule />}
        {activeTab === 'reports' && <ReportsModule />}
        {(activeTab === 'backup' || activeTab === 'permissions' || activeTab === 'settings') && <SettingsModule />}
        {activeTab === 'androidApk' && <AndroidApkModule />}
      </div>

    </div>
  );
};
