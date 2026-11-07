import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Library, BookOpen, PlusCircle, CheckCircle, Clock, X } from 'lucide-react';

export const LibraryModule: React.FC = () => {
  const { db, issueBook, returnBook, t } = useApp();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);

  const [issueForm, setIssueForm] = useState({
    bookId: db.libraryBooks[0]?.id || '',
    studentId: db.students[0]?.id || '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.bookId || !issueForm.studentId) return;
    issueBook(issueForm.bookId, issueForm.studentId, issueForm.dueDate);
    setIsIssueModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('library')}
          </h2>
          <p className="text-xs text-slate-500">
            Academy library catalog, textbook allocations, issue registries, and overdue monitoring
          </p>
        </div>

        <button
          onClick={() => setIsIssueModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Issue Book to Student</span>
        </button>
      </div>

      {/* Book Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.libraryBooks.map(book => (
          <div key={book.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {book.category}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  {book.shelfLocation}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 mt-3 font-display">
                {book.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Author: {book.author}</p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">ISBN: {book.isbn}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Available Copies:</span>
              <span className="font-mono font-bold text-emerald-700">
                {book.availableQuantity} / {book.totalQuantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Borrowed Books Register */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800">
          Currently Borrowed Books & Due Dates ({db.bookIssues.length})
        </div>

        <div className="divide-y divide-slate-100">
          {db.bookIssues.map(issue => {
            const book = db.libraryBooks.find(b => b.id === issue.bookId);
            const student = db.students.find(s => s.id === issue.studentId);

            return (
              <div key={issue.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900">{book?.title}</div>
                  <div className="text-slate-500">
                    Borrowed by: <strong>{student?.name}</strong> ({student?.className} · Roll #{student?.rollNo})
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Issued: {issue.issueDate} · Due: {issue.dueDate}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    issue.status === 'returned' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {issue.status}
                  </span>

                  {issue.status === 'borrowed' && (
                    <button
                      onClick={() => returnBook(issue.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Return Book
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Issue Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">Issue Library Book</h3>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssue} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Book</label>
                <select
                  value={issueForm.bookId}
                  onChange={e => setIssueForm({ ...issueForm, bookId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {db.libraryBooks.filter(b => b.availableQuantity > 0).map(b => (
                    <option key={b.id} value={b.id}>{b.title} (Available: {b.availableQuantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Student</label>
                <select
                  value={issueForm.studentId}
                  onChange={e => setIssueForm({ ...issueForm, studentId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {db.students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.className} · Roll #{s.rollNo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Return Due Date</label>
                <input
                  type="date"
                  value={issueForm.dueDate}
                  onChange={e => setIssueForm({ ...issueForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
