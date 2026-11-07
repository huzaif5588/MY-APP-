export type UserRole = 'super_admin' | 'principal' | 'accountant' | 'teacher' | 'parent';

export type Language = 'en' | 'ur';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  phone?: string;
  email?: string;
  teacherId?: string;
  assignedClasses?: string[];
  linkedStudentIds?: string[];
  avatar?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

export interface Student {
  id: string;
  regNo: string; // e.g. IA-KBH-2026-001
  admissionNo: string;
  name: string;
  nameUrdu?: string;
  fatherName: string;
  guardianName?: string;
  photo?: string;
  dob: string;
  gender: 'male' | 'female';
  fatherPhone: string;
  whatsappNo: string;
  address: string;
  previousSchool?: string;
  admissionDate: string;
  academicSession: string; // e.g. "2026-2027"
  classId: string;
  className: string;
  section: string;
  rollNo: string;
  monthlyTuitionFee: number;
  admissionFee: number;
  discount: number; // monthly discount
  emergencyContact: string;
  notes?: string;
  status: 'active' | 'promoted' | 'transferred' | 'withdrawn';
}

export interface Teacher {
  id: string;
  teacherId: string; // e.g. TCH-01
  fullName: string;
  nameUrdu?: string;
  photo?: string;
  fatherName: string;
  cnic: string;
  phone: string;
  address: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  assignedSubjects: string[];
  assignedClasses: string[];
  basicSalary: number;
  status: 'active' | 'on_leave' | 'resigned';
}

export interface ClassInfo {
  id: string;
  name: string;
  nameUrdu: string;
  numericLevel: number;
  sections: string[];
  classTeacherId?: string;
  monthlyFee: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  classId: string;
  section: string;
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string;
}

export type TeacherAttendanceStatus = 'present' | 'absent' | 'late' | 'leave' | 'half_day';

export interface TeacherAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  teacherId: string;
  status: TeacherAttendanceStatus;
  remarks?: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  month: string; // YYYY-MM
  tuitionFee: number;
  admissionFee: number;
  annualCharges: number;
  examFee: number;
  transportFee: number;
  libraryFee: number;
  otherCharges: number;
  discount: number;
  lateFee: number;
  totalPayable: number;
  paidAmount: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid' | 'overdue';
  dueDate: string;
}

export interface FeePayment {
  id: string;
  receiptNo: string; // e.g. RCP-2026-00101
  invoiceId?: string;
  studentId: string;
  amountPaid: number;
  paymentDate: string;
  feeMonth: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'EasyPaisa' | 'JazzCash';
  transactionRef?: string;
  receivedBy: string;
  remarks?: string;
}

export interface ExamSubjectMark {
  subject: string;
  maxMarks: number;
  passingMarks: number;
  obtainedMarks: number;
}

export interface Examination {
  id: string;
  name: string;
  nameUrdu?: string;
  academicSession: string;
  term: 'First Term' | 'Mid Term' | 'Final Term' | 'Monthly Test';
  startDate: string;
  endDate: string;
  classes: string[];
  isPublished: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  classId: string;
  rollNo: string;
  marks: ExamSubjectMark[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  grade: string;
  position?: number;
  passed: boolean;
  remarks: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodNumber: number; // 1 to 8
  startTime: string;
  endTime: string;
  classId: string;
  section: string;
  subject: string;
  teacherId: string;
  isBreak?: boolean;
}

export interface Homework {
  id: string;
  classId: string;
  section: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  title: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: 'active' | 'archived';
  attachmentUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleUrdu?: string;
  content: string;
  contentUrdu?: string;
  category: 'General' | 'Academic' | 'Holiday' | 'Fee Alert' | 'Exam';
  targetRole: 'all' | 'teachers' | 'parents' | 'students';
  publishedDate: string;
  authorName: string;
  isPinned: boolean;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  referenceId?: string;
  paymentMethod: string;
  recordedBy: string;
}

export interface SalaryRecord {
  id: string;
  slipNo: string;
  teacherId: string;
  month: string; // YYYY-MM
  basicSalary: number;
  advance: number;
  deductions: number;
  bonus: number;
  netPaid: number;
  paymentDate: string;
  status: 'paid' | 'pending';
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  shelfLocation: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface TransportVehicle {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  routeName: string;
  capacity: number;
  allocatedStudentsCount: number;
  monthlyFeePerStudent: number;
}

export interface InventoryItem {
  id: string;
  itemName: string;
  category: 'Furniture' | 'Stationery' | 'Computer/IT' | 'Sports' | 'Lab Equipment' | 'Other';
  quantity: number;
  unit: string;
  minStockAlert: number;
  location: string;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface AcademySettings {
  academyName: string;
  academyNameUrdu: string;
  location: string;
  locationUrdu: string;
  directorName: string;
  directorNameUrdu: string;
  tagline: string;
  taglineUrdu: string;
  phone: string;
  whatsapp: string;
  email: string;
  currentSession: string;
  currency: string;
}
