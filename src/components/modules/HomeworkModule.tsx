import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, PlusCircle, Calendar, BookOpen, X, Check } from 'lucide-react';

export const HomeworkModule: React.FC = () => {
  const { db, addHomework, currentUser, t } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');

  const [formData, setFormData] = useState({
    classId: 'c-10',
    section: 'A',
    subject: 'Physics',
    teacherId: 't-1',
    teacherName: 'Sir Noman Khan',
    title: '',
    description: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active' as const,
  });

  const filtered = db.homework.filter(h => selectedClassId === 'all' || h.classId === selectedClassId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    addHomework(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('homework')}
          </h2>
          <p className="text-xs text-slate-500">
            Daily academic homework diary, study assignments, and submission schedules
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Assign New Homework</span>
        </button>
      </div>

      {/* Class Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3 text-xs">
        <span className="font-semibold text-slate-600">Filter by Class:</span>
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
        >
          <option value="all">All Classes</option>
          {db.classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Homework Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(hw => {
          const cls = db.classes.find(c => c.id === hw.classId);

          return (
            <div key={hw.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {cls?.name || hw.classId}
                    </span>
                    <span className="text-xs font-semibold text-slate-600">
                      {hw.subject}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    Due: <strong className="text-slate-800">{hw.dueDate}</strong>
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2">
                  {hw.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {hw.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Teacher: <strong className="text-slate-700">{hw.teacherName}</strong></span>
                <span>Assigned: {hw.assignedDate}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">Assign Class Homework</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Select Class</label>
                <select
                  value={formData.classId}
                  onChange={e => setFormData({ ...formData, classId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                >
                  {db.classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics / Physics"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Homework Topic / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 5 Exercise Questions"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Detailed Instructions</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specific tasks for student to complete in notebook..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Submission Deadline</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Assign to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
