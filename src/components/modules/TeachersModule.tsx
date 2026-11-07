import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Teacher } from '../../types';
import { 
  GraduationCap, UserPlus, Phone, Award, 
  DollarSign, FileText, Printer, Edit2, X, Check 
} from 'lucide-react';

export const TeachersModule: React.FC = () => {
  const { db, addTeacher, updateTeacher, openPrintModal, processSalaryPayment, t } = useApp();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherForSalary, setSelectedTeacherForSalary] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    nameUrdu: '',
    fatherName: '',
    cnic: '38301-1234567-1',
    phone: '+92 300 ',
    address: 'Kalabagh',
    qualification: 'M.Sc, B.Ed',
    experience: '5 Years',
    joiningDate: new Date().toISOString().split('T')[0],
    assignedSubjects: ['Mathematics', 'Physics'],
    assignedClasses: ['Class 9 (Science)', 'Class 10 (Science)'],
    basicSalary: 45000,
    status: 'active' as 'active' | 'on_leave' | 'resigned',
  });

  const [salaryForm, setSalaryForm] = useState({
    month: '2026-11',
    advance: 0,
    deductions: 0,
    bonus: 0,
  });

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      fullName: '',
      nameUrdu: '',
      fatherName: '',
      cnic: '38301-1234567-1',
      phone: '+92 300 ',
      address: 'Kalabagh',
      qualification: 'M.Sc, B.Ed',
      experience: '5 Years',
      joiningDate: new Date().toISOString().split('T')[0],
      assignedSubjects: ['Mathematics'],
      assignedClasses: ['Class 9 (Science)'],
      basicSalary: 45000,
      status: 'active',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      nameUrdu: teacher.nameUrdu || '',
      fatherName: teacher.fatherName,
      cnic: teacher.cnic,
      phone: teacher.phone,
      address: teacher.address,
      qualification: teacher.qualification,
      experience: teacher.experience,
      joiningDate: teacher.joiningDate,
      assignedSubjects: teacher.assignedSubjects,
      assignedClasses: teacher.assignedClasses,
      basicSalary: teacher.basicSalary,
      status: teacher.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateTeacher({
        ...editingTeacher,
        ...formData,
      });
    } else {
      addTeacher(formData);
    }
    setIsAddModalOpen(false);
  };

  const handleDisburseSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacherForSalary) return;

    const netPaid = selectedTeacherForSalary.basicSalary + salaryForm.bonus - salaryForm.advance - salaryForm.deductions;
    
    processSalaryPayment({
      teacherId: selectedTeacherForSalary.id,
      month: salaryForm.month,
      basicSalary: selectedTeacherForSalary.basicSalary,
      advance: salaryForm.advance,
      deductions: salaryForm.deductions,
      bonus: salaryForm.bonus,
      netPaid,
      paymentDate: new Date().toISOString().split('T')[0],
      status: 'paid',
    });

    // Also offer instant salary slip preview
    openPrintModal('salary_slip', {
      teacher: selectedTeacherForSalary,
      month: salaryForm.month,
      basicSalary: selectedTeacherForSalary.basicSalary,
      bonus: salaryForm.bonus,
      deductions: salaryForm.deductions + salaryForm.advance,
      netPaid,
      paymentDate: new Date().toISOString().split('T')[0],
    });

    setSelectedTeacherForSalary(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('teachers')} ({db.teachers.length})
          </h2>
          <p className="text-xs text-slate-500">
            Academy faculty, subject specializations, qualifications, and salary management
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Teachers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {db.teachers.map(teacher => {
          const isDirector = teacher.fullName.toLowerCase().includes('noman');

          return (
            <div 
              key={teacher.id} 
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition hover:shadow-md ${
                isDirector ? 'border-amber-400/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#0B192C] text-amber-300 font-extrabold text-base flex items-center justify-center shadow">
                      {teacher.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {teacher.fullName}
                      </h3>
                      {teacher.nameUrdu && (
                        <p className="text-xs text-slate-400 font-urdu">{teacher.nameUrdu}</p>
                      )}
                      <span className="text-[10px] font-mono font-bold text-amber-600 block">
                        {teacher.teacherId}
                      </span>
                    </div>
                  </div>

                  {isDirector && (
                    <span className="text-[9px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Principal
                    </span>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Qualification:</span>
                    <strong className="text-slate-800">{teacher.qualification}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Subjects & Classes:</span>
                    <span className="font-medium text-slate-700">
                      {teacher.assignedSubjects.join(', ')} ({teacher.assignedClasses.join(', ')})
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-400 text-[11px]">Basic Salary:</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      PKR {teacher.basicSalary.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{teacher.phone}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedTeacherForSalary(teacher);
                    setSalaryForm({ month: '2026-11', advance: 0, deductions: 0, bonus: 0 });
                  }}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Pay Salary</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                    title="Edit Teacher"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      openPrintModal('salary_slip', {
                        teacher,
                        month: '2026-10',
                        basicSalary: teacher.basicSalary,
                        netPaid: teacher.basicSalary,
                        paymentDate: '2026-11-01',
                      });
                    }}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
                    title="Print Salary Slip"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Salary Disbursement Modal */}
      {selectedTeacherForSalary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">
                Disburse Faculty Salary
              </h3>
              <button onClick={() => setSelectedTeacherForSalary(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDisburseSalary} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div className="font-bold text-sm text-slate-900">{selectedTeacherForSalary.fullName}</div>
                <div className="text-slate-500">ID: {selectedTeacherForSalary.teacherId} · Base: PKR {selectedTeacherForSalary.basicSalary.toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Salary Month</label>
                <input
                  type="month"
                  value={salaryForm.month}
                  onChange={e => setSalaryForm({ ...salaryForm, month: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Bonus (+)</label>
                  <input
                    type="number"
                    value={salaryForm.bonus}
                    onChange={e => setSalaryForm({ ...salaryForm, bonus: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Advance (-)</label>
                  <input
                    type="number"
                    value={salaryForm.advance}
                    onChange={e => setSalaryForm({ ...salaryForm, advance: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Deductions (-)</label>
                  <input
                    type="number"
                    value={salaryForm.deductions}
                    onChange={e => setSalaryForm({ ...salaryForm, deductions: Number(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                <span>Net Payable:</span>
                <span className="text-emerald-700 font-mono text-base">
                  PKR {(selectedTeacherForSalary.basicSalary + salaryForm.bonus - salaryForm.advance - salaryForm.deductions).toLocaleString()}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeacherForSalary(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow"
                >
                  Disburse & Print Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">
                {editingTeacher ? 'Edit Teacher Details' : 'Add New Faculty Member'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Urdu Name</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.nameUrdu}
                    onChange={e => setFormData({ ...formData, nameUrdu: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-urdu"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">CNIC Number</label>
                  <input
                    type="text"
                    value={formData.cnic}
                    onChange={e => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Qualification</label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monthly Basic Salary (PKR)</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={e => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
