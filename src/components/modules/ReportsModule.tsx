import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BarChart3, Download, Printer, Filter, Calendar, Users, DollarSign } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { db, t } = useApp();
  const [reportType, setReportType] = useState<'students' | 'fees' | 'attendance' | 'results' | 'financial'>('students');
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const exportCurrentReport = () => {
    let filename = `INDUS_ACADEMY_REPORT_${reportType.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`;
    let csvData = '';

    if (reportType === 'students') {
      const headers = ['Reg No', 'Roll No', 'Name', 'Father Name', 'Class', 'Monthly Fee', 'Contact', 'Status'];
      const rows = db.students.map(s => [s.regNo, s.rollNo, `"${s.name}"`, `"${s.fatherName}"`, `"${s.className}"`, s.monthlyTuitionFee, s.fatherPhone, s.status]);
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (reportType === 'fees') {
      const headers = ['Invoice No', 'Student', 'Month', 'Total Payable', 'Paid Amount', 'Balance', 'Status'];
      const rows = db.feeInvoices.map(inv => {
        const s = db.students.find(stu => stu.id === inv.studentId);
        return [inv.invoiceNo, `"${s?.name}"`, inv.month, inv.totalPayable, inv.paidAmount, inv.balance, inv.status];
      });
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (reportType === 'results') {
      const headers = ['Exam', 'Roll No', 'Student', 'Class', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade', 'Rank'];
      const rows = db.examResults.map(res => {
        const s = db.students.find(stu => stu.id === res.studentId);
        const ex = db.examinations.find(e => e.id === res.examId);
        return [`"${ex?.name}"`, res.rollNo, `"${s?.name}"`, `"${s?.className}"`, res.totalObtained, res.totalMax, `${res.percentage}%`, res.grade, res.position || ''];
      });
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Method'];
      const rows = db.transactions.map(tx => [tx.date, tx.type, `"${tx.category}"`, `"${tx.description}"`, tx.amount, tx.paymentMethod]);
      csvData = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('reports')}
          </h2>
          <p className="text-xs text-slate-500">
            Institutional business intelligence, audit spreadsheets, and export archives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={exportCurrentReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Report Categories Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'students', label: 'Enrollment Directory', count: `${db.students.length} Students` },
          { id: 'fees', label: 'Fee Collection & Dues', count: `${db.feeInvoices.length} Invoices` },
          { id: 'results', label: 'Exam Merit List', count: `${db.examResults.length} Scores` },
          { id: 'financial', label: 'Financial Income & Expense', count: `${db.transactions.length} Records` },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setReportType(cat.id as any)}
            className={`p-4 rounded-xl border text-left transition ${
              reportType === cat.id
                ? 'border-amber-500 bg-amber-50/30 text-slate-950 font-bold shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
            }`}
          >
            <div className="text-xs font-bold font-display">{cat.label}</div>
            <div className="text-[11px] text-slate-400 mt-1 font-mono">{cat.count}</div>
          </button>
        ))}
      </div>

      {/* Dynamic Report View */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between text-xs">
          <span className="font-bold tracking-wide uppercase font-display">
            Active Report View: {reportType.toUpperCase()}
          </span>
          <span className="font-mono text-amber-300">Indus Academy Kalabagh Official Records</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'students' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3">Reg No</th>
                  <th className="p-3">Roll</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Father Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3 text-right">Tuition (PKR)</th>
                  <th className="p-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{s.regNo}</td>
                    <td className="p-3 font-mono">{s.rollNo}</td>
                    <td className="p-3 font-bold text-slate-900">{s.name}</td>
                    <td className="p-3">{s.fatherName}</td>
                    <td className="p-3 font-medium">{s.className}</td>
                    <td className="p-3 text-right font-mono font-semibold">PKR {s.monthlyTuitionFee}</td>
                    <td className="p-3 font-mono text-slate-600">{s.fatherPhone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'fees' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Month</th>
                  <th className="p-3 text-right">Payable</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.feeInvoices.map(inv => {
                  const s = db.students.find(stu => stu.id === inv.studentId);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-semibold">{inv.invoiceNo}</td>
                      <td className="p-3 font-bold text-slate-900">{s?.name} ({s?.className})</td>
                      <td className="p-3 font-mono">{inv.month}</td>
                      <td className="p-3 text-right font-mono font-semibold">PKR {inv.totalPayable.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono text-emerald-700 font-semibold">PKR {inv.paidAmount.toLocaleString()}</td>
                      <td className="p-3 text-right font-mono font-bold text-rose-600">PKR {inv.balance.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'results' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Roll</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3 text-center">Marks</th>
                  <th className="p-3 text-center">% Score</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.examResults.map(res => {
                  const s = db.students.find(stu => stu.id === res.studentId);
                  const ex = db.examinations.find(e => e.id === res.examId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-700">{ex?.name}</td>
                      <td className="p-3 font-mono font-bold">{res.rollNo}</td>
                      <td className="p-3 font-bold text-slate-900">{s?.name}</td>
                      <td className="p-3">{s?.className}</td>
                      <td className="p-3 text-center font-mono font-semibold">{res.totalObtained} / {res.totalMax}</td>
                      <td className="p-3 text-center font-mono font-bold">{res.percentage}%</td>
                      <td className="p-3 text-center font-black text-amber-600">{res.grade}</td>
                      <td className="p-3 text-center font-bold text-amber-700">{res.position ? `#${res.position}` : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {reportType === 'financial' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Ref</th>
                  <th className="p-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-600">{tx.date}</td>
                    <td className="p-3 font-bold uppercase">{tx.type}</td>
                    <td className="p-3 font-semibold text-slate-800">{tx.category}</td>
                    <td className="p-3 text-slate-600">{tx.description}</td>
                    <td className="p-3 font-mono text-slate-400">{tx.referenceId || '-'}</td>
                    <td className={`p-3 text-right font-mono font-black ${
                      tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      PKR {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};
