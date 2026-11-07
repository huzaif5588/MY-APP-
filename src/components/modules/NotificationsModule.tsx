import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, PlusCircle, Pin, Calendar, ShieldCheck, X } from 'lucide-react';

export const NotificationsModule: React.FC = () => {
  const { db, addAnnouncement, currentUser, t, lang } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    titleUrdu: '',
    content: '',
    contentUrdu: '',
    category: 'General' as const,
    targetRole: 'all' as const,
    publishedDate: new Date().toISOString().split('T')[0],
    authorName: currentUser.name,
    isPinned: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;
    addAnnouncement(formData);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('notifications')}
          </h2>
          <p className="text-xs text-slate-500">
            Official academy circulars, event announcements, examination schedules, and urgent notices
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Official Notice</span>
        </button>
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {db.announcements.map(ann => (
          <div 
            key={ann.id}
            className={`bg-white rounded-xl border p-5 shadow-xs transition hover:shadow-md ${
              ann.isPinned ? 'border-amber-400/80 bg-gradient-to-r from-amber-50/15 via-white to-white' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  ann.category === 'Fee Alert' ? 'bg-rose-50 text-rose-700' :
                  ann.category === 'Academic' ? 'bg-blue-50 text-blue-700' :
                  ann.category === 'Holiday' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-amber-50 text-amber-700'
                }`}>
                  {ann.category}
                </span>

                {ann.isPinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                    <Pin className="w-3 h-3 fill-amber-500" />
                    <span>Pinned Announcement</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                {ann.publishedDate}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-base font-bold text-slate-900 font-display">
                {lang === 'ur' && ann.titleUrdu ? ann.titleUrdu : ann.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {lang === 'ur' && ann.contentUrdu ? ann.contentUrdu : ann.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Authority: <strong className="text-slate-700">{ann.authorName}</strong></span>
              <span className="uppercase font-mono">Audience: {ann.targetRole}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">Create Official Academy Circular</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notice Title (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid Term Parent Teacher Meeting"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Notice Title (Urdu - اردو عنوان)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: والدین اساتذہ میٹنگ"
                  value={formData.titleUrdu}
                  onChange={e => setFormData({ ...formData, titleUrdu: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-urdu"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Category & Audience</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="General">General Notice</option>
                    <option value="Academic">Academic / Exams</option>
                    <option value="Fee Alert">Fee Reminder</option>
                    <option value="Holiday">Official Holiday</option>
                  </select>

                  <select
                    value={formData.targetRole}
                    onChange={e => setFormData({ ...formData, targetRole: e.target.value as any })}
                    className="px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="all">Broadcast to All</option>
                    <option value="parents">Parents Only</option>
                    <option value="teachers">Faculty Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Content Details (English) *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Official announcement description..."
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Content Details (Urdu - اردو متن)</label>
                <textarea
                  rows={3}
                  dir="rtl"
                  placeholder="اردو میں تفصیلات تحریر کریں..."
                  value={formData.contentUrdu}
                  onChange={e => setFormData({ ...formData, contentUrdu: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-urdu"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pin"
                  checked={formData.isPinned}
                  onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="pin" className="text-slate-700 font-semibold">
                  Pin to Top of Dashboard Feed
                </label>
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
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
