import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Download, Share2, X, CheckCircle, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DocumentModal: React.FC = () => {
  const { printModal, closePrintModal, db, t, isRTL } = useApp();
  const printRef = useRef<HTMLDivElement>(null);

  if (!printModal.isOpen || !printModal.docType) return null;

  const { docType, data } = printModal;

  const handlePrint = () => {
    // Trigger celebratory confetti on receipt/result print
    if (docType === 'receipt' || docType === 'result') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Indus Academy Kalabagh - ${docType.toUpperCase()}`,
          text: `Official document from Indus Academy Kalabagh`,
          url: window.location.href,
        });
      } catch {
        // Ignored or cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const student = data?.student || (data?.studentId ? db.students.find(s => s.id === data.studentId) : null);
  const teacher = data?.teacher || (data?.teacherId ? db.teachers.find(t => t.id === data.teacherId) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Action Header - Excluded from Print */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-[#0B192C] text-white shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base font-display capitalize">
              {docType.replace('_', ' ')} Document Viewer
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition active:scale-95 shadow"
            >
              <Printer className="w-4 h-4" />
              <span>{t('print')}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={closePrintModal}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
          <div 
            ref={printRef}
            className="w-full max-w-[210mm] bg-white p-6 sm:p-10 shadow-lg border border-slate-300 text-slate-900 rounded-sm print-break-inside-avoid print-shadow-none"
          >
            {/* OFFICIAL LETTERHEAD */}
            <div className="border-b-2 border-[#0B192C] pb-4 mb-6">
              <div className="flex items-center justify-between gap-4">
                <img 
                  src="/indus-logo.svg" 
                  alt="Indus Academy Emblem" 
                  className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0" 
                />
                <div className="flex-1 text-center">
                  <h1 className="text-xl sm:text-2xl font-black tracking-wider text-[#0B192C] font-display">
                    {db.settings.academyName}
                  </h1>
                  <p className="text-xs sm:text-sm font-bold text-amber-600 tracking-widest uppercase">
                    {db.settings.location}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium">
                    Phone: {db.settings.phone} • Email: {db.settings.email}
                  </p>
                  <p className="text-[9px] font-semibold text-slate-400 tracking-wider">
                    {db.settings.tagline} • Director: {db.settings.directorName}
                  </p>
                </div>
                <div className="w-16 sm:w-20 text-right hidden sm:block">
                  <div className="border border-slate-300 rounded p-1 text-[10px] text-slate-500 font-mono text-center">
                    <div>SESSION</div>
                    <div className="font-bold text-slate-800">{db.settings.currentSession}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1. FEE RECEIPT */}
            {docType === 'receipt' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-lg">
                  <div>
                    <span className="text-xs font-bold text-amber-900 uppercase">OFFICIAL FEE RECEIPT</span>
                    <span className="text-xs text-slate-600 ml-2 font-mono">#{data?.receiptNo || 'RCP-2026-001'}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Date: <strong className="font-mono text-slate-900">{data?.paymentDate || new Date().toISOString().split('T')[0]}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-slate-500">Student Name:</p>
                    <p className="font-bold text-sm text-slate-900">{student?.name || 'N/A'}</p>
                    <p className="text-slate-500 mt-2">Father Name:</p>
                    <p className="font-semibold text-slate-800">{student?.fatherName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Registration Number:</p>
                    <p className="font-mono font-bold text-slate-900">{student?.regNo || 'N/A'}</p>
                    <p className="text-slate-500 mt-2">Class & Section:</p>
                    <p className="font-semibold text-slate-800">{student?.className} - Sec {student?.section} (Roll: {student?.rollNo})</p>
                  </div>
                </div>

                {/* Breakdown Table */}
                <table className="w-full text-xs border border-slate-200 mt-4">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2.5 text-left border-b">Description</th>
                      <th className="p-2.5 text-left border-b">Fee Month</th>
                      <th className="p-2.5 text-right border-b">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5">Monthly Tuition Fee</td>
                      <td className="p-2.5 font-mono">{data?.feeMonth || '2026-11'}</td>
                      <td className="p-2.5 text-right font-mono font-semibold">PKR {(student?.monthlyTuitionFee || 0).toLocaleString()}</td>
                    </tr>
                    {student?.discount ? (
                      <tr className="text-emerald-700 bg-emerald-50/50">
                        <td className="p-2.5">Scholarship / Special Discount</td>
                        <td className="p-2.5">-</td>
                        <td className="p-2.5 text-right font-mono font-semibold">- PKR {student.discount.toLocaleString()}</td>
                      </tr>
                    ) : null}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2.5" colSpan={2}>Amount Paid ({data?.paymentMethod || 'Cash'})</td>
                      <td className="p-2.5 text-right font-mono text-emerald-600 text-sm">
                        PKR {(data?.amountPaid || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Remarks & Signatures */}
                <div className="pt-8 flex items-end justify-between text-xs">
                  <div>
                    <p className="text-slate-500">Payment Status: <span className="font-bold text-emerald-600">PAID & VERIFIED</span></p>
                    <p className="text-slate-400 text-[10px] mt-1">Received By: {data?.receivedBy || 'Accountant'}</p>
                  </div>
                  <div className="flex gap-8 text-center">
                    <div>
                      <div className="w-28 border-b border-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500 font-medium">Accountant Signature</span>
                    </div>
                    <div>
                      <div className="w-28 border-b border-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500 font-medium">Principal Signature</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. STUDENT ID CARD */}
            {docType === 'id_card' && student && (
              <div className="space-y-6 flex flex-col items-center">
                <div className="w-full max-w-sm rounded-2xl bg-gradient-to-b from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white p-6 shadow-xl border-2 border-amber-400/40 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-amber-400/30 pb-3">
                    <img src="/indus-logo.svg" alt="Emblem" className="w-10 h-10 object-contain" />
                    <div className="text-right">
                      <div className="font-extrabold text-sm tracking-wider text-amber-300 font-display">INDUS ACADEMY</div>
                      <div className="text-[9px] text-slate-300 font-bold">KALABAGH • PAKISTAN</div>
                    </div>
                  </div>

                  <div className="my-5 flex gap-4 items-center">
                    <div className="w-24 h-28 rounded-xl bg-slate-800 border-2 border-amber-400/60 flex items-center justify-center shrink-0 overflow-hidden text-center">
                      <div className="text-center p-2 text-slate-400 text-[10px]">
                        [STUDENT PHOTO]
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="font-extrabold text-base text-amber-200">{student.name}</div>
                      <div className="text-slate-300 text-[11px]">S/o {student.fatherName}</div>
                      <div className="text-slate-300 text-[11px] font-mono">Reg: {student.regNo}</div>
                      <div className="text-amber-300 font-bold text-xs mt-1">{student.className} (Roll #{student.rollNo})</div>
                    </div>
                  </div>

                  <div className="border-t border-amber-400/30 pt-3 flex justify-between items-end text-[10px] text-slate-300">
                    <div>
                      <div>Contact: {student.fatherPhone}</div>
                      <div>Session: {student.academicSession}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-300 font-serif italic text-xs">Sir Noman</div>
                      <div className="text-[9px] text-slate-400">Principal</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  Official Student Identity Card • Valid for Academic Session {db.settings.currentSession}
                </p>
              </div>
            )}

            {/* 3. EXAMINATION RESULT CARD */}
            {docType === 'result' && data && (
              <div className="space-y-6">
                <div className="text-center bg-slate-100 py-2 border-y border-slate-300">
                  <h3 className="font-extrabold text-sm tracking-wide text-slate-800 uppercase font-display">
                    {data.examName || 'ACADEMIC PERFORMANCE & RESULT CARD'}
                  </h3>
                  <p className="text-xs text-slate-600">Session {db.settings.currentSession}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-4">
                  <div>
                    <p><span className="text-slate-500">Student Name:</span> <strong>{student?.name || data.studentName}</strong></p>
                    <p><span className="text-slate-500">Father Name:</span> <strong>{student?.fatherName || 'N/A'}</strong></p>
                    <p><span className="text-slate-500">Class:</span> <strong>{student?.className || data.className}</strong></p>
                  </div>
                  <div>
                    <p><span className="text-slate-500">Registration #:</span> <strong className="font-mono">{student?.regNo || 'N/A'}</strong></p>
                    <p><span className="text-slate-500">Roll Number:</span> <strong className="font-mono">{data.rollNo || student?.rollNo}</strong></p>
                    <p><span className="text-slate-500">Class Position:</span> <strong className="text-amber-600 font-bold">{data.position ? `#${data.position}` : 'N/A'}</strong></p>
                  </div>
                </div>

                {/* Marks Table */}
                <table className="w-full text-xs border border-slate-300">
                  <thead className="bg-[#0B192C] text-white">
                    <tr>
                      <th className="p-2 text-left">Subject</th>
                      <th className="p-2 text-center">Max Marks</th>
                      <th className="p-2 text-center">Passing</th>
                      <th className="p-2 text-center">Obtained</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.marks?.map((m: any, idx: number) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        <td className="p-2 font-medium">{m.subject}</td>
                        <td className="p-2 text-center font-mono">{m.maxMarks}</td>
                        <td className="p-2 text-center font-mono">{m.passingMarks}</td>
                        <td className="p-2 text-center font-mono font-bold text-slate-900">{m.obtainedMarks}</td>
                        <td className="p-2 text-center">
                          {m.obtainedMarks >= m.passingMarks ? (
                            <span className="text-emerald-700 font-bold">Pass</span>
                          ) : (
                            <span className="text-red-600 font-bold">Fail</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-amber-50 font-bold border-t-2 border-slate-400">
                      <td className="p-2">Grand Total</td>
                      <td className="p-2 text-center font-mono">{data.totalMax}</td>
                      <td className="p-2 text-center">-</td>
                      <td className="p-2 text-center font-mono text-base text-slate-900">{data.totalObtained}</td>
                      <td className="p-2 text-center text-amber-700 font-extrabold text-sm">{data.grade}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Percentage & Remarks */}
                <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-200 rounded text-xs">
                  <div>
                    <span className="text-slate-500">Percentage:</span>{' '}
                    <strong className="text-base text-slate-900 font-mono">{data.percentage}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Remarks:</span>{' '}
                    <strong className="italic text-slate-800">{data.remarks || 'Keep working hard!'}</strong>
                  </div>
                </div>

                <div className="pt-10 flex justify-between text-xs text-center">
                  <div>
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500 font-medium">Class Teacher</span>
                  </div>
                  <div>
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-800 font-bold">Sir Noman (Principal)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. ADMISSION FORM */}
            {docType === 'admission_form' && student && (
              <div className="space-y-5 text-xs">
                <div className="text-center bg-slate-100 py-2 border-y border-slate-300">
                  <h3 className="font-extrabold text-sm tracking-wide text-slate-900 uppercase">
                    OFFICIAL STUDENT ADMISSION FORM
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <p><span className="text-slate-500">Registration Number:</span> <strong className="font-mono">{student.regNo}</strong></p>
                    <p><span className="text-slate-500">Full Name:</span> <strong>{student.name}</strong></p>
                    <p><span className="text-slate-500">Urdu Name:</span> <strong className="font-urdu">{student.nameUrdu || '-'}</strong></p>
                    <p><span className="text-slate-500">Father Name:</span> <strong>{student.fatherName}</strong></p>
                    <p><span className="text-slate-500">Date of Birth:</span> <strong>{student.dob}</strong></p>
                    <p><span className="text-slate-500">Gender:</span> <strong className="capitalize">{student.gender}</strong></p>
                    <p><span className="text-slate-500">Contact / WhatsApp:</span> <strong>{student.fatherPhone}</strong></p>
                    <p><span className="text-slate-500">Address:</span> <strong>{student.address}</strong></p>
                  </div>
                  <div className="col-span-1 border-2 border-dashed border-slate-300 rounded-lg h-36 flex items-center justify-center text-slate-400 text-center p-2">
                    [Affix Recent Passport Size Photo]
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <h4 className="font-bold text-slate-800 mb-2">Academic & Fee Allotment</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <p><span className="text-slate-500">Allotted Class:</span> <strong>{student.className} (Sec {student.section})</strong></p>
                    <p><span className="text-slate-500">Assigned Roll #:</span> <strong>{student.rollNo}</strong></p>
                    <p><span className="text-slate-500">Monthly Tuition Fee:</span> <strong>PKR {student.monthlyTuitionFee}</strong></p>
                    <p><span className="text-slate-500">Admission Fee Paid:</span> <strong>PKR {student.admissionFee}</strong></p>
                  </div>
                </div>

                <div className="border border-slate-200 p-3 rounded bg-slate-50 text-[11px] text-slate-600">
                  <strong>Declaration by Parent/Guardian:</strong> I solemnly declare that all particulars entered above are correct to the best of my knowledge and I agree to abide by the disciplinary and academic rules of Indus Academy Kalabagh.
                </div>

                <div className="pt-8 flex justify-between text-center">
                  <div>
                    <div className="w-36 border-b border-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500">Father / Guardian Signature</span>
                  </div>
                  <div>
                    <div className="w-36 border-b border-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-800 font-bold">Sir Noman (Principal)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SALARY SLIP */}
            {docType === 'salary_slip' && data && (
              <div className="space-y-5 text-xs">
                <div className="text-center bg-slate-100 py-2 border-y border-slate-300">
                  <h3 className="font-extrabold text-sm tracking-wide text-slate-900 uppercase">
                    FACULTY MONTHLY SALARY DISBURSEMENT SLIP
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">Slip Ref: {data.slipNo || 'SLIP-2026-10-01'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><span className="text-slate-500">Employee Name:</span> <strong>{teacher?.fullName || data.teacherName}</strong></p>
                    <p><span className="text-slate-500">Teacher ID:</span> <strong className="font-mono">{teacher?.teacherId || 'TCH-01'}</strong></p>
                    <p><span className="text-slate-500">Designation / Subjects:</span> <strong>{teacher?.assignedSubjects?.join(', ') || 'Senior Faculty'}</strong></p>
                  </div>
                  <div>
                    <p><span className="text-slate-500">Salary Month:</span> <strong>{data.month || '2026-10'}</strong></p>
                    <p><span className="text-slate-500">Payment Date:</span> <strong>{data.paymentDate || '2026-11-01'}</strong></p>
                    <p><span className="text-slate-500">Payment Status:</span> <strong className="text-emerald-700">PAID & CLEARED</strong></p>
                  </div>
                </div>

                <table className="w-full border border-slate-200 mt-4">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="p-2 text-left">Earnings / Deductions</th>
                      <th className="p-2 text-right">Amount (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2">Basic Monthly Salary</td>
                      <td className="p-2 text-right font-mono font-semibold">PKR {(data.basicSalary || teacher?.basicSalary || 0).toLocaleString()}</td>
                    </tr>
                    {data.bonus ? (
                      <tr className="text-emerald-700">
                        <td className="p-2">Academic Excellence Bonus</td>
                        <td className="p-2 text-right font-mono">+ PKR {data.bonus.toLocaleString()}</td>
                      </tr>
                    ) : null}
                    {data.deductions ? (
                      <tr className="text-red-600">
                        <td className="p-2">Salary Deductions / Leaves</td>
                        <td className="p-2 text-right font-mono">- PKR {data.deductions.toLocaleString()}</td>
                      </tr>
                    ) : null}
                    <tr className="bg-slate-50 font-bold text-sm">
                      <td className="p-2">Net Salary Disbursed</td>
                      <td className="p-2 text-right font-mono text-emerald-700">PKR {(data.netPaid || 0).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="pt-8 flex justify-between text-center">
                  <div>
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500">Teacher Signature</span>
                  </div>
                  <div>
                    <div className="w-32 border-b border-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-800 font-bold">Sir Noman (Principal)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 6. CHARACTER / LEAVING / BONAFIDE CERTIFICATES */}
            {(docType === 'character_cert' || docType === 'leaving_cert' || docType === 'bonafide_cert') && student && (
              <div className="space-y-6 text-sm">
                <div className="text-center my-6">
                  <h2 className="text-xl font-bold uppercase tracking-widest text-[#0B192C] underline decoration-amber-500 decoration-2 underline-offset-8">
                    {docType === 'character_cert' && 'CHARACTER CERTIFICATE'}
                    {docType === 'leaving_cert' && 'SCHOOL LEAVING CERTIFICATE'}
                    {docType === 'bonafide_cert' && 'BONAFIDE STUDENT CERTIFICATE'}
                  </h2>
                </div>

                <div className="leading-relaxed text-justify text-slate-800 space-y-4">
                  <p>
                    This is to certify that <strong>{student.name}</strong>, Son/Daughter of <strong>{student.fatherName}</strong>, resident of <strong>{student.address}</strong>, is/was a bonafide student of <strong>Indus Academy Kalabagh</strong>, holding Registration Number <strong>{student.regNo}</strong>.
                  </p>
                  <p>
                    According to our official academic records, the student was enrolled in <strong>{student.className}</strong> under Roll Number <strong>{student.rollNo}</strong> for the Academic Session <strong>{student.academicSession}</strong>.
                  </p>
                  <p>
                    {docType === 'character_cert' && 'During their stay at this prestigious institution, their moral conduct, discipline, and behavior towards faculty members and fellow students remained exemplary and commendable.'}
                    {docType === 'leaving_cert' && 'All academy tuition dues, library charges, and other institutional accounts have been cleared. We wish the student the very best in all their future academic endeavors.'}
                    {docType === 'bonafide_cert' && 'This certificate is issued on the specific request of the guardian for official purposes.'}
                  </p>
                </div>

                <div className="pt-16 flex justify-between items-end">
                  <div className="text-xs text-slate-500">
                    <div>Date of Issue: {new Date().toISOString().split('T')[0]}</div>
                    <div>Kalabagh, Mianwali</div>
                  </div>
                  <div className="text-center">
                    <div className="w-44 border-b-2 border-slate-800 mb-1" />
                    <div className="font-bold text-slate-900 font-display">Sir Noman Khan</div>
                    <div className="text-xs text-slate-600 font-medium">Principal & Director</div>
                    <div className="text-[10px] text-amber-700 font-bold uppercase">Indus Academy Kalabagh</div>
                  </div>
                </div>
              </div>
            )}

            {/* Official Watermark & Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Indus Academy ERP Core • System Generated Official Document</span>
              <span>Kalabagh, Punjab, Pakistan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
