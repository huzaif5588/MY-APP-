import React from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  ShieldCheck, GraduationCap, CreditCard, HeartHandshake, 
  ArrowRight, Globe, Lock, Shield 
} from 'lucide-react';

interface PortalSelectionScreenProps {
  onSelectPortal: (portal: UserRole) => void;
}

export const PortalSelectionScreen: React.FC<PortalSelectionScreenProps> = ({ onSelectPortal }) => {
  const { db, lang, setLang, t } = useApp();

  const portals = [
    {
      id: 'super_admin' as UserRole,
      title: 'Admin Portal',
      titleUrdu: 'ایڈمن پورٹل',
      subtitle: 'Director / Principal (Sir Noman) & Administrators',
      subtitleUrdu: 'پرنسپل سر نعمان اور مرکزی انتظامیہ',
      desc: 'Complete institutional administration, admissions, faculty coordination, curriculum, settings & security.',
      icon: ShieldCheck,
      color: 'border-amber-400 bg-gradient-to-b from-amber-500/10 to-transparent text-amber-500',
      badge: 'Principal & Super Admin',
      btnBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950',
    },
    {
      id: 'teacher' as UserRole,
      title: 'Teacher Portal',
      titleUrdu: 'اساتذہ پورٹل',
      subtitle: 'Faculty Members & Subject Incharges',
      subtitleUrdu: 'اساتذہ کرام اور مضامین انچارج',
      desc: 'Classroom student rosters, daily attendance marking, homework diary uploads, and examination marks ledger.',
      icon: GraduationCap,
      color: 'border-blue-500 bg-gradient-to-b from-blue-500/10 to-transparent text-blue-400',
      badge: 'Faculty Access',
      btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
    {
      id: 'accountant' as UserRole,
      title: 'Accountant Portal',
      titleUrdu: 'اکاؤنٹس پورٹل',
      subtitle: 'Finance, Fees & Payroll Department',
      subtitleUrdu: 'فیس، حسابات اور اخراجات شعبہ',
      desc: 'Fee voucher generation, payment collection receipts, fee defaulters follow-up, and institutional expense ledger.',
      icon: CreditCard,
      color: 'border-emerald-500 bg-gradient-to-b from-emerald-500/10 to-transparent text-emerald-400',
      badge: 'Finance & Cashier',
      btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    {
      id: 'parent' as UserRole,
      title: 'Parent Portal',
      titleUrdu: 'والدین پورٹل',
      subtitle: 'Authorized Parents & Legal Guardians',
      subtitleUrdu: 'محترم والدین اور سرپرست حضرات',
      desc: 'Private child monitoring: real-time attendance, fee dues & verified receipts, term examination report cards.',
      icon: HeartHandshake,
      color: 'border-purple-500 bg-gradient-to-b from-purple-500/10 to-transparent text-purple-400',
      badge: 'Family & Guardians',
      btnBg: 'bg-purple-600 hover:bg-purple-500 text-white',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B192C] text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.12)_0%,transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,86,179,0.15)_0%,transparent_60%)] pointer-events-none" />

      {/* Top Header Bar */}
      <div className="pt-safe w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/indus-logo.svg" 
            alt="Indus Academy Emblem" 
            className="w-12 h-12 object-contain drop-shadow-md" 
          />
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl tracking-wider font-display text-white">
              {lang === 'ur' ? db.settings.academyNameUrdu : db.settings.academyName}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-widest">
              {lang === 'ur' ? db.settings.locationUrdu : db.settings.location}
            </p>
          </div>
        </div>

        {/* Language Toggle & Security Tag */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] text-amber-300 font-mono">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Firebase Auth RBAC</span>
          </div>

          <button
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-300 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'اردو زبان' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-8 w-full max-w-6xl mx-auto z-10">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Secure Role-Based Access Control</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
            {lang === 'ur' ? 'اپنا پورٹل منتخب کر کے لاگ ان کریں' : 'Select Your Institutional Login Portal'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            {lang === 'ur' 
              ? 'ہر شعبے کیلئے علیحدہ اور محفوظ لاگ ان کا نظام۔ اپنا متعلقہ پورٹل منتخب کریں۔' 
              : 'Unauthorized access is prohibited. Each institutional department features dedicated authentication.'}
          </p>
        </div>

        {/* 4 Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {portals.map(portal => {
            const Icon = portal.icon;

            return (
              <div
                key={portal.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-slate-900/80 backdrop-blur-sm ${portal.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                      {portal.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold font-display text-white">
                    {lang === 'ur' ? portal.titleUrdu : portal.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-300 mt-1">
                    {lang === 'ur' ? portal.subtitleUrdu : portal.subtitle}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                    {portal.desc}
                  </p>
                </div>

                <button
                  onClick={() => onSelectPortal(portal.id)}
                  className={`mt-6 w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md ${portal.btnBg}`}
                >
                  <span>{lang === 'ur' ? 'لاگ ان کریں' : 'Enter Portal'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pb-safe w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-4 z-10">
        <div>
          <span>INDUS ACADEMY • Under Direct Leadership of <strong>Sir Noman (Principal)</strong></span>
        </div>
        <div className="font-mono mt-2 sm:mt-0 text-amber-300/80">
          Backend: Firebase Auth & Cloud Firestore
        </div>
      </div>

    </div>
  );
};
