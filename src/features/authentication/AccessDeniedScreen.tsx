import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

interface AccessDeniedScreenProps {
  attemptedRole?: string;
  onGoToAuthorizedDashboard: () => void;
  onLogout: () => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  attemptedRole,
  onGoToAuthorizedDashboard,
  onLogout,
}) => {
  const { currentUser, lang } = useApp();

  return (
    <div className="min-h-screen bg-[#0B192C] text-white flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 p-4 shadow-2xl flex items-center justify-center mb-6">
        <ShieldAlert className="w-12 h-12 text-rose-500 animate-bounce" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold mb-3">
        <Lock className="w-3.5 h-3.5" />
        <span>HTTP 403 • ACCESS DENIED</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white max-w-md">
        {lang === 'ur' ? 'رسائی کی ممانعت • غیر مجاز پورٹل' : 'Unauthorized Institutional Access'}
      </h1>

      <p className="text-xs sm:text-sm text-slate-300 max-w-lg mt-3 leading-relaxed">
        {lang === 'ur'
          ? 'آپ کا اکاؤنٹ اس شعبے یا ڈیش بورڈ تک رسائی کے مجاز اختیارات نہیں رکھتا۔ برائے مہربانی اپنے متعلقہ مجاز پورٹل پر جائیں۔'
          : 'Your authenticated session does not possess authorized security clearance for this operational dashboard. Security rules have blocked this request.'}
      </p>

      {/* Role Verification Audit Card */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-left max-w-md w-full space-y-2">
        <div className="flex justify-between items-center text-slate-400">
          <span>Authenticated Account:</span>
          <span className="font-mono text-slate-200">{currentUser.email || currentUser.username}</span>
        </div>
        <div className="flex justify-between items-center text-slate-400">
          <span>Verified Security Role:</span>
          <span className="font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
            {currentUser.role}
          </span>
        </div>
        {attemptedRole && (
          <div className="flex justify-between items-center text-slate-400">
            <span>Attempted Target:</span>
            <span className="font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold uppercase text-[10px]">
              {attemptedRole}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Options */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <button
          onClick={onGoToAuthorizedDashboard}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to My Authorized Dashboard</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Sign Out / Switch Portal</span>
        </button>
      </div>

      <div className="mt-12 text-[10px] text-slate-500 font-mono">
        INDUS ACADEMY • Zero-Trust Role-Based Access Control Active
      </div>
    </div>
  );
};
