import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, Users, PlusCircle, Check } from 'lucide-react';

export const ClassesModule: React.FC = () => {
  const { db, t } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 font-display">
          {t('classes')} ({db.classes.length})
        </h2>
        <p className="text-xs text-slate-500">
          Academic class tiers, sections, class teacher assignments, and standard tuition structures
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {db.classes.map(cls => {
          const teacher = db.teachers.find(t => t.id === cls.classTeacherId);
          const studentCount = db.students.filter(s => s.classId === cls.id && s.status === 'active').length;

          return (
            <div key={cls.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 font-display">{cls.name}</h3>
                    <p className="text-xs text-slate-500 font-urdu">{cls.nameUrdu}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    PKR {cls.monthlyFee}/mo
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sections:</span>
                    <span className="font-semibold text-slate-800">{cls.sections.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enrolled Students:</span>
                    <span className="font-bold font-mono text-slate-900">{studentCount} Students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Incharge Teacher:</span>
                    <span className="font-medium text-slate-800">{teacher?.fullName || 'Sir Noman'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Session: {db.settings.currentSession}</span>
                <span className="text-emerald-700 font-semibold">Active Curriculum</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
