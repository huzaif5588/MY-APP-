import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccessDeniedScreen } from '../authentication/AccessDeniedScreen';
import { 
  GraduationCap, CalendarCheck, FileText, Award, 
  Clock, Bell, Lock, LogOut, BookOpen, Users, 
  CheckCircle2, ArrowRight, Printer, Globe, Plus,
  Save, Check, AlertCircle
} from 'lucide-react';
import { AttendanceStatus } from '../../types';

interface TeacherDashboardProps {
  onLogout: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const { currentUser, db, saveStudentAttendance, addHomework, openPrintModal, t, lang, setLang } = useApp();

  // Route Guard: Deny access if role is not teacher or administrator
  if (currentUser.role !== 'teacher' && currentUser.role !== 'super_admin' && currentUser.role !== 'principal') {
    return (
      <AccessDeniedScreen
        attemptedRole="Teacher Faculty Portal"
        onGoToAuthorizedDashboard={() => {}}
        onLogout={onLogout}
      />
    );
  }

  // Teacher Profile & Assigned Classes Scoping
  const teacherProfile = db.teachers.find(t => 
    t.phone === currentUser.phone || 
    t.fullName.toLowerCase().includes(currentUser.name.toLowerCase())
  ) || db.teachers[0];

  const assignedClassNames = teacherProfile.assignedClasses && teacherProfile.assignedClasses.length > 0 
    ? teacherProfile.assignedClasses 
    : ['Class 9', 'Class 10'];

  // Filter students strictly belonging to assigned classes
  const assignedStudents = db.students.filter(s => 
    assignedClassNames.includes(s.className) && s.status === 'active'
  );

  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'homework' | 'marks' | 'timetable' | 'notices' | 'profile'>('roster');

  // Attendance Session State
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState<string>(assignedClassNames[0]);
  const studentsForSession = assignedStudents.filter(s => s.className === selectedClassForAttendance);
  
  const [studentStatuses, setStudentStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saveBanner, setSaveBanner] = useState(false);

  // Homework Form State
  const [newHw, setNewHw] = useState({
    title: '',
    subject: teacherProfile.assignedSubjects[0] || 'Physics',
    className: assignedClassNames[0],
    description: '',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  });
  const [hwSuccessMsg, setHwSuccessMsg] = useState('');

  const handleMarkAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    studentsForSession.forEach(s => { next[s.id] = status; });
    setStudentStatuses(next);
  };

  const handleSaveAttendance = () => {
    const records = studentsForSession.map(s => ({
      id: `att-${Date.now()}-${s.id}`,
      date: attendanceDate,
      studentId: s.id,
      classId: s.classId,
      section: s.section,
      status: studentStatuses[s.id] || 'present',
      markedBy: currentUser.name,
    }));
    saveStudentAttendance(records);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3000);
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHw.title || !newHw.description) return;

    const matchedClass = db.classes.find(c => c.name === newHw.className);
    addHomework({
      classId: matchedClass?.id || 'c-10',
      section: 'A',
      subject: newHw.subject,
      teacherId: teacherProfile.id,
      teacherName: currentUser.name,
      title: newHw.title,
      description: newHw.description,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newHw.dueDate,
      status: 'active',
    });

    setHwSuccessMsg(`Homework for ${newHw.subject} published successfully!`);
    setNewHw({
      title: '',
      subject: teacherProfile.assignedSubjects[0] || 'Physics',
      className: assignedClassNames[0],
      description: '',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    });
    setTimeout(() => setHwSuccessMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Teacher Dedicated Executive Top Bar */}
      <div className="bg-[#0B192C] text-white p-5 rounded-2xl border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-full border border-blue-800">
                FACULTY PORTAL
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {teacherProfile.teacherId}</span>
            </div>
            <h1 className="text-xl font-bold font-display text-white mt-0.5">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-300">
              Assigned: {teacherProfile.assignedSubjects.join(', ')} ({assignedClassNames.join(', ')})
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Bilingual Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-blue-300 transition"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'اردو' : 'English'}</span>
          </button>

          {/* Sign Out */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* 2. Teacher-Only Navigation Menu */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'roster', label: '1. My Assigned Classes & Students', icon: Users },
          { id: 'attendance', label: '2. Daily Attendance Session', icon: CalendarCheck },
          { id: 'homework', label: '3. Upload Homework Diary', icon: FileText },
          { id: 'marks', label: '4. Enter Exam Marks', icon: Award },
          { id: 'timetable', label: '5. Teaching Timetable', icon: Clock },
          { id: 'notices', label: '6. Academic Notices', icon: Bell },
          { id: 'profile', label: '7. Faculty Profile', icon: GraduationCap },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-2 transition ${
                isActive
                  ? 'bg-blue-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Dedicated Teacher Screens */}

      {/* VIEW: ROSTER */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Assigned Students</span>
              <div className="text-3xl font-black text-slate-900 font-mono mt-2">
                {assignedStudents.length} Students
              </div>
              <span className="text-xs text-blue-600 font-semibold mt-1 block">
                Across {assignedClassNames.join(' & ')}
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Active Homework Tasks</span>
              <div className="text-3xl font-black text-blue-600 font-mono mt-2">
                {db.homework.filter(h => h.teacherId === teacherProfile.id).length} Active
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Assigned this academic week</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Weekly Teaching Periods</span>
              <div className="text-3xl font-black text-emerald-700 font-mono mt-2">
                24 Periods / Week
              </div>
              <span className="text-xs text-slate-400 mt-1 block">Regular 8-period daily schedule</span>
            </div>
          </div>

          {/* Roster List */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>Roster of Students in Assigned Classes ({assignedStudents.length} Students)</span>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {assignedStudents.map(student => (
                <div key={student.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center font-mono">
                      {student.rollNo}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {student.className} • Section {student.section} • Reg: {student.regNo}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPrintModal('id_card', { student })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] transition"
                    >
                      ID Card
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Classroom Attendance Session
              </h3>
              <p className="text-xs text-slate-500">
                Mark daily attendance for your assigned classes only
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Select assigned class */}
              <select
                value={selectedClassForAttendance}
                onChange={e => setSelectedClassForAttendance(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-800"
              >
                {assignedClassNames.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <input
                type="date"
                value={attendanceDate}
                onChange={e => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono bg-white text-slate-800"
              />

              <button
                onClick={() => handleMarkAll('present')}
                className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition"
              >
                All Present
              </button>

              <button
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Attendance</span>
              </button>
            </div>
          </div>

          {saveBanner && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Attendance session successfully saved and committed to Cloud Firestore!</span>
            </div>
          )}

          <div className="divide-y divide-slate-100 text-xs">
            {studentsForSession.map(s => {
              const currentStatus = studentStatuses[s.id] || 'present';
              return (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-100 font-mono font-bold text-slate-700 flex items-center justify-center text-xs">
                      {s.rollNo}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{s.name}</span>
                      <span className="block text-[11px] text-slate-400 font-mono">Reg: {s.regNo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {(['present', 'absent', 'late', 'leave'] as AttendanceStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => setStudentStatuses({ ...studentStatuses, [s.id]: st })}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase transition font-mono ${
                          currentStatus === st
                            ? st === 'present'
                              ? 'bg-emerald-600 text-white'
                              : st === 'absent'
                              ? 'bg-rose-600 text-white'
                              : 'bg-amber-500 text-slate-950'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: HOMEWORK */}
      {activeTab === 'homework' && (
        <div className="space-y-6">
          {/* Post Homework Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              Upload Daily Homework Assignment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Assigned tasks will appear directly in student and parent portals
            </p>

            {hwSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{hwSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateHomework} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Subject</label>
                  <select
                    value={newHw.subject}
                    onChange={e => setNewHw({ ...newHw, subject: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold"
                  >
                    {teacherProfile.assignedSubjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Target Class</label>
                  <select
                    value={newHw.className}
                    onChange={e => setNewHw({ ...newHw, className: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold"
                  >
                    {assignedClassNames.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Submission Due Date</label>
                  <input
                    type="date"
                    required
                    value={newHw.dueDate}
                    onChange={e => setNewHw({ ...newHw, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Assignment Title / Chapter</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4: Newton's Laws of Motion - Exercise Numericals 1 to 5"
                  value={newHw.title}
                  onChange={e => setNewHw({ ...newHw, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Detailed Instructions for Students</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write clear instructions, questions to solve in neat homework notebooks..."
                  value={newHw.description}
                  onChange={e => setNewHw({ ...newHw, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Homework to Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW: MARKS */}
      {activeTab === 'marks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-display">
                Examination Marks Ledger
              </h3>
              <p className="text-xs text-slate-500">
                Authorized entry of term examination marks for assigned subjects
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              Mid Term Examination 2026
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {assignedStudents.map(student => (
              <div key={student.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">{student.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{student.className} • Roll No: {student.rollNo}</div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-600 font-semibold">Physics (Max: 100):</span>
                  <input
                    type="number"
                    defaultValue={88}
                    max={100}
                    min={0}
                    className="w-16 px-2 py-1 rounded border border-slate-300 text-center font-bold font-mono text-slate-900"
                  />
                  <button className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 text-xs">
                    Save
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Weekly Teaching Schedule for {currentUser.name}
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold">
                  <th className="p-3 border">Period</th>
                  <th className="p-3 border">Timing</th>
                  <th className="p-3 border">Class & Section</th>
                  <th className="p-3 border">Subject</th>
                  <th className="p-3 border">Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { period: 'Period 1', time: '08:00 - 08:45', class: 'Class 10-A', subject: 'Physics', room: 'Hall B' },
                  { period: 'Period 2', time: '08:45 - 09:30', class: 'Class 9-A', subject: 'Physics', room: 'Room 102' },
                  { period: 'Period 3', time: '09:30 - 10:15', class: 'Class 10-A', subject: 'Physics Lab', room: 'Science Lab' },
                  { period: 'Break', time: '10:15 - 10:45', class: 'Recess', subject: 'Break', room: 'Staff Room' },
                  { period: 'Period 4', time: '10:45 - 11:30', class: 'Class 9-A', subject: 'Physics Lab', room: 'Science Lab' },
                  { period: 'Period 5', time: '11:30 - 12:15', class: 'Class 10-B', subject: 'Tutorial', room: 'Room 104' },
                ].map((slot, idx) => (
                  <tr key={idx} className={slot.period === 'Break' ? 'bg-amber-50/70 font-bold' : 'hover:bg-slate-50'}>
                    <td className="p-3 border font-mono font-bold text-blue-700">{slot.period}</td>
                    <td className="p-3 border font-mono text-slate-500">{slot.time}</td>
                    <td className="p-3 border font-bold text-slate-800">{slot.class}</td>
                    <td className="p-3 border text-slate-700">{slot.subject}</td>
                    <td className="p-3 border text-slate-500">{slot.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: NOTICES */}
      {activeTab === 'notices' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 font-display">
            Official Academy Staff Announcements
          </h3>

          <div className="space-y-3 text-xs">
            {db.announcements.map(ann => (
              <div key={ann.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{ann.title}</span>
                  <span className="font-mono text-slate-400 text-[10px]">{ann.publishedDate}</span>
                </div>
                <p className="text-slate-600 mt-2 leading-relaxed">{ann.content}</p>
                <div className="mt-2 text-[10px] text-blue-700 font-semibold">
                  Signed: {ann.authorName}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-xl mx-auto space-y-4 text-xs">
          <h3 className="font-bold text-base text-slate-900 font-display border-b pb-3">
            Faculty Employment Credentials
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 block">Full Name:</span>
              <strong className="text-slate-900 text-sm">{teacherProfile.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Faculty ID:</span>
              <strong className="text-slate-900 font-mono text-blue-700">{teacherProfile.teacherId}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">CNIC:</span>
              <strong className="text-slate-900 font-mono">{teacherProfile.cnic}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Contact Phone:</span>
              <strong className="text-slate-900 font-mono">{teacherProfile.phone}</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">Qualifications & Experience:</span>
              <strong className="text-slate-900">{teacherProfile.qualification} ({teacherProfile.experience})</strong>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block">Residential Address:</span>
              <strong className="text-slate-900">{teacherProfile.address}</strong>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
