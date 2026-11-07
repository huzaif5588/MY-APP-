import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { 
  Users, UserPlus, Search, Filter, Download, 
  Printer, Edit2, Trash2, Eye, ShieldCheck, 
  CreditCard, Award, CheckCircle, X, Phone, MessageSquare
} from 'lucide-react';

export const StudentsModule: React.FC = () => {
  const { db, addStudent, updateStudent, deleteStudent, openPrintModal, t, globalSearch, lang } = useApp();
  
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    nameUrdu: '',
    fatherName: '',
    guardianName: '',
    dob: '2016-01-01',
    gender: 'male' as 'male' | 'female',
    fatherPhone: '+92 300 ',
    whatsappNo: '+92 300 ',
    address: 'Kalabagh',
    previousSchool: '',
    admissionDate: new Date().toISOString().split('T')[0],
    academicSession: '2026-2027',
    classId: 'c-10',
    className: 'Class 10 (Science)',
    section: 'A',
    rollNo: '',
    monthlyTuitionFee: 4500,
    admissionFee: 5000,
    discount: 0,
    emergencyContact: '+92 300 ',
    notes: '',
  });

  const effectiveSearch = searchTerm || globalSearch;

  const filteredStudents = db.students.filter(student => {
    const matchClass = selectedClass === 'all' || student.classId === selectedClass;
    const term = effectiveSearch.toLowerCase().trim();
    const matchSearch = !term || 
      student.name.toLowerCase().includes(term) ||
      student.fatherName.toLowerCase().includes(term) ||
      student.regNo.toLowerCase().includes(term) ||
      student.rollNo.includes(term) ||
      student.className.toLowerCase().includes(term);
    return matchClass && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      nameUrdu: '',
      fatherName: '',
      guardianName: '',
      dob: '2016-01-01',
      gender: 'male',
      fatherPhone: '+92 300 ',
      whatsappNo: '+92 300 ',
      address: 'Kalabagh',
      previousSchool: '',
      admissionDate: new Date().toISOString().split('T')[0],
      academicSession: db.settings.currentSession,
      classId: 'c-10',
      className: 'Class 10 (Science)',
      section: 'A',
      rollNo: String(db.students.length + 101),
      monthlyTuitionFee: 4500,
      admissionFee: 5000,
      discount: 0,
      emergencyContact: '+92 300 ',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nameUrdu: student.nameUrdu || '',
      fatherName: student.fatherName,
      guardianName: student.guardianName || student.fatherName,
      dob: student.dob,
      gender: student.gender,
      fatherPhone: student.fatherPhone,
      whatsappNo: student.whatsappNo,
      address: student.address,
      previousSchool: student.previousSchool || '',
      admissionDate: student.admissionDate,
      academicSession: student.academicSession,
      classId: student.classId,
      className: student.className,
      section: student.section,
      rollNo: student.rollNo,
      monthlyTuitionFee: student.monthlyTuitionFee,
      admissionFee: student.admissionFee,
      discount: student.discount,
      emergencyContact: student.emergencyContact,
      notes: student.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.fatherName) {
      alert('Student Name and Father Name are required.');
      return;
    }

    const targetClass = db.classes.find(c => c.id === formData.classId);
    const updatedClassName = targetClass ? targetClass.name : formData.className;

    if (editingStudent) {
      updateStudent({
        ...editingStudent,
        ...formData,
        className: updatedClassName,
      });
    } else {
      addStudent({
        ...formData,
        admissionNo: String(1000 + db.students.length + 1),
        className: updatedClassName,
        status: 'active',
      });
    }
    setIsAddModalOpen(false);
  };

  const exportStudentsCSV = () => {
    const headers = ['Registration No', 'Admission No', 'Name', 'Father Name', 'Class', 'Section', 'Roll No', 'Monthly Fee', 'Discount', 'Contact', 'Status'];
    const rows = filteredStudents.map(s => [
      s.regNo,
      s.admissionNo,
      `"${s.name}"`,
      `"${s.fatherName}"`,
      `"${s.className}"`,
      s.section,
      s.rollNo,
      s.monthlyTuitionFee,
      s.discount,
      s.fatherPhone,
      s.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `INDUS_ACADEMY_STUDENTS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            {t('students')} ({filteredStudents.length})
          </h2>
          <p className="text-xs text-slate-500">
            Official student registry, academic enrollment, and identity credentials
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportStudentsCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportExcel')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('quickAdmission')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, father name, registration #, roll #..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-amber-400"
          >
            <option value="all">All Classes & Sections</option>
            {db.classes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.nameUrdu})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B192C] text-white">
              <tr>
                <th className="p-3">Student Name</th>
                <th className="p-3">Reg No / Roll</th>
                <th className="p-3">Father Name</th>
                <th className="p-3">Class</th>
                <th className="p-3 text-right">Monthly Fee</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No student records matching your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{student.name}</div>
                          {student.nameUrdu && (
                            <div className="text-[10px] text-slate-400 font-urdu">{student.nameUrdu}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="p-3 font-mono">
                      <span className="font-semibold text-slate-800">{student.regNo}</span>
                      <span className="text-[10px] text-slate-400 block">Roll: {student.rollNo}</span>
                    </td>

                    <td className="p-3 font-medium text-slate-700">
                      {student.fatherName}
                    </td>

                    <td className="p-3 font-medium text-slate-800">
                      <span>{student.className}</span>
                      <span className="text-[10px] text-slate-400 ml-1">Sec {student.section}</span>
                    </td>

                    <td className="p-3 text-right font-mono tabular-nums font-semibold text-slate-800">
                      PKR {student.monthlyTuitionFee.toLocaleString()}
                      {student.discount > 0 && (
                        <span className="block text-[10px] text-emerald-600 font-bold">
                          -PKR {student.discount}
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono text-[11px]">{student.fatherPhone}</span>
                      </div>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        student.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {student.status}
                      </span>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        
                        {/* Print ID Card Button */}
                        <button
                          onClick={() => openPrintModal('id_card', { student })}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-amber-600"
                          title="Generate Student ID Card"
                        >
                          <Award className="w-3.5 h-3.5" />
                        </button>

                        {/* Print Admission Form */}
                        <button
                          onClick={() => openPrintModal('admission_form', { student })}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600"
                          title="Print Official Admission Form"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* View Profile */}
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                          title="View Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                          title="Edit Student"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to withdraw student ${student.name} (${student.regNo})?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                          title="Withdraw Student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Admission / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-auto">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white">
              <h3 className="font-bold text-base font-display">
                {editingStudent ? 'Edit Student Profile' : 'New Student Admission Entry'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Muhammad Hamza"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Urdu Name (طالب علم کا اردو نام)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.nameUrdu}
                    onChange={e => setFormData({ ...formData, nameUrdu: e.target.value })}
                    placeholder="مثال: محمد حمزہ"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-urdu"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Father Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherName}
                    onChange={e => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="Father Name"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="male">Male (لڑکا)</option>
                    <option value="female">Female (لڑکی)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Father Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.fatherPhone}
                    onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={formData.whatsappNo}
                    onChange={e => setFormData({ ...formData, whatsappNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Class Allotment</label>
                  <select
                    value={formData.classId}
                    onChange={e => {
                      const sel = db.classes.find(c => c.id === e.target.value);
                      setFormData({ 
                        ...formData, 
                        classId: e.target.value,
                        className: sel?.name || formData.className,
                        monthlyTuitionFee: sel?.monthlyFee || formData.monthlyTuitionFee
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-amber-500"
                  >
                    {db.classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name} (PKR {c.monthlyFee}/mo)</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Section & Roll No</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Section (A, B)"
                      value={formData.section}
                      onChange={e => setFormData({ ...formData, section: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Roll No"
                      value={formData.rollNo}
                      onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monthly Tuition Fee (PKR)</label>
                  <input
                    type="number"
                    value={formData.monthlyTuitionFee}
                    onChange={e => setFormData({ ...formData, monthlyTuitionFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Monthly Scholarship / Discount (PKR)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">Residential Address (Kalabagh Area)</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Mohallah Sheikhan, Near Indus River, Kalabagh"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow"
                >
                  {editingStudent ? 'Save Updates' : 'Confirm Admission'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Student Profile Quick View Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="p-6 bg-[#0B192C] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-lg flex items-center justify-center shadow">
                  {viewingStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base font-display">{viewingStudent.name}</h3>
                  <p className="text-xs text-amber-400 font-mono">{viewingStudent.regNo} · Roll: {viewingStudent.rollNo}</p>
                </div>
              </div>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block">Father Name:</span>
                  <strong className="text-slate-800 text-sm">{viewingStudent.fatherName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Class & Section:</span>
                  <strong className="text-slate-800 text-sm">{viewingStudent.className} ({viewingStudent.section})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Contact:</span>
                  <strong className="text-slate-800 font-mono">{viewingStudent.fatherPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Monthly Fee:</span>
                  <strong className="text-slate-800 font-mono">PKR {viewingStudent.monthlyTuitionFee}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">Address:</span>
                  <strong className="text-slate-800">{viewingStudent.address}</strong>
                </div>
                {viewingStudent.notes && (
                  <div className="col-span-2 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <span className="text-amber-900 font-bold block">Academic Notes:</span>
                    <span className="text-slate-700">{viewingStudent.notes}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    openPrintModal('id_card', { student: viewingStudent });
                    setViewingStudent(null);
                  }}
                  className="flex-1 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-center"
                >
                  Print ID Card
                </button>
                <button
                  onClick={() => {
                    openPrintModal('admission_form', { student: viewingStudent });
                    setViewingStudent(null);
                  }}
                  className="flex-1 py-2 rounded-lg bg-slate-800 text-white font-semibold text-center"
                >
                  Admission Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
