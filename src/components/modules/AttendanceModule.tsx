import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus, TeacherAttendanceRecord, TeacherAttendanceStatus } from '../../types';
import { 
  CalendarCheck, CheckCircle2, XCircle, Clock, 
  AlertCircle, Users, Check, Printer, Save, Calendar 
} from 'lucide-react';

export const AttendanceModule: React.FC = () => {
  const { db, saveStudentAttendance, saveTeacherAttendance, currentUser, t } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'students' | 'teachers' | 'register'>('students');
  const [selectedClassId, setSelectedClassId] = useState<string>('c-10');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [attendanceDate, setAttendanceDate] = useState<string>('2026-11-06');
  
  // Local state for current attendance session
  const [studentStatuses, setStudentStatuses] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [teacherStatuses, setTeacherStatuses] = useState<Record<string, { status: TeacherAttendanceStatus; remarks: string }>>({});
  const [isSavedBanner, setIsSavedBanner] = useState<boolean>(false);

  const selectedClass = db.classes.find(c => c.id === selectedClassId);
  const studentsInClass = db.students.filter(s => s.classId === selectedClassId && s.section === selectedSection && s.status === 'active');

  // Load existing session records when date or class changes
  React.useEffect(() => {
    const existing = db.attendanceRecords.filter(r => r.date === attendanceDate && r.classId === selectedClassId && r.section === selectedSection);
    const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    
    studentsInClass.forEach(s => {
      const rec = existing.find(r => r.studentId === s.id);
      map[s.id] = {
        status: rec ? rec.status : 'present',
        remarks: rec?.remarks || '',
      };
    });

    setStudentStatuses(map);
    setIsSavedBanner(false);
  }, [attendanceDate, selectedClassId, selectedSection, db.attendanceRecords]);

  // Load teacher attendance
  React.useEffect(() => {
    const existing = db.teacherAttendance.filter(r => r.date === attendanceDate);
    const map: Record<string, { status: TeacherAttendanceStatus; remarks: string }> = {};

    db.teachers.forEach(t => {
      const rec = existing.find(r => r.teacherId === t.id);
      map[t.id] = {
        status: rec ? rec.status : 'present',
        remarks: rec?.remarks || '',
      };
    });

    setTeacherStatuses(map);
  }, [attendanceDate, db.teacherAttendance]);

  const handleMarkAllPresent = () => {
    const updated = { ...studentStatuses };
    studentsInClass.forEach(s => {
      updated[s.id] = { ...updated[s.id], status: 'present' };
    });
    setStudentStatuses(updated);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setStudentStatuses(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleTeacherStatusChange = (teacherId: string, status: TeacherAttendanceStatus) => {
    setTeacherStatuses(prev => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], status },
    }));
  };

  const handleSaveStudentAttendance = () => {
    const records: AttendanceRecord[] = studentsInClass.map(s => ({
      id: `att-${Date.now()}-${s.id}`,
      date: attendanceDate,
      studentId: s.id,
      classId: selectedClassId,
      section: selectedSection,
      status: studentStatuses[s.id]?.status || 'present',
      remarks: studentStatuses[s.id]?.remarks || '',
      markedBy: currentUser.name,
    }));

    saveStudentAttendance(records);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleSaveTeacherAttendance = () => {
    const records: TeacherAttendanceRecord[] = db.teachers.map(t => ({
      id: `tatt-${Date.now()}-${t.id}`,
      date: attendanceDate,
      teacherId: t.id,
      status: teacherStatuses[t.id]?.status || 'present',
      remarks: teacherStatuses[t.id]?.remarks || '',
    }));

    saveTeacherAttendance(records);
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Module Title & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('attendance')}
          </h2>
          <p className="text-xs text-slate-500">
            Daily attendance session logging with automated duplicate prevention
          </p>
        </div>

        {/* Segmented Controls for Sub-tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeSubTab === 'students' ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Student Attendance
          </button>
          <button
            onClick={() => setActiveSubTab('teachers')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeSubTab === 'teachers' ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Faculty Attendance
          </button>
          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeSubTab === 'register' ? 'bg-[#0B192C] text-white shadow' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Register
          </button>
        </div>
      </div>

      {isSavedBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Attendance session successfully saved and committed to local database.</span>
        </div>
      )}

      {/* 1. STUDENT ATTENDANCE SESSION */}
      {activeSubTab === 'students' && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Select Class</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                {db.classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.nameUrdu})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Section</label>
              <select
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
              >
                {selectedClass?.sections.map(s => (
                  <option key={s} value={s}>Section {s}</option>
                )) || <option value="A">Section A</option>}
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-semibold mb-1">Session Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-medium"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleMarkAllPresent}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
              >
                All Present
              </button>
              <button
                onClick={handleSaveStudentAttendance}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Student Roster Attendance Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <div className="font-bold text-slate-800">
                Class Roster: {selectedClass?.name} (Sec {selectedSection}) • Total Students: {studentsInClass.length}
              </div>
              <div className="text-slate-500">
                Date: <strong className="font-mono text-slate-800">{attendanceDate}</strong>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {studentsInClass.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No active students enrolled in this class section yet.
                </div>
              ) : (
                studentsInClass.map(student => {
                  const current = studentStatuses[student.id]?.status || 'present';

                  return (
                    <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center">
                          {student.rollNo}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{student.name}</div>
                          <div className="text-[11px] text-slate-500">
                            S/o {student.fatherName} · <span className="font-mono">{student.regNo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Selector Pills / Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'present')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            current === 'present'
                              ? 'bg-emerald-600 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Present
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            current === 'absent'
                              ? 'bg-rose-600 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'late')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            current === 'late'
                              ? 'bg-amber-500 text-slate-950 shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Late
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStatusChange(student.id, 'leave')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            current === 'leave'
                              ? 'bg-blue-600 text-white shadow'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Leave
                        </button>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {studentsInClass.length > 0 && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleSaveStudentAttendance}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Daily Attendance Session</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FACULTY ATTENDANCE */}
      {activeSubTab === 'teachers' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-slate-800">Faculty Daily Attendance Session</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-mono"
              />
              <button
                onClick={handleSaveTeacherAttendance}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
              >
                Save Faculty Session
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {db.teachers.map(teacher => {
              const current = teacherStatuses[teacher.id]?.status || 'present';

              return (
                <div key={teacher.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{teacher.fullName}</div>
                    <div className="text-[11px] text-slate-500">ID: {teacher.teacherId} · {teacher.qualification}</div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['present', 'absent', 'late', 'leave', 'half_day'] as TeacherAttendanceStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleTeacherStatusChange(teacher.id, st)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                          current === st
                            ? st === 'present' ? 'bg-emerald-600 text-white'
                              : st === 'absent' ? 'bg-rose-600 text-white'
                              : st === 'late' ? 'bg-amber-500 text-slate-950'
                              : 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MONTHLY ATTENDANCE REGISTER */}
      {activeSubTab === 'register' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-display">
                Monthly Attendance Register ({selectedClass?.name})
              </h3>
              <p className="text-xs text-slate-500">Academic Month: November 2026</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Register</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-[#0B192C] text-white">
                <tr>
                  <th className="p-2 border">Roll #</th>
                  <th className="p-2 border">Student Name</th>
                  {Array.from({ length: 6 }, (_, i) => (
                    <th key={i} className="p-2 text-center border font-mono">0{i + 1}</th>
                  ))}
                  <th className="p-2 text-center border">Present</th>
                  <th className="p-2 text-center border">% Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsInClass.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-2 border font-mono font-bold">{s.rollNo}</td>
                    <td className="p-2 border font-semibold">{s.name}</td>
                    {Array.from({ length: 6 }, (_, i) => (
                      <td key={i} className="p-2 text-center border font-bold text-emerald-700">P</td>
                    ))}
                    <td className="p-2 text-center border font-mono font-bold text-emerald-700">6/6</td>
                    <td className="p-2 text-center border font-mono font-bold text-slate-900">100%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
