import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Examination, ExamResult } from '../../types';
import { 
  Award, PlusCircle, Printer, Eye, CheckCircle2, 
  BarChart, Users, Star, X, Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ExaminationsModule: React.FC = () => {
  const { db, saveExamResult, openPrintModal, t } = useApp();

  const [selectedExamId, setSelectedExamId] = useState<string>('exam-1');
  const [selectedClassId, setSelectedClassId] = useState<string>('c-10');
  const [isMarksModalOpen, setIsMarksModalOpen] = useState<boolean>(false);
  const [editingStudentId, setEditingStudentId] = useState<string>('');

  // Marks Form State
  const [marksList, setMarksList] = useState([
    { subject: 'English', maxMarks: 100, passingMarks: 33, obtainedMarks: 85 },
    { subject: 'Urdu', maxMarks: 100, passingMarks: 33, obtainedMarks: 80 },
    { subject: 'Mathematics', maxMarks: 100, passingMarks: 33, obtainedMarks: 90 },
    { subject: 'Physics', maxMarks: 100, passingMarks: 33, obtainedMarks: 88 },
    { subject: 'Chemistry', maxMarks: 100, passingMarks: 33, obtainedMarks: 82 },
    { subject: 'Biology / Computer', maxMarks: 100, passingMarks: 33, obtainedMarks: 87 },
    { subject: 'Islamiyat', maxMarks: 50, passingMarks: 17, obtainedMarks: 44 },
    { subject: 'Pak Studies', maxMarks: 50, passingMarks: 17, obtainedMarks: 42 },
  ]);

  const [remarks, setRemarks] = useState<string>('Commendable effort and sound conceptual foundation.');

  const selectedExam = db.examinations.find(e => e.id === selectedExamId);
  const studentsInClass = db.students.filter(s => s.classId === selectedClassId && s.status === 'active');
  const classResults = db.examResults.filter(r => r.examId === selectedExamId && r.classId === selectedClassId);

  const calculateGrade = (pct: number) => {
    if (pct >= 85) return 'A+';
    if (pct >= 75) return 'A';
    if (pct >= 65) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'Fail';
  };

  const handleOpenMarksEntry = (studentId: string) => {
    setEditingStudentId(studentId);
    const existing = db.examResults.find(r => r.examId === selectedExamId && r.studentId === studentId);
    if (existing) {
      setMarksList(existing.marks);
      setRemarks(existing.remarks);
    } else {
      setRemarks('Diligent and dedicated student.');
    }
    setIsMarksModalOpen(true);
  };

  const handleSaveMarks = (e: React.FormEvent) => {
    e.preventDefault();
    const student = db.students.find(s => s.id === editingStudentId);
    if (!student) return;

    const totalMax = marksList.reduce((sum, m) => sum + m.maxMarks, 0);
    const totalObtained = marksList.reduce((sum, m) => sum + m.obtainedMarks, 0);
    const percentage = Number(((totalObtained / totalMax) * 100).toFixed(1));
    const grade = calculateGrade(percentage);
    const passed = marksList.every(m => m.obtainedMarks >= m.passingMarks);

    const newResult: ExamResult = {
      id: `res-${Date.now()}`,
      examId: selectedExamId,
      studentId: student.id,
      classId: selectedClassId,
      rollNo: student.rollNo,
      marks: marksList,
      totalMax,
      totalObtained,
      percentage,
      grade,
      position: percentage >= 90 ? 1 : percentage >= 80 ? 2 : 3,
      passed,
      remarks,
    };

    saveExamResult(newResult);
    setIsMarksModalOpen(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('examinations')}
          </h2>
          <p className="text-xs text-slate-500">
            Term evaluations, marks entry, automated grades, class positions, and official result cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedExamId}
            onChange={e => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 font-bold bg-white text-slate-900"
          >
            {db.examinations.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Select Class for Marks Entry:</span>
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

        <div className="flex items-center gap-4 text-slate-500">
          <span>Results Published: <strong className="text-emerald-700">Yes</strong></span>
          <span>Grading Scale: <strong className="text-slate-800">A+ (85%+), A (75%+)</strong></span>
        </div>
      </div>

      {/* Students Marks Sheet Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-800">
            Class Merit & Marks Roster ({studentsInClass.length} Students)
          </span>
          <span className="text-slate-500 font-mono">Exam: {selectedExam?.name}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B192C] text-white">
              <tr>
                <th className="p-3">Roll #</th>
                <th className="p-3">Student Name</th>
                <th className="p-3 text-center">Marks Obtained</th>
                <th className="p-3 text-center">% Score</th>
                <th className="p-3 text-center">Grade</th>
                <th className="p-3 text-center">Rank</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsInClass.map(student => {
                const res = classResults.find(r => r.studentId === student.id);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-800">{student.rollNo}</td>
                    
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{student.name}</div>
                      <div className="text-[11px] text-slate-500">S/o {student.fatherName}</div>
                    </td>

                    <td className="p-3 text-center font-mono font-semibold text-slate-800">
                      {res ? `${res.totalObtained} / ${res.totalMax}` : 'Pending'}
                    </td>

                    <td className="p-3 text-center font-mono font-bold text-slate-900 text-sm">
                      {res ? `${res.percentage}%` : '-'}
                    </td>

                    <td className="p-3 text-center">
                      {res ? (
                        <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                          {res.grade}
                        </span>
                      ) : '-'}
                    </td>

                    <td className="p-3 text-center font-bold">
                      {res?.position ? (
                        <span className="text-amber-600 flex items-center justify-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>#{res.position}</span>
                        </span>
                      ) : '-'}
                    </td>

                    <td className="p-3 text-center">
                      {res ? (
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          res.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {res.passed ? 'PASSED' : 'NEEDS ATTENTION'}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Unrecorded</span>
                      )}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenMarksEntry(student.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                        >
                          {res ? 'Update Marks' : 'Enter Marks'}
                        </button>

                        {res && (
                          <button
                            onClick={() => {
                              openPrintModal('result', {
                                ...res,
                                examName: selectedExam?.name,
                                studentName: student.name,
                                className: student.className,
                                student,
                              });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Result Card</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Marks Entry Modal */}
      {isMarksModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">
                Enter Subject Marks: {db.students.find(s => s.id === editingStudentId)?.name}
              </h3>
              <button onClick={() => setIsMarksModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMarks} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="space-y-3">
                {marksList.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-slate-800 w-36 truncate">{m.subject}</span>
                    <span className="text-slate-400 font-mono">Max: {m.maxMarks}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Obtained:</span>
                      <input
                        type="number"
                        min={0}
                        max={m.maxMarks}
                        value={m.obtainedMarks}
                        onChange={e => {
                          const updated = [...marksList];
                          updated[idx].obtainedMarks = Number(e.target.value);
                          setMarksList(updated);
                        }}
                        className="w-16 px-2 py-1 text-center font-mono font-bold rounded border border-slate-300"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Teacher / Principal Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMarksModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  Save & Publish Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
