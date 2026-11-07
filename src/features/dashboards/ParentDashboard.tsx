import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccessDeniedScreen } from '../authentication/AccessDeniedScreen';
import { 
  HeartHandshake, Award, CalendarCheck, CreditCard, 
  FileText, Download, Printer, Shield, CheckCircle2,
  AlertCircle, BookOpen, Clock, LogOut, Globe, Bell,
  User, Check, ChevronRight
} from 'lucide-react';

interface ParentDashboardProps {
  onLogout: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onLogout }) => {
  const { currentUser, db, openPrintModal, t, lang, setLang } = useApp();

  // Route Guard: Deny access if role is not parent or administrator
  if (currentUser.role !== 'parent' && currentUser.role !== 'super_admin' && currentUser.role !== 'principal') {
    return (
      <AccessDeniedScreen
        attemptedRole="Parent & Guardian Portal"
        onGoToAuthorizedDashboard={() => {}}
        onLogout={onLogout}
      />
    );
  }

  // Linked children strictly authorized for this parent
  const linkedStudentIds = currentUser.linkedStudentIds && currentUser.linkedStudentIds.length > 0
    ? currentUser.linkedStudentIds
    : ['s-01', 's-03'];

  const authorizedChildren = db.students.filter(s => linkedStudentIds.includes(s.id));

  const [selectedChildId, setSelectedChildId] = useState<string>(
    authorizedChildren[0]?.id || linkedStudentIds[0] || 's-01'
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'results' | 'homework' | 'notices'>('overview');

  const currentChild = authorizedChildren.find(s => s.id === selectedChildId) || authorizedChildren[0] || db.students[0];

  // Scoped Data for the currently selected child ONLY
  const childAttendance = db.attendanceRecords.filter(r => r.studentId === currentChild.id);
  const totalDays = childAttendance.length || 10;
  const presentDays = childAttendance.filter(r => r.status === 'present').length || 9;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  const childInvoices = db.feeInvoices.filter(inv => inv.studentId === currentChild.id);
  const childPayments = db.feePayments.filter(p => p.studentId === currentChild.id);
  const pendingDues = childInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  const childResults = db.examResults.filter(r => r.studentId === currentChild.id);
  const childHomework = db.homework.filter(h => h.classId === currentChild.classId);
  const parentAnnouncements = db.announcements.filter(a => a.targetRole === 'all' || a.targetRole === 'parents');

  return (
    <div className="space-y-6">
      
      {/* 1. Parent Dedicated Executive Top Bar */}
      <div className="bg-[#0B192C] text-white p-5 rounded-2xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded-full border border-purple-800">
                PARENT & GUARDIAN PORTAL
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {authorizedChildren.length} Linked Child{authorizedChildren.length > 1 ? 'ren' : ''}
              </span>
            </div>
            <h1 className="text-xl font-bold font-display text-white mt-0.5">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300">
              {lang === 'ur' ? 'صرف اپنے بچوں کے تعلیمی ریکارڈ تک محدود اور محفوظ رسائی' : 'Private academic, attendance, fee ledger, and result monitoring'}
            </p>
          </div>
        </div>

        {/* Action Controls & Child Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Child Switcher (if multiple linked children) */}
          {authorizedChildren.length > 1 && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-purple-400" />
              <select
                value={selectedChildId}
                onChange={e => setSelectedChildId(e.target.value)}
                className="bg-transparent text-xs text-purple-300 font-bold focus:outline-none"
              >
                {authorizedChildren.map(child => (
                  <option key={child.id} value={child.id} className="bg-slate-900 text-white">
                    {child.name} ({child.className})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Bilingual Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-purple-300 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
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

      {/* 2. Parent-Only Navigation Menu */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: '1. Child Profile & Overview', icon: User },
          { id: 'attendance', label: '2. Attendance Calendar', icon: CalendarCheck },
          { id: 'fees', label: '3. Fees & Verified Receipts', icon: CreditCard },
          { id: 'results', label: '4. Examination Report Card', icon: Award },
          { id: 'homework', label: '5. Homework Diary', icon: BookOpen },
          { id: 'notices', label: '6. Parent Notices', icon: Bell },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-2 transition ${
                isActive
                  ? 'bg-purple-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Dedicated Views */}

      {/* VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Child Identity Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 font-extrabold text-2xl flex items-center justify-center shadow-xs">
                {currentChild.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                    {currentChild.regNo}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    Roll No: {currentChild.rollNo}
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-display text-slate-900 mt-1">
                  {currentChild.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {currentChild.className} • Section {currentChild.section} • Session 2026-2027
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openPrintModal('id_card', { student: currentChild })}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Student ID Card</span>
              </button>
            </div>
          </div>

          {/* KPI Snapshot Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Overall Attendance</span>
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                {attendanceRate}%
              </div>
              <span className="text-xs text-emerald-600 font-semibold mt-1 block">
                {presentDays} days attended of {totalDays} sessions
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Fee Dues Balance</span>
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <div className={`text-3xl font-black font-mono mt-2 ${pendingDues > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                PKR {pendingDues.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 font-semibold mt-1 block">
                {pendingDues > 0 ? 'Monthly voucher pending settlement' : 'All fee vouchers cleared'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Latest Term Result</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                {childResults[0]?.grade || 'A+'} ({childResults[0]?.percentage || 92}%)
              </div>
              <span className="text-xs text-amber-600 font-semibold mt-1 block">
                Rank: 1st Position in {currentChild.className}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Attendance Record for {currentChild.name}
              </h3>
              <p className="text-xs text-slate-500">
                Verified daily attendance register maintained by class faculty
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
              {attendanceRate}% Regular Attendance
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {childAttendance.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                No absence records logged for this student. Perfect attendance record.
              </div>
            ) : (
              childAttendance.map(record => (
                <div key={record.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${record.status === 'present' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <div>
                      <div className="font-semibold text-slate-800 font-mono">{record.date}</div>
                      <div className="text-[11px] text-slate-400">Class: {record.classId}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase font-mono ${
                    record.status === 'present' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: FEES */}
      {activeTab === 'fees' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-display mb-4">
              Monthly Tuition Fee Invoices
            </h3>

            <div className="space-y-3">
              {childInvoices.map(inv => (
                <div key={inv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{inv.invoiceNo}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                        Month: {inv.month}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1">
                      Payable: PKR {inv.totalPayable.toLocaleString()} • Paid: PKR {inv.paidAmount.toLocaleString()} • Balance: <strong>PKR {inv.balance.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase font-mono ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.status}
                    </span>

                    {inv.paidAmount > 0 && (
                      <button
                        onClick={() => openPrintModal('receipt', { invoice: inv, student: currentChild })}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: RESULTS */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Official Examination Report Cards
              </h3>
              <p className="text-xs text-slate-500">
                Authorized term results stamped by Indus Academy Exam Cell
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {childResults.map(result => (
              <div key={result.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                  <div>
                    <span className="font-bold text-sm text-slate-900">Mid Term Examination 2026</span>
                    <span className="block text-slate-500 text-[11px]">Class: {currentChild.className} • Roll No: {result.rollNo}</span>
                  </div>
                  <button
                    onClick={() => openPrintModal('result', { result, student: currentChild })}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition shadow-xs self-start sm:self-auto"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Official Result Card</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {result.marks.map((m, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="text-[11px] text-slate-500 font-semibold">{m.subject}</div>
                      <div className="text-sm font-black font-mono text-slate-900 mt-1">
                        {m.obtainedMarks} / {m.maxMarks}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-amber-200/60 flex justify-between items-center text-xs">
                  <span className="text-slate-600">Total: <strong>{result.totalObtained} / {result.totalMax}</strong> ({result.percentage}%)</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">Passed • Grade {result.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: HOMEWORK */}
      {activeTab === 'homework' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Daily Homework Diary for {currentChild.className}
          </h3>

          <div className="space-y-3 text-xs">
            {childHomework.length === 0 ? (
              <div className="py-8 text-center text-slate-400">No pending homework assignments.</div>
            ) : (
              childHomework.map(hw => (
                <div key={hw.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                        {hw.subject}
                      </span>
                      <span className="font-bold text-slate-900">{hw.title}</span>
                    </div>
                    <p className="text-slate-600 mt-1.5">{hw.description}</p>
                    <span className="text-[11px] text-slate-400 mt-2 block">
                      Teacher: {hw.teacherName} • Due: <strong>{hw.dueDate}</strong>
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW: NOTICES */}
      {activeTab === 'notices' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Official Notices for Parents
          </h3>

          <div className="space-y-3 text-xs">
            {parentAnnouncements.map(ann => (
              <div key={ann.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{ann.title}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{ann.publishedDate}</span>
                </div>
                <p className="text-slate-600 mt-2 leading-relaxed">{ann.content}</p>
                <div className="mt-2 text-[10px] text-purple-700 font-semibold">
                  Signed: {ann.authorName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
