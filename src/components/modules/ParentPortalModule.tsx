import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  HeartHandshake, Award, CalendarCheck, CreditCard, 
  FileText, Download, Printer, Shield, CheckCircle2,
  AlertCircle, BookOpen, Clock 
} from 'lucide-react';

export const ParentPortalModule: React.FC = () => {
  const { db, currentUser, openPrintModal, t, lang } = useApp();

  // If logged in as parent, show linked children, otherwise default to first student for preview
  const parentLinkedIds = currentUser.linkedStudentIds && currentUser.linkedStudentIds.length > 0 
    ? currentUser.linkedStudentIds 
    : [db.students[0].id, db.students[1].id];

  const [selectedChildId, setSelectedChildId] = useState<string>(parentLinkedIds[0] || db.students[0].id);

  const currentChild = db.students.find(s => s.id === selectedChildId) || db.students[0];

  // Child-specific attendance
  const childAttendance = db.attendanceRecords.filter(r => r.studentId === currentChild.id);
  const totalDays = childAttendance.length || 10;
  const presentDays = childAttendance.filter(r => r.status === 'present').length || 9;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);

  // Child-specific fees
  const childInvoices = db.feeInvoices.filter(inv => inv.studentId === currentChild.id);
  const childPayments = db.feePayments.filter(p => p.studentId === currentChild.id);
  const pendingDues = childInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  // Child-specific results
  const childResults = db.examResults.filter(r => r.studentId === currentChild.id);

  // Child-specific homework
  const childHomework = db.homework.filter(h => h.classId === currentChild.classId);

  return (
    <div className="space-y-6">
      
      {/* Parent Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white p-6 shadow-xl border border-amber-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Shield className="w-4 h-4" />
              <span>{t('parentPortalTitle')} • Official Guardian Access</span>
            </div>
            <h1 className="text-2xl font-black font-display">
              {currentUser.role === 'parent' ? currentUser.name : 'Parent Portal Simulation'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Real-time daily attendance, fee ledger receipts, homework diary, and term result cards.
            </p>
          </div>

          {/* Child Switcher Dropdown */}
          <div className="bg-slate-900/90 border border-slate-700 p-2 rounded-xl flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-semibold">{t('selectChild')}:</span>
            <select
              value={selectedChildId}
              onChange={e => setSelectedChildId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-600 bg-slate-800 text-amber-300 font-bold focus:outline-none"
            >
              {parentLinkedIds.map(id => {
                const s = db.students.find(stu => stu.id === id);
                return (
                  <option key={id} value={id}>
                    {s?.name} ({s?.className})
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Child Profile Snapshot Card */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shadow">
            {currentChild.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 font-display">
              {currentChild.name}
            </h3>
            <div className="text-xs text-slate-500 space-x-2">
              <span>{currentChild.className} (Sec {currentChild.section})</span>
              <span>·</span>
              <span>Roll #{currentChild.rollNo}</span>
              <span>·</span>
              <span className="font-mono">{currentChild.regNo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openPrintModal('id_card', { student: currentChild })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>View ID Card</span>
          </button>
        </div>
      </div>

      {/* Grid: Attendance & Fee Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attendance Summary */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900 font-display">Attendance Record</h3>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                {attendanceRate}% Regularity
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Daily classroom attendance logged by class teacher.
            </p>

            <div className="space-y-2">
              {childAttendance.slice(0, 4).map(att => (
                <div key={att.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-700">{att.date}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    att.status === 'present' ? 'bg-emerald-100 text-emerald-800' :
                    att.status === 'absent' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {att.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t text-xs text-slate-500">
            Consecutive Absences: <strong className="text-slate-800">0 Days</strong>
          </div>
        </div>

        {/* Fee Dues & Receipts */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900 font-display">Fee Ledger & Dues</h3>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                pendingDues > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {pendingDues > 0 ? `PKR ${pendingDues.toLocaleString()} Pending` : 'All Cleared'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Monthly tuition and verified payment receipts.
            </p>

            <div className="space-y-2">
              {childPayments.map(pay => (
                <div key={pay.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 font-mono">{pay.receiptNo}</div>
                    <div className="text-[11px] text-slate-500">{pay.paymentDate} · {pay.paymentMethod}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-700">PKR {pay.amountPaid.toLocaleString()}</span>
                    <button
                      onClick={() => openPrintModal('receipt', { ...pay, student: currentChild })}
                      className="p-1 text-slate-500 hover:text-amber-600"
                      title="Download Official Receipt"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t flex justify-between text-xs">
            <span className="text-slate-500">Current Monthly Tuition:</span>
            <span className="font-mono font-bold text-slate-900">PKR {currentChild.monthlyTuitionFee.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Examination Performance & Report Cards */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900 font-display">
              Examination Result Cards
            </h3>
          </div>
        </div>

        {childResults.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No published examination results available for this term yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {childResults.map(res => {
              const exam = db.examinations.find(e => e.id === res.examId);

              return (
                <div key={res.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{exam?.name || 'Term Examination'}</div>
                    <div className="text-slate-500">
                      Score: <strong className="font-mono text-slate-800">{res.totalObtained} / {res.totalMax}</strong> ({res.percentage}%)
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded">
                      Grade: {res.grade}
                    </span>
                    <button
                      onClick={() => openPrintModal('result', {
                        ...res,
                        examName: exam?.name,
                        studentName: currentChild.name,
                        className: currentChild.className,
                        student: currentChild,
                      })}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0B192C] text-white font-bold text-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Download Report Card</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Homework & Diary Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b pb-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900 font-display">
            Daily Homework & Class Diary
          </h3>
        </div>

        {childHomework.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No pending homework assignments for {currentChild.className} today.
          </div>
        ) : (
          <div className="space-y-3">
            {childHomework.map(hw => (
              <div key={hw.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">{hw.subject}: {hw.title}</span>
                  <span className="text-[11px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Due: {hw.dueDate}
                  </span>
                </div>
                <p className="text-slate-600 mt-1">{hw.description}</p>
                <div className="mt-2 text-[10px] text-slate-400">Assigned by: {hw.teacherName}</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
