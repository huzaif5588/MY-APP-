import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  DollarSign, TrendingUp, TrendingDown, PlusCircle, 
  Download, Calendar, FileText, X 
} from 'lucide-react';

export const AccountsModule: React.FC = () => {
  const { db, addTransaction, currentUser, t } = useApp();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const [expenseForm, setExpenseForm] = useState({
    category: 'Electricity',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Cash',
    referenceId: '',
  });

  const totalIncome = db.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = db.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  const filteredTransactions = db.transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseForm.amount <= 0 || !expenseForm.description) return;

    addTransaction({
      date: expenseForm.date,
      type: 'expense',
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      description: expenseForm.description,
      paymentMethod: expenseForm.paymentMethod,
      referenceId: expenseForm.referenceId || `EXP-${Date.now().toString().slice(-4)}`,
      recordedBy: currentUser.name,
    });

    setIsExpenseModalOpen(false);
  };

  const exportAccountsCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (PKR)', 'Payment Method', 'Reference', 'Recorded By'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type.toUpperCase(),
      `"${t.category}"`,
      `"${t.description}"`,
      t.amount,
      t.paymentMethod,
      t.referenceId || '',
      `"${t.recordedBy}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `INDUS_ACADEMY_LEDGER_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('accounts')}
          </h2>
          <p className="text-xs text-slate-500">
            Institutional ledger, revenue recoveries, faculty payroll disbursements, and operational expenditure
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAccountsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Ledger CSV</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Revenue Inflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">
            PKR {totalIncome.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Tuition, admissions, transport</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Operational Expenses</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono mt-2">
            PKR {totalExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Faculty payroll, utilities, transport fuel</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Net Academy Cash Flow</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className={`text-2xl font-black font-mono mt-2 ${netBalance >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            PKR {netBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Calculated from recorded transactions</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterType === 'all' ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Entries ({db.transactions.length})
        </button>
        <button
          onClick={() => setFilterType('income')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterType === 'income' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Revenue Inflow
        </button>
        <button
          onClick={() => setFilterType('expense')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
            filterType === 'expense' ? 'bg-rose-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Expenditure
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B192C] text-white">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Method / Ref</th>
                <th className="p-3 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-mono text-slate-600">{tx.date}</td>
                  
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {tx.type}
                    </span>
                  </td>

                  <td className="p-3 font-bold text-slate-800">{tx.category}</td>

                  <td className="p-3 text-slate-600">{tx.description}</td>

                  <td className="p-3 text-[11px] text-slate-500 font-mono">
                    {tx.paymentMethod} {tx.referenceId && `· ${tx.referenceId}`}
                  </td>

                  <td className={`p-3 text-right font-mono font-black ${
                    tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {tx.type === 'income' ? '+' : '-'} PKR {tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">Record Operational Expense</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Category</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Electricity">Electricity Bill (FESCO)</option>
                  <option value="Water">Water & Sanitation</option>
                  <option value="Rent">Campus Building Rent</option>
                  <option value="Stationery">Stationery & Examination Printing</option>
                  <option value="Maintenance">Building & Furniture Maintenance</option>
                  <option value="Transport">Transport Diesel & Van Repairs</option>
                  <option value="Science Lab">Science Lab Chemicals & Glassware</option>
                  <option value="Sports">Sports Equipment</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (PKR) *</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. November FESCO bill receipt #..."
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={e => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow"
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
