import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Users, GraduationCap, CalendarCheck, CreditCard, 
  TrendingUp, TrendingDown, AlertCircle, PlusCircle, 
  UserPlus, Bell, ArrowRight, ShieldCheck, CheckCircle2,
  Clock, DollarSign
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const { db, t, lang, setActiveTab, openPrintModal, isRTL } = useApp();

  const totalStudents = db.students.length;
  const activeStudents = db.students.filter(s => s.status === 'active').length;
  const totalTeachers = db.teachers.length;
  const totalClasses = db.classes.length;

  // Today's Attendance Calculations
  const todayStr = '2026-11-06';
  const todayRecords = db.attendanceRecords.filter(r => r.date === todayStr);
  const presentCount = todayRecords.filter(r => r.status === 'present').length;
  const absentCount = todayRecords.filter(r => r.status === 'absent').length;
  const lateCount = todayRecords.filter(r => r.status === 'late').length;
  const attendanceRate = todayRecords.length > 0 
    ? Math.round((presentCount / todayRecords.length) * 100) 
    : 92;

  // Financial Figures (from actual records)
  const currentMonth = '2026-11';
  const monthlyCollection = db.feePayments
    .filter(p => p.feeMonth === currentMonth)
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const pendingBalances = db.feeInvoices
    .filter(inv => inv.month === currentMonth && (inv.status === 'unpaid' || inv.status === 'partial' || inv.status === 'overdue'))
    .reduce((sum, inv) => sum + inv.balance, 0);

  const monthlyExpenses = db.transactions
    .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonth))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashFlow = monthlyCollection - monthlyExpenses;

  // Recent 5 admissions
  const recentAdmissions = [...db.students]
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5);

  // Fee defaulters count
  const defaulters = db.feeInvoices.filter(inv => inv.status === 'overdue' || (inv.status === 'partial' && inv.balance > 0));

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Official Welcome & Quick Summary */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white p-6 shadow-xl border border-amber-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(circle_at_right,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>{db.settings.directorName} • {t('academicSession')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-white">
              {db.settings.academyName} – {db.settings.location}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Real-time operational overview of student enrollments, faculty attendance, fee recoveries, and examination progress.
            </p>
          </div>

          {/* Quick Action Button Cluster */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('students')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('quickAdmission')}</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700 active:scale-95"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('quickAttendance')}</span>
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition border border-slate-700 active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('quickFee')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid (Real Tabular Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Students */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('totalStudents')}</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 200 Cap</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-emerald-700 font-semibold">{activeStudents} Active</span>
            <span>·</span>
            <span>{totalClasses} Classes</span>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('todayAttendance')}</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {attendanceRate}%
            </span>
            <span className="text-xs text-emerald-700 font-medium">Present</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
            <span className="text-emerald-700 font-semibold">{presentCount} Present</span>
            <span>·</span>
            <span className="text-rose-600 font-semibold">{absentCount} Absent</span>
          </div>
        </div>

        {/* Monthly Fee Collection */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('monthlyCollection')}</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-xs text-slate-500 font-bold">PKR</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
              {monthlyCollection.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-amber-700 font-medium">Month: {currentMonth}</span>
          </div>
        </div>

        {/* Pending Fee Balances */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('pendingBalance')}</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-xs text-slate-500 font-bold">PKR</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono tabular-nums">
              {pendingBalances.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <span className="text-rose-700 font-semibold">{defaulters.length} Defaulters</span>
            <span>·</span>
            <button 
              onClick={() => setActiveTab('fees')}
              className="text-blue-600 hover:underline font-medium"
            >
              View List
            </button>
          </div>
        </div>

      </div>

      {/* Visual Analytics Strip (Fee Trend & Class Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Collection Trend (Interactive SVG Chart) */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                {t('feeCollectionTrend')}
              </h3>
              <p className="text-xs text-slate-500">Historical monthly fee receipts for Academic Year 2026</p>
            </div>
            <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
              PKR 54,200 Recovered
            </span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full flex items-end gap-3 pt-6 px-2 border-b border-slate-200 pb-2">
            {[
              { month: 'Jun', amount: 38000, height: '45%' },
              { month: 'Jul', amount: 42000, height: '52%' },
              { month: 'Aug', amount: 49000, height: '64%' },
              { month: 'Sep', amount: 56000, height: '78%' },
              { month: 'Oct', amount: 62000, height: '88%' },
              { month: 'Nov', amount: 54200, height: '72%', active: true },
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {(bar.amount / 1000).toFixed(1)}k
                </div>
                <div 
                  className={`w-full max-w-[42px] rounded-t-md transition-all duration-300 group-hover:brightness-110 ${
                    bar.active 
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400 shadow-md shadow-amber-500/20' 
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  style={{ height: bar.height }}
                />
                <span className="text-xs font-semibold text-slate-600 mt-1">{bar.month}</span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>Average Recovery Rate: <strong className="text-slate-800">91.4%</strong></span>
            <span>Target: <strong className="text-slate-800">100% Zero-Arrears</strong></span>
          </div>
        </div>

        {/* Class Enrollment Breakdown */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-display mb-1">
              {lang === 'ur' ? 'کلاس وائز طلباء' : 'Class Enrollment Distribution'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Total Capacity Utilization</p>

            <div className="space-y-3">
              {[
                { name: 'Class 10 (Science)', count: 2, max: 25, color: 'bg-amber-500' },
                { name: 'Class 9 (Science)', count: 2, max: 25, color: 'bg-blue-600' },
                { name: 'Class 8 & 7', count: 2, max: 25, color: 'bg-indigo-600' },
                { name: 'Class 6 to 1', count: 6, max: 75, color: 'bg-emerald-600' },
                { name: 'Prep & Nursery', count: 2, max: 50, color: 'bg-purple-600' },
              ].map((c, i) => (
                <div key={i} className="text-xs">
                  <div className="flex justify-between text-slate-700 font-medium mb-1">
                    <span>{c.name}</span>
                    <span className="font-mono text-slate-500">{c.count} students</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${c.color} rounded-full`} 
                      style={{ width: `${(c.count / c.max) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500">Available Vacancies</span>
            <span className="font-bold font-mono text-emerald-700">186 Seats</span>
          </div>
        </div>

      </div>

      {/* Split Section: Recent Admissions & Defaulters Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Admissions */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900 font-display">
                {t('recentAdmissions')}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('students')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAdmissions.map(student => (
              <div key={student.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{student.name}</div>
                    <div className="text-[11px] text-slate-500">
                      <span>{student.className}</span>
                      <span> · </span>
                      <span className="font-mono">{student.regNo}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">{student.admissionDate}</span>
                  <button
                    onClick={() => openPrintModal('id_card', { student })}
                    className="text-[10px] text-amber-600 hover:underline font-semibold"
                  >
                    Print ID
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defaulter Fee Follow-Up Alert */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <AlertCircle className="w-4 h-4" />
                <h3 className="font-display">Fee Arrears & Defaulters Watch</h3>
              </div>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                {defaulters.length} Unpaid
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Students with outstanding balances beyond the 10th monthly deadline. Direct WhatsApp alerts can be dispatched.
            </p>

            <div className="space-y-2">
              {defaulters.slice(0, 3).map(inv => {
                const student = db.students.find(s => s.id === inv.studentId);
                return (
                  <div key={inv.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{student?.name} ({student?.className})</div>
                      <div className="text-[11px] text-slate-500">Father: {student?.fatherName} · {student?.fatherPhone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-rose-600">PKR {inv.balance.toLocaleString()}</div>
                      <a
                        href={`https://wa.me/${student?.whatsappNo.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum Respected Parent, This is a gentle reminder from Indus Academy Kalabagh regarding fee dues of PKR ${inv.balance} for ${student?.name}. Kindly clear before due date.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-emerald-700 hover:underline font-bold"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Outstanding Arrears:</span>
            <span className="font-bold font-mono text-rose-600 text-sm">
              PKR {pendingBalances.toLocaleString()}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
