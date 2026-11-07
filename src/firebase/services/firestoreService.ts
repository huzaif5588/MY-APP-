import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  deleteDoc, query, where, orderBy, onSnapshot, runTransaction 
} from 'firebase/firestore';
import { db, auth } from '../config';
import { 
  Student, Teacher, AttendanceRecord, FeeInvoice, FeePayment, 
  ExamResult, Homework, Announcement, FinancialTransaction, 
  SalaryRecord, AuditLog 
} from '../../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==================== STUDENTS ====================
export async function fetchStudentsFromFirestore(): Promise<Student[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    return snap.docs.map(d => d.data() as Student);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'students');
  }
}

export async function saveStudentToFirestore(student: Student): Promise<void> {
  try {
    await setDoc(doc(db, 'students', student.id), {
      ...student,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `students/${student.id}`);
  }
}

export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `students/${studentId}`);
  }
}

// ==================== TEACHERS ====================
export async function fetchTeachersFromFirestore(): Promise<Teacher[]> {
  try {
    const snap = await getDocs(collection(db, 'teachers'));
    return snap.docs.map(d => d.data() as Teacher);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'teachers');
  }
}

export async function saveTeacherToFirestore(teacher: Teacher): Promise<void> {
  try {
    await setDoc(doc(db, 'teachers', teacher.id), {
      ...teacher,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `teachers/${teacher.id}`);
  }
}

// ==================== ATTENDANCE ====================
export async function fetchAttendanceFromFirestore(): Promise<AttendanceRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'student_attendance'));
    return snap.docs.map(d => d.data() as AttendanceRecord);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'student_attendance');
  }
}

export async function saveAttendanceBatchToFirestore(records: AttendanceRecord[]): Promise<void> {
  try {
    for (const r of records) {
      await setDoc(doc(db, 'student_attendance', r.id), r);
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'student_attendance');
  }
}

// ==================== FEE VOUCHERS & PAYMENTS ====================
export async function fetchFeeInvoicesFromFirestore(): Promise<FeeInvoice[]> {
  try {
    const snap = await getDocs(collection(db, 'fee_vouchers'));
    return snap.docs.map(d => d.data() as FeeInvoice);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'fee_vouchers');
  }
}

export async function saveFeeInvoiceToFirestore(invoice: FeeInvoice): Promise<void> {
  try {
    await setDoc(doc(db, 'fee_vouchers', invoice.id), invoice);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `fee_vouchers/${invoice.id}`);
  }
}

export async function fetchFeePaymentsFromFirestore(): Promise<FeePayment[]> {
  try {
    const snap = await getDocs(collection(db, 'fee_payments'));
    return snap.docs.map(d => d.data() as FeePayment);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'fee_payments');
  }
}

export async function recordPaymentTransactionInFirestore(payment: FeePayment): Promise<void> {
  try {
    await setDoc(doc(db, 'fee_payments', payment.id), payment);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `fee_payments/${payment.id}`);
  }
}

// ==================== RESULTS ====================
export async function fetchExamResultsFromFirestore(): Promise<ExamResult[]> {
  try {
    const snap = await getDocs(collection(db, 'results'));
    return snap.docs.map(d => d.data() as ExamResult);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'results');
  }
}

export async function saveExamResultToFirestore(result: ExamResult): Promise<void> {
  try {
    await setDoc(doc(db, 'results', result.id), result);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `results/${result.id}`);
  }
}

// ==================== HOMEWORK ====================
export async function fetchHomeworkFromFirestore(): Promise<Homework[]> {
  try {
    const snap = await getDocs(collection(db, 'homework'));
    return snap.docs.map(d => d.data() as Homework);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'homework');
  }
}

export async function saveHomeworkToFirestore(hw: Homework): Promise<void> {
  try {
    await setDoc(doc(db, 'homework', hw.id), hw);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `homework/${hw.id}`);
  }
}

// ==================== ANNOUNCEMENTS ====================
export async function fetchAnnouncementsFromFirestore(): Promise<Announcement[]> {
  try {
    const snap = await getDocs(collection(db, 'announcements'));
    return snap.docs.map(d => d.data() as Announcement);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'announcements');
  }
}

export async function saveAnnouncementToFirestore(ann: Announcement): Promise<void> {
  try {
    await setDoc(doc(db, 'announcements', ann.id), ann);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `announcements/${ann.id}`);
  }
}

// ==================== EXPENSES ====================
export async function fetchExpensesFromFirestore(): Promise<FinancialTransaction[]> {
  try {
    const snap = await getDocs(collection(db, 'expenses'));
    return snap.docs.map(d => d.data() as FinancialTransaction);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'expenses');
  }
}

export async function saveExpenseToFirestore(expense: FinancialTransaction): Promise<void> {
  try {
    await setDoc(doc(db, 'expenses', expense.id), expense);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `expenses/${expense.id}`);
  }
}
