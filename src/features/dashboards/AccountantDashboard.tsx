import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccessDeniedScreen } from '../authentication/AccessDeniedScreen';
import { 
  CreditCard, DollarSign, PlusCircle, AlertCircle, 
  Printer, TrendingUp, TrendingDown, LogOut, Download, 
  Users, CheckCircle2, Globe, Search, Plus, Filter,
  Calendar, FileText, Check
} from 'lucide-react';
import { FeeInvoice, FeePayment } from '../../types';

interface AccountantDashboardProps {
  onLogout: () => void;
}

export const AccountantDashboard: React.FC<AccountantDashboardProps> = ({ onLogout }) => {
  const { 
    currentUser, 
    db, 
    recordFeePayment, 
    generateMonthlyFees, 
    addTransaction,
    processSalaryPayment, 
    openPrintModal, 
    t, 
    lang, 
    setLang 
  } = useApp();

  // Route Guard: Deny access if role is not accountant or administrator
  if (currentUser.role !== 'accountant' && currentUser.role !== 'super_admin' && currentUser.role !== 'principal') {
    return (
      <AccessDeniedScreen
        attemptedRole="Finance & Accounts Portal"
        onGoToAuthorizedDashboard={() => {}}
        onLogout={onLogout}
      />
    );
  }

  const [activeTab, setActiveTab] = useState<'counters' | 'vouchers' | 'payments' | 'defaulters' | 'expenses' | 'payroll' | 'reports'>('counters');

  const currentMonth = '2026-11';
  const monthlyCollection = db.feePayments
    .filter(p => p.feeMonth === currentMonth)
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const pendingDues = db.feeInvoices
    .filter(inv => inv.month === currentMonth && (inv.status === 'unpaid' || inv.status === 'partial' || inv.status === 'overdue'))
    .reduce((sum, inv) => sum + inv.balance, 0);

  const monthlyExpenses = db.transactions
    .filter(tx => tx.type === 'expense' && tx.date.startsWith(currentMonth))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [voucherMonth, setVoucherMonth] = useState('2026-11');
  const [genMessage, setGenMessage] = useState('');

  // Payment Collection Modal State
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(4500);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash'>('Cash');
  const [transactionRef, setTransactionRef] = useState('');
  const [successPaymentBanner, setSuccessPaymentBanner] = useState('');

  // Expense Modal State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Electricity & Utilities',
    amount: 15000,
    description: '',
    paymentMethod: 'Cash',
  });

  const handleGenerateVouchers = () => {
    const count = generateMonthlyFees(voucherMonth);
    setGenMessage(`Successfully generated ${count} fee vouchers for month ${voucherMonth}`);
    setTimeout(() => setGenMessage(''), 4000);
  };

  const handleOpenCollectModal = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    setCollectAmount(invoice.balance);
    setIsCollectModalOpen(true);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || collectAmount <= 0) return;

    const newPayment = recordFeePayment({
      studentId: selectedInvoice.studentId,
      invoiceId: selectedInvoice.id,
      amountPaid: Number(collectAmount),
      paymentDate: new Date().toISOString().split('T')[0],
      feeMonth: selectedInvoice.month,
      paymentMethod,
      transactionRef,
      receivedBy: currentUser.name,
      remarks: 'Counter payment cleared',
    });

    setIsCollectModalOpen(false);
    setSuccessPaymentBanner(`Receipt ${newPayment.receiptNo} recorded! PKR ${collectAmount.toLocaleString()} received.`);
    setTimeout(() => setSuccessPaymentBanner(''), 4000);
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseForm.amount <= 0 || !expenseForm.description) return;

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      description: expenseForm.description,
      paymentMethod: expenseForm.paymentMethod,
      referenceId: `EXP-${Date.now().toString().slice(-4)}`,
      recordedBy: currentUser.name,
    });

    setIsExpenseModalOpen(false);
    setExpenseForm({ category: 'Electricity & Utilities', amount: 15000, description: '', paymentMethod: 'Cash' });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Accountant Dedicated Executive Top Bar */}
      <div className="bg-[#0B192C] text-white p-5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                FINANCE & TREASURY PORTAL
              </span>
              <span className="text-xs text-slate-400 font-mono">Cashier Incharge</span>
            </div>
            <h1 className="text-xl font-bold font-display text-white mt-0.5">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300">
              Fee Collections, Daily Inflows, Operational Expenditure & Faculty Payroll
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-emerald-300 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Accountant-Only Navigation Menu */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'counters', label: '1. Financial Counters & KPIs', icon: DollarSign },
          { id: 'vouchers', label: '2. Generate Fee Vouchers', icon: CreditCard },
          { id: 'payments', label: '3. Receive Payment & Receipts', icon: PlusCircle },
          { id: 'defaulters', label: '4. Fee Defaulters Ledger', icon: AlertCircle },
          { id: 'expenses', label: '5. Operational Expenses', icon: TrendingDown },
          { id: 'payroll', label: '6. Faculty Salaries', icon: Users },
          { id: 'reports', label: '7. Treasury Audit Reports', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-2 transition ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Banner Messages */}
      {successPaymentBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successPaymentBanner}</span>
        </div>
      )}

      {/* 3. Dedicated Financial Screens */}

      {/* VIEW: COUNTERS & KPIS */}
      {activeTab === 'counters' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Monthly Collection ({currentMonth})</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                PKR {monthlyCollection.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                {db.feePayments.filter(p => p.feeMonth === currentMonth).length} receipts deposited
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Outstanding Fee Arrears</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black text-rose-600 font-mono mt-2">
                PKR {pendingDues.toLocaleString()}
              </div>
              <span className="text-[11px] text-rose-500 font-semibold mt-1 block">
                Across unpaid & overdue monthly vouchers
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
                <span>Operational Expenses</span>
                <TrendingDown className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600 font-mono mt-2">
                PKR {monthlyExpenses.toLocaleString()}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Utilities, bills & maintenance
              </span>
            </div>
          </div>

          {/* Recent Collections Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Recent Cashier Inflow Ledger</span>
              </div>
              <button
                onClick={() => setActiveTab('payments')}
                className="text-emerald-700 hover:underline font-bold"
              >
                Collect New Payment →
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {db.feePayments.slice(0, 8).map(payment => {
                const student = db.students.find(s => s.id === payment.studentId);
                return (
                  <div key={payment.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{payment.receiptNo}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {student?.name} ({student?.className}) • Date: {payment.paymentDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-slate-900 text-sm">
                        PKR {payment.amountPaid.toLocaleString()}
                      </span>
                      <button
                        onClick={() => openPrintModal('receipt', { payment, student })}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Automated Monthly Fee Voucher Engine
              </h3>
              <p className="text-xs text-slate-500">
                Generate monthly tuition fee vouchers for all enrolled students with fee discounts applied
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="month"
                value={voucherMonth}
                onChange={e => setVoucherMonth(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold"
              />
              <button
                onClick={handleGenerateVouchers}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Generate Invoices for {voucherMonth}</span>
              </button>
            </div>
          </div>

          {genMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-semibold">
              {genMessage}
            </div>
          )}

          {/* Vouchers Table */}
          <div className="divide-y divide-slate-100 text-xs">
            {db.feeInvoices.map(inv => {
              const student = db.students.find(s => s.id === inv.studentId);
              return (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-slate-900">{inv.invoiceNo}</span>
                    <span className="block text-[11px] text-slate-500">
                      {student?.name} ({student?.className}) • Month: {inv.month} • Due: {inv.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-700">
                      PKR {inv.totalPayable.toLocaleString()}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {inv.status}
                    </span>

                    {inv.status !== 'paid' && (
                      <button
                        onClick={() => handleOpenCollectModal(inv)}
                        className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[11px]"
                      >
                        Receive
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Cashier Payment Collection Counter
              </h3>
              <p className="text-xs text-slate-500">
                Receive payments against student invoices and disburse official receipts
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {db.feeInvoices.filter(i => i.status !== 'paid').map(inv => {
              const student = db.students.find(s => s.id === inv.studentId);
              return (
                <div key={inv.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{student?.name} ({student?.className})</div>
                    <div className="text-[11px] text-slate-500 font-mono">Invoice: {inv.invoiceNo} • Month: {inv.month}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Pending Balance:</span>
                      <strong className="text-rose-600 font-mono text-sm">PKR {inv.balance.toLocaleString()}</strong>
                    </div>

                    <button
                      onClick={() => handleOpenCollectModal(inv)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                    >
                      Receive Payment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: DEFAULTERS */}
      {activeTab === 'defaulters' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display text-rose-700">
                Fee Defaulters & Arrears Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Students with overdue fee payments requiring administrative follow-up
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold font-mono">
              Total Defaulters: {db.feeInvoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {db.feeInvoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').map(inv => {
              const student = db.students.find(s => s.id === inv.studentId);
              return (
                <div key={inv.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{student?.name}</div>
                    <div className="text-[11px] text-slate-500">
                      Father: {student?.fatherName} • Phone: <span className="font-mono text-slate-800 font-bold">{student?.fatherPhone}</span>
                    </div>
                    <span className="text-[10px] text-rose-600 font-semibold font-mono mt-0.5 block">
                      Overdue since {inv.dueDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black font-mono text-rose-600">
                      PKR {inv.balance.toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleOpenCollectModal(inv)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      Collect Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Institutional Operational Expenses
              </h3>
              <p className="text-xs text-slate-500">
                Official expenditure entries recorded for electricity, supplies, transport, and maintenance
              </p>
            </div>

            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {db.transactions.filter(t => t.type === 'expense').map(tx => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{tx.category}</div>
                  <div className="text-[11px] text-slate-500">{tx.description} • Ref: {tx.referenceId}</div>
                  <span className="text-[10px] text-slate-400 font-mono">{tx.date} • Recorded by {tx.recordedBy}</span>
                </div>

                <span className="font-black font-mono text-rose-600 text-sm">
                  PKR {tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Faculty Salary Disbursement
              </h3>
              <p className="text-xs text-slate-500">
                Disburse monthly salaries to teachers with automatic salary slip printing
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {db.teachers.map(teacher => (
              <div key={teacher.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{teacher.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">ID: {teacher.teacherId} • Basic: PKR {teacher.basicSalary.toLocaleString()}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-black font-mono text-slate-800">
                    Net: PKR {teacher.basicSalary.toLocaleString()}
                  </span>
                  <button
                    onClick={() => {
                      processSalaryPayment({
                        teacherId: teacher.id,
                        month: '2026-11',
                        basicSalary: teacher.basicSalary,
                        advance: 0,
                        deductions: 0,
                        bonus: 0,
                        netPaid: teacher.basicSalary,
                        paymentDate: new Date().toISOString().split('T')[0],
                        status: 'paid',
                      });
                      alert(`Salary slip disbursed for ${teacher.fullName}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                  >
                    Disburse Salary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Treasury Inflow & Outflow Summary ({currentMonth})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50">
              <span className="font-bold text-emerald-900 block text-sm">Total Inflow (Collections)</span>
              <span className="text-2xl font-black font-mono text-emerald-800 mt-2 block">
                PKR {monthlyCollection.toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-700 mt-1 block">Tuition & Admission fees</span>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50">
              <span className="font-bold text-rose-900 block text-sm">Total Outflow (Expenses + Payroll)</span>
              <span className="text-2xl font-black font-mono text-rose-800 mt-2 block">
                PKR {monthlyExpenses.toLocaleString()}
              </span>
              <span className="text-[11px] text-rose-700 mt-1 block">Campus utilities and maintenance</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Collection Modal */}
      {isCollectModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              Record Fee Payment
            </h3>
            <p className="text-slate-500 mb-4">
              Invoice #{selectedInvoice.invoiceNo} • Month: {selectedInvoice.month}
            </p>

            <form onSubmit={handleConfirmPayment} className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount Received (PKR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={collectAmount}
                  onChange={e => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
                >
                  <option value="Cash">Cash Counter</option>
                  <option value="Bank Transfer">Habib Bank / Allied Bank</option>
                  <option value="EasyPaisa">EasyPaisa</option>
                  <option value="JazzCash">JazzCash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transaction / Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. EP-889123 or Bank Deposit Slip No"
                  value={transactionRef}
                  onChange={e => setTransactionRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md"
                >
                  Confirm & Disburse Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              Record Operational Expenditure
            </h3>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-semibold"
                >
                  <option value="Electricity & Utilities">Electricity & WAPDA Bills</option>
                  <option value="Office Stationery & Printing">Office Stationery & Printing</option>
                  <option value="Generator Fuel & Maintenance">Generator Fuel & Maintenance</option>
                  <option value="Building Repair & Maintenance">Building Repair & Maintenance</option>
                  <option value="Internet & Communication">Internet & PTCL</option>
                  <option value="Refreshments & Hospitality">Refreshments & Hospitality</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description / Bill Reference</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Electricity Bill paid via Allied Bank"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
