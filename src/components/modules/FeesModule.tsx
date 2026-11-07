import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FeePayment, FeeInvoice } from '../../types';
import { 
  CreditCard, DollarSign, PlusCircle, Printer, 
  MessageSquare, AlertCircle, CheckCircle, Download,
  Search, Filter, X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const FeesModule: React.FC = () => {
  const { db, recordFeePayment, generateMonthlyFees, openPrintModal, currentUser, t } = useApp();

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'defaulters'>('invoices');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    studentId: '',
    invoiceId: '',
    amountPaid: 4500,
    paymentDate: new Date().toISOString().split('T')[0],
    feeMonth: '2026-11',
    paymentMethod: 'Cash' as 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash',
    transactionRef: '',
    remarks: 'Fee payment cleared',
  });

  const [generationMsg, setGenerationMsg] = useState<string>('');

  const handleGenerateFees = () => {
    const count = generateMonthlyFees(selectedMonth);
    setGenerationMsg(`Generated ${count} monthly invoices for ${selectedMonth}`);
    setTimeout(() => setGenerationMsg(''), 4000);
  };

  const handleOpenPayment = (invoice: FeeInvoice) => {
    setSelectedInvoice(invoice);
    const student = db.students.find(s => s.id === invoice.studentId);
    setPaymentForm({
      studentId: invoice.studentId,
      invoiceId: invoice.id,
      amountPaid: invoice.balance,
      paymentDate: new Date().toISOString().split('T')[0],
      feeMonth: invoice.month,
      paymentMethod: 'Cash',
      transactionRef: '',
      remarks: `Tuition fee payment for ${student?.name}`,
    });
    setIsPaymentModalOpen(true);
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentForm.amountPaid <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const newPayment = recordFeePayment({
      invoiceId: paymentForm.invoiceId || undefined,
      studentId: paymentForm.studentId,
      amountPaid: Number(paymentForm.amountPaid),
      paymentDate: paymentForm.paymentDate,
      feeMonth: paymentForm.feeMonth,
      paymentMethod: paymentForm.paymentMethod,
      transactionRef: paymentForm.transactionRef,
      receivedBy: currentUser.name,
      remarks: paymentForm.remarks,
    });

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });

    setIsPaymentModalOpen(false);

    // Open receipt modal
    const student = db.students.find(s => s.id === paymentForm.studentId);
    openPrintModal('receipt', {
      ...newPayment,
      student,
    });
  };

  const filteredInvoices = db.feeInvoices.filter(inv => {
    const student = db.students.find(s => s.id === inv.studentId);
    const term = searchTerm.toLowerCase().trim();
    const matchesMonth = !selectedMonth || inv.month === selectedMonth;
    const matchesSearch = !term ||
      inv.invoiceNo.toLowerCase().includes(term) ||
      (student && (student.name.toLowerCase().includes(term) || student.rollNo.includes(term) || student.regNo.toLowerCase().includes(term)));
    return matchesMonth && matchesSearch;
  });

  const defaulters = db.feeInvoices.filter(inv => inv.status === 'overdue' || (inv.status === 'partial' && inv.balance > 0));

  const totalCollectedMonth = db.feePayments
    .filter(p => p.feeMonth === selectedMonth)
    .reduce((sum, p) => sum + p.amountPaid, 0);

  const totalOutstandingMonth = db.feeInvoices
    .filter(inv => inv.month === selectedMonth)
    .reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Generation Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('fees')}
          </h2>
          <p className="text-xs text-slate-500">
            Automated monthly fee generation, receipts, ledger, and defaulter tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono"
          />

          <button
            onClick={handleGenerateFees}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t('generateMonthlyFees')}</span>
          </button>
        </div>
      </div>

      {generationMsg && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs font-semibold">
          {generationMsg}
        </div>
      )}

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Total Recovered ({selectedMonth})</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            PKR {totalCollectedMonth.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Pending Invoices / Arrears</span>
          <div className="text-2xl font-black text-rose-600 font-mono mt-2">
            PKR {totalOutstandingMonth.toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold uppercase">Fee Defaulters Count</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-2">
            {defaulters.length} Students
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'invoices' ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Fee Invoices ({filteredInvoices.length})
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'payments' ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Payment Transactions ({db.feePayments.length})
        </button>

        <button
          onClick={() => setActiveTab('defaulters')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'defaulters' ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fee Defaulters List ({defaulters.length})
        </button>
      </div>

      {/* 1. INVOICES TABLE */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B192C] text-white">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Month</th>
                  <th className="p-3 text-right">Payable</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => {
                  const student = db.students.find(s => s.id === inv.studentId);

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-semibold text-slate-800">
                        {inv.invoiceNo}
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-slate-900">{student?.name}</div>
                        <div className="text-[11px] text-slate-500">{student?.className} (Roll: {student?.rollNo})</div>
                      </td>

                      <td className="p-3 font-mono text-slate-600">{inv.month}</td>

                      <td className="p-3 text-right font-mono font-semibold text-slate-900">
                        PKR {inv.totalPayable.toLocaleString()}
                      </td>

                      <td className="p-3 text-right font-mono font-semibold text-emerald-700">
                        PKR {inv.paidAmount.toLocaleString()}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-rose-600">
                        PKR {inv.balance.toLocaleString()}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          inv.status === 'partial' ? 'bg-amber-50 text-amber-700' :
                          'bg-rose-50 text-rose-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {inv.balance > 0 ? (
                          <button
                            onClick={() => handleOpenPayment(inv)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow active:scale-95"
                          >
                            Receive Fee
                          </button>
                        ) : (
                          <span className="text-slate-400 font-semibold text-[11px]">Cleared</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PAYMENT TRANSACTIONS LEDGER */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B192C] text-white">
                <tr>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3 text-right">Amount Paid</th>
                  <th className="p-3">Received By</th>
                  <th className="p-3 text-right">Print Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.feePayments.map(pay => {
                  const student = db.students.find(s => s.id === pay.studentId);

                  return (
                    <tr key={pay.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono font-bold text-amber-600">{pay.receiptNo}</td>
                      <td className="p-3 font-bold text-slate-900">{student?.name || 'N/A'}</td>
                      <td className="p-3 font-mono text-slate-600">{pay.paymentDate}</td>
                      <td className="p-3 font-medium text-slate-700">{pay.paymentMethod}</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-700">
                        PKR {pay.amountPaid.toLocaleString()}
                      </td>
                      <td className="p-3 text-slate-600">{pay.receivedBy}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => openPrintModal('receipt', { ...pay, student })}
                          className="flex items-center gap-1 ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FEE DEFAULTERS WITH WHATSAPP LINK */}
      {activeTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>
                Students with overdue fees. Click <strong>Send WhatsApp Reminder</strong> to open pre-filled official academy notice directly.
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
            >
              Print Defaulter List
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {defaulters.map(inv => {
              const student = db.students.find(s => s.id === inv.studentId);
              if (!student) return null;

              const cleanPhone = student.whatsappNo.replace(/[^0-9]/g, '');
              const message = `Assalam-o-Alaikum Respected Parent of ${student.name} (${student.className}), This is a polite fee notice from INDUS ACADEMY KALABAGH. Fee balance of PKR ${inv.balance.toLocaleString()} for ${inv.month} is pending. Kindly clear the dues before the deadline. Principal: Sir Noman.`;

              return (
                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50 transition">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{student.name} (Roll #{student.rollNo})</div>
                    <div className="text-slate-500">Father: {student.fatherName} · Phone: {student.fatherPhone}</div>
                    <div className="text-slate-400 font-mono text-[11px] mt-0.5">Invoice: {inv.invoiceNo} · Month: {inv.month}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">Outstanding Balance</div>
                      <div className="font-black text-rose-600 font-mono text-base">
                        PKR {inv.balance.toLocaleString()}
                      </div>
                    </div>

                    <a
                      href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Alert</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Entry Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">Record Fee Payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 block">Student:</span>
                <strong className="text-slate-900 text-sm">
                  {db.students.find(s => s.id === selectedInvoice.studentId)?.name}
                </strong>
                <span className="text-slate-500 block mt-1">Invoice: {selectedInvoice.invoiceNo}</span>
                <span className="text-rose-600 font-bold font-mono text-sm block mt-1">
                  Remaining Balance: PKR {selectedInvoice.balance.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount to Pay (PKR) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amountPaid}
                  onChange={e => setPaymentForm({ ...paymentForm, amountPaid: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Cash">Cash (نقد)</option>
                  <option value="Bank Transfer">Bank Transfer (HBL / MCB)</option>
                  <option value="EasyPaisa">EasyPaisa (آن لائن)</option>
                  <option value="JazzCash">JazzCash (آن لائن)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Transaction Ref / Slip #</label>
                <input
                  type="text"
                  placeholder="e.g. EP-99881122 or HBL-Deposit"
                  value={paymentForm.transactionRef}
                  onChange={e => setPaymentForm({ ...paymentForm, transactionRef: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Record & Print Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
