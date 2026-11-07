import {
  AcademySettings, ClassInfo, Student, Teacher, 
  FeeInvoice, FeePayment, Examination, ExamResult, 
  TimetableSlot, Homework, Announcement, FinancialTransaction, 
  SalaryRecord, LibraryBook, BookIssue, TransportVehicle, InventoryItem, 
  User, AttendanceRecord, TeacherAttendanceRecord, AuditLog, UserRole
} from '../types';
import {
  initialSettings, initialClasses, initialTeachers, initialStudents,
  initialFeeInvoices, initialFeePayments, initialExaminations,
  initialExamResults, initialAttendanceRecords, initialTeacherAttendance,
  initialHomeworkList, initialAnnouncements, initialFinancialTransactions,
  initialSalaryRecords, initialLibraryBooks, initialBookIssues,
  initialTransportVehicles, initialInventoryItems, initialUsers,
  initialTimetableSlots
} from './initialData';

const STORAGE_KEY = 'indus_academy_db_v1';

export interface AppDatabase {
  settings: AcademySettings;
  classes: ClassInfo[];
  teachers: Teacher[];
  students: Student[];
  feeInvoices: FeeInvoice[];
  feePayments: FeePayment[];
  examinations: Examination[];
  examResults: ExamResult[];
  attendanceRecords: AttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
  homework: Homework[];
  announcements: Announcement[];
  transactions: FinancialTransaction[];
  salaryRecords: SalaryRecord[];
  libraryBooks: LibraryBook[];
  bookIssues: BookIssue[];
  transportVehicles: TransportVehicle[];
  inventory: InventoryItem[];
  users: User[];
  timetable: TimetableSlot[];
  auditLogs: AuditLog[];
  lastBackupDate?: string;
}

export function getDefaultDatabase(): AppDatabase {
  return {
    settings: initialSettings,
    classes: initialClasses,
    teachers: initialTeachers,
    students: initialStudents,
    feeInvoices: initialFeeInvoices,
    feePayments: initialFeePayments,
    examinations: initialExaminations,
    examResults: initialExamResults,
    attendanceRecords: initialAttendanceRecords,
    teacherAttendance: initialTeacherAttendance,
    homework: initialHomeworkList,
    announcements: initialAnnouncements,
    transactions: initialFinancialTransactions,
    salaryRecords: initialSalaryRecords,
    libraryBooks: initialLibraryBooks,
    bookIssues: initialBookIssues,
    transportVehicles: initialTransportVehicles,
    inventory: initialInventoryItems,
    users: initialUsers,
    timetable: initialTimetableSlots,
    auditLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        userId: 'u-1',
        userName: 'Sir Noman Khan',
        role: 'super_admin',
        action: 'System Initialization',
        details: 'Indus Academy management system initialized with active academic session records.',
      },
    ],
  };
}

export function loadDatabase(): AppDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultDatabase();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    return { ...getDefaultDatabase(), ...parsed };
  } catch (err) {
    console.error('Failed to load database from localStorage:', err);
    return getDefaultDatabase();
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save database to localStorage:', err);
  }
}

export function logAction(
  db: AppDatabase, 
  user: { id: string; name: string; role: UserRole }, 
  action: string, 
  details: string
): AppDatabase {
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    role: user.role,
    action,
    details,
  };
  return {
    ...db,
    auditLogs: [newLog, ...db.auditLogs.slice(0, 200)],
  };
}

// Next Registration Number Generator
export function getNextRegNo(students: Student[]): string {
  const currentYear = new Date().getFullYear();
  const regPattern = new RegExp(`^IA-KBH-${currentYear}-(\\d{3,4})$`);
  let maxNum = 0;
  for (const s of students) {
    const match = s.regNo.match(regPattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const nextNum = maxNum + 1;
  return `IA-KBH-${currentYear}-${String(nextNum).padStart(3, '0')}`;
}

// Next Receipt Number Generator
export function getNextReceiptNo(payments: FeePayment[]): string {
  const currentYear = new Date().getFullYear();
  const pattern = new RegExp(`^RCP-${currentYear}-(\\d{5})$`);
  let maxNum = 100;
  for (const p of payments) {
    const match = p.receiptNo.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `RCP-${currentYear}-${String(maxNum + 1).padStart(5, '0')}`;
}
