import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Printer, AlertTriangle, CheckCircle } from 'lucide-react';

export const TimetableModule: React.FC = () => {
  const { db, t } = useApp();
  const [selectedClassId, setSelectedClassId] = useState<string>('c-10');
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  const selectedClass = db.classes.find(c => c.id === selectedClassId);
  const slots = db.timetable.filter(slot => slot.classId === selectedClassId && slot.day === selectedDay);

  // Check for any schedule conflicts across classes for the same period and day
  const conflicts: string[] = [];
  const teacherPeriodMap: Record<string, string> = {};

  db.timetable.filter(s => s.day === selectedDay && !s.isBreak && s.teacherId).forEach(s => {
    const key = `${s.teacherId}-P${s.periodNumber}`;
    if (teacherPeriodMap[key]) {
      const teacher = db.teachers.find(tch => tch.id === s.teacherId);
      conflicts.push(`Conflict: ${teacher?.fullName} has overlapping period #${s.periodNumber} in multiple classes`);
    } else {
      teacherPeriodMap[key] = s.classId;
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('timetable')}
          </h2>
          <p className="text-xs text-slate-500">
            Weekly academic class schedule with automated teacher conflict detection
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Schedule</span>
        </button>
      </div>

      {conflicts.length > 0 ? (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{conflicts[0]}</span>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No schedule conflicts detected. All faculty period allocations are balanced.</span>
        </div>
      )}

      {/* Selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-600">Class:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
          >
            {db.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                selectedDay === day ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Period Grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
          <span>{selectedClass?.name} • {selectedDay} Academic Schedule</span>
          <span>8 Periods (08:00 AM – 01:45 PM)</span>
        </div>

        <div className="divide-y divide-slate-100">
          {slots.map(slot => {
            const teacher = db.teachers.find(t => t.id === slot.teacherId);

            return (
              <div 
                key={slot.id} 
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                  slot.isBreak ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center ${
                    slot.isBreak ? 'bg-amber-200 text-amber-900' : 'bg-[#0B192C] text-amber-300'
                  }`}>
                    P{slot.periodNumber}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {slot.subject}
                    </div>
                    <div className="text-slate-500 font-mono text-[11px]">
                      {slot.startTime} – {slot.endTime}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  {slot.isBreak ? (
                    <span className="font-bold text-amber-800">Recess / Rest Interval</span>
                  ) : (
                    <div>
                      <span className="font-semibold text-slate-800">{teacher?.fullName || 'Assigned Faculty'}</span>
                      <span className="text-[10px] text-slate-400 block">{teacher?.qualification}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
