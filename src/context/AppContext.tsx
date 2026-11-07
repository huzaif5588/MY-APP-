import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile } from '../firebase/services/authService';
import { 
  saveStudentToFirestore, 
  deleteStudentFromFirestore, 
  saveTeacherToFirestore, 
  saveAttendanceBatchToFirestore, 
  saveFeeInvoiceToFirestore, 
  recordPaymentTransactionInFirestore, 
  saveExamResultToFirestore, 
  saveHomeworkToFirestore, 
  saveAnnouncementToFirestore, 
  saveExpenseToFirestore 
} from '../firebase/services/firestoreService';
import { 
  User, Language, Student, Teacher, FeeInvoice, FeePayment, 
  ExamResult, Homework, Announcement, FinancialTransaction, 
  SalaryRecord, BookIssue, AcademySettings, AttendanceRecord,
  TeacherAttendanceRecord
} from '../types';
import { 
  AppDatabase, loadDatabase, saveDatabase, 
  logAction, getNextRegNo, getNextReceiptNo, getDefaultDatabase 
} from '../data/storage';
import { translations, getTranslation } from '../locales/translations';

export type PrintDocType = 
  | 'receipt' 
  | 'id_card' 
  | 'result' 
  | 'admission_form' 
  | 'salary_slip' 
  | 'character_cert' 
  | 'leaving_cert' 
  | 'bonafide_cert';

interface PrintModalState {
  isOpen: boolean;
  docType: PrintDocType | null;
  data: any;
}

const defaultGuestUser: User = {
  id: '',
  name: 'Institutional Guest',
  username: 'guest',
  role: 'parent',
  status: 'suspended',
  createdAt: '',
};

interface AppContextType {
  db: AppDatabase;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  loginUser: (user: User) => void;
  logout: () => Promise<void>;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations.en) => string;
  isRTL: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showSplash: boolean;
  dismissSplash: () => void;
  
  // Quick Search & Notifications
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  unreadCount: number;

  // Actions
  addStudent: (student: Omit<Student, 'id' | 'regNo'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: string) => void;
  
  addTeacher: (teacher: Omit<Teacher, 'id' | 'teacherId'>) => Teacher;
  updateTeacher: (teacher: Teacher) => void;
  
  saveStudentAttendance: (records: AttendanceRecord[]) => void;
  saveTeacherAttendance: (records: TeacherAttendanceRecord[]) => void;
  
  generateMonthlyFees: (month: string) => number;
  recordFeePayment: (payment: Omit<FeePayment, 'id' | 'receiptNo'>) => FeePayment;
  
  saveExamResult: (result: ExamResult) => void;
  
  addHomework: (hw: Omit<Homework, 'id'>) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id'>) => void;
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  processSalaryPayment: (salary: Omit<SalaryRecord, 'id' | 'slipNo'>) => void;
  
  issueBook: (bookId: string, studentId: string, dueDate: string) => void;
  returnBook: (issueId: string) => void;
  
  updateSettings: (settings: AcademySettings) => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonStr: string) => boolean;
  resetDatabase: () => void;

  // Document Printing
  printModal: PrintModalState;
  openPrintModal: (docType: PrintDocType, data: any) => void;
  closePrintModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [currentUser, setCurrentUser] = useState<User>(defaultGuestUser);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [lang, setLangState] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [printModal, setPrintModal] = useState<PrintModalState>({
    isOpen: false,
    docType: null,
    data: null,
  });

  const isRTL = lang === 'ur';

  // Listen to Firebase Auth state for real session persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setIsAuthenticated(true);
          } else {
            const email = (fbUser.email || '').toLowerCase();
            const isBootstrapAdmin = [
              'ateequrrehman20521@gmail.com',
              'admin@indusacademy.pk',
              'principal@indusacademy.pk',
              'director@indusacademy.pk'
            ].includes(email);

            const fallbackUser: User = {
              id: fbUser.uid,
              name: fbUser.displayName || (email ? email.split('@')[0].toUpperCase() : 'Authorized User'),
              username: email ? email.split('@')[0] : 'user',
              role: isBootstrapAdmin ? 'super_admin' : 'parent',
              email: fbUser.email || undefined,
              status: 'active',
              createdAt: new Date().toISOString(),
            };
            setCurrentUser(fallbackUser);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Error during onAuthStateChanged check:', err);
        }
      } else {
        setCurrentUser(defaultGuestUser);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setCurrentUser(defaultGuestUser);
      setIsAuthenticated(false);
    }
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    document.documentElement.dir = newLang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    saveDatabase(db);
  }, [db]);

  const t = (key: keyof typeof translations.en): string => {
    const dict = getTranslation(lang);
    return dict[key] || translations.en[key] || String(key);
  };

  const dismissSplash = () => {
    setShowSplash(false);
  };

  const openPrintModal = (docType: PrintDocType, data: any) => {
    setPrintModal({ isOpen: true, docType, data });
  };

  const closePrintModal = () => {
    setPrintModal({ isOpen: false, docType: null, data: null });
  };

  // Student Operations
  const addStudent = (studentData: Omit<Student, 'id' | 'regNo'>): Student => {
    const nextReg = getNextRegNo(db.students);
    const newStudent: Student = {
      ...studentData,
      id: `s-${Date.now()}`,
      regNo: nextReg,
    };
    saveStudentToFirestore(newStudent).catch(err => console.warn('Async Firestore sync:', err));
    setDb(prev => {
      const updatedStudents = [newStudent, ...prev.students];
      const withLog = logAction(
        { ...prev, students: updatedStudents },
        currentUser,
        'Student Admission',
        `Admitted ${newStudent.name} (${newStudent.regNo}) to ${newStudent.className}`
      );
      return withLog;
    });
    return newStudent;
  };

  const updateStudent = (student: Student) => {
    saveStudentToFirestore(student).catch(err => console.warn('Async Firestore sync:', err));
    setDb(prev => {
      const updated = prev.students.map(s => s.id === student.id ? student : s);
      return logAction(
        { ...prev, students: updated },
        currentUser,
        'Student Update',
        `Updated profile records for ${student.name} (${student.regNo})`
      );
    });
  };

  const deleteStudent = (id: string) => {
    deleteStudentFromFirestore(id).catch(err => console.warn('Async Firestore sync:', err));
    setDb(prev => {
      const student = prev.students.find(s => s.id === id);
      const filtered = prev.students.filter(s => s.id !== id);
      return logAction(
        { ...prev, students: filtered },
        currentUser,
        'Student Withdrawal',
        `Withdrew/removed student ${student?.name || id}`
      );
    });
  };

  // Teacher Operations
  const addTeacher = (teacherData: Omit<Teacher, 'id' | 'teacherId'>): Teacher => {
    const nextIdNum = db.teachers.length + 1;
    const newTeacher: Teacher = {
      ...teacherData,
      id: `t-${Date.now()}`,
      teacherId: `TCH-KBH-${String(nextIdNum).padStart(2, '0')}`,
    };
    setDb(prev => {
      const updated = [...prev.teachers, newTeacher];
      return logAction(
        { ...prev, teachers: updated },
        currentUser,
        'Teacher Added',
        `Added faculty member ${newTeacher.fullName} (${newTeacher.teacherId})`
      );
    });
    return newTeacher;
  };

  const updateTeacher = (teacher: Teacher) => {
    setDb(prev => {
      const updated = prev.teachers.map(t => t.id === teacher.id ? teacher : t);
      return logAction(
        { ...prev, teachers: updated },
        currentUser,
        'Teacher Update',
        `Updated profile for faculty member ${teacher.fullName}`
      );
    });
  };

  // Attendance
  const saveStudentAttendance = (records: AttendanceRecord[]) => {
    setDb(prev => {
      // Remove any existing records for this student and date to prevent duplicates
      const targetDates = new Set(records.map(r => `${r.studentId}-${r.date}`));
      const filtered = prev.attendanceRecords.filter(r => !targetDates.has(`${r.studentId}-${r.date}`));
      return logAction(
        { ...prev, attendanceRecords: [...records, ...filtered] },
        currentUser,
        'Student Attendance Session',
        `Marked attendance for ${records.length} students`
      );
    });
  };

  const saveTeacherAttendance = (records: TeacherAttendanceRecord[]) => {
    setDb(prev => {
      const targetKeys = new Set(records.map(r => `${r.teacherId}-${r.date}`));
      const filtered = prev.teacherAttendance.filter(r => !targetKeys.has(`${r.teacherId}-${r.date}`));
      return logAction(
        { ...prev, teacherAttendance: [...records, ...filtered] },
        currentUser,
        'Teacher Attendance Session',
        `Recorded faculty attendance for ${records.length} teachers`
      );
    });
  };

  // Fee Generation
  const generateMonthlyFees = (month: string): number => {
    let createdCount = 0;
    setDb(prev => {
      const newInvoices: FeeInvoice[] = [];
      for (const student of prev.students) {
        if (student.status !== 'active') continue;
        const existing = prev.feeInvoices.find(inv => inv.studentId === student.id && inv.month === month);
        if (!existing) {
          const totalPayable = Math.max(0, student.monthlyTuitionFee - student.discount);
          newInvoices.push({
            id: `inv-${Date.now()}-${student.id}`,
            invoiceNo: `INV-${month.replace('-', '')}-${student.rollNo.padStart(3, '0')}`,
            studentId: student.id,
            month,
            tuitionFee: student.monthlyTuitionFee,
            admissionFee: 0,
            annualCharges: 0,
            examFee: 0,
            transportFee: 0,
            libraryFee: 0,
            otherCharges: 0,
            discount: student.discount,
            lateFee: 0,
            totalPayable,
            paidAmount: 0,
            balance: totalPayable,
            status: totalPayable === 0 ? 'paid' : 'unpaid',
            dueDate: `${month}-10`,
          });
          createdCount++;
        }
      }
      return logAction(
        { ...prev, feeInvoices: [...newInvoices, ...prev.feeInvoices] },
        currentUser,
        'Generate Monthly Fees',
        `Generated ${newInvoices.length} invoices for month ${month}`
      );
    });
    return createdCount;
  };

  // Fee Payment Recording
  const recordFeePayment = (paymentData: Omit<FeePayment, 'id' | 'receiptNo'>): FeePayment => {
    const nextReceipt = getNextReceiptNo(db.feePayments);
    const newPayment: FeePayment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      receiptNo: nextReceipt,
    };

    setDb(prev => {
      // Update invoice if linked
      let updatedInvoices = [...prev.feeInvoices];
      if (newPayment.invoiceId) {
        updatedInvoices = updatedInvoices.map(inv => {
          if (inv.id === newPayment.invoiceId) {
            const newPaid = inv.paidAmount + newPayment.amountPaid;
            const newBalance = Math.max(0, inv.totalPayable - newPaid);
            const newStatus = newBalance <= 0 ? 'paid' : newPaid > 0 ? 'partial' : 'unpaid';
            return {
              ...inv,
              paidAmount: newPaid,
              balance: newBalance,
              status: newStatus,
            };
          }
          return inv;
        });
      }

      // Add financial income transaction automatically
      const newTransaction: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        date: newPayment.paymentDate,
        type: 'income',
        category: 'Fee Collection',
        amount: newPayment.amountPaid,
        description: `Fee received: ${newPayment.receiptNo} for month ${newPayment.feeMonth}`,
        referenceId: newPayment.receiptNo,
        paymentMethod: newPayment.paymentMethod,
        recordedBy: newPayment.receivedBy,
      };

      const updated = {
        ...prev,
        feePayments: [newPayment, ...prev.feePayments],
        feeInvoices: updatedInvoices,
        transactions: [newTransaction, ...prev.transactions],
      };

      return logAction(
        updated,
        currentUser,
        'Fee Payment Recorded',
        `Recorded payment of PKR ${newPayment.amountPaid.toLocaleString()} (${newPayment.receiptNo})`
      );
    });

    return newPayment;
  };

  // Exam Result
  const saveExamResult = (result: ExamResult) => {
    setDb(prev => {
      const filtered = prev.examResults.filter(r => !(r.examId === result.examId && r.studentId === result.studentId));
      return logAction(
        { ...prev, examResults: [result, ...filtered] },
        currentUser,
        'Exam Result Saved',
        `Recorded marks for student ${result.rollNo} (Score: ${result.percentage}%)`
      );
    });
  };

  // Homework
  const addHomework = (hw: Omit<Homework, 'id'>) => {
    const newHw: Homework = { ...hw, id: `hw-${Date.now()}` };
    setDb(prev => logAction(
      { ...prev, homework: [newHw, ...prev.homework] },
      currentUser,
      'Homework Assigned',
      `Assigned homework for ${hw.subject} to class ${hw.classId}`
    ));
  };

  // Announcements
  const addAnnouncement = (ann: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = { ...ann, id: `ann-${Date.now()}` };
    setDb(prev => logAction(
      { ...prev, announcements: [newAnn, ...prev.announcements] },
      currentUser,
      'Announcement Posted',
      `Posted notice: ${ann.title}`
    ));
  };

  // Transactions
  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = { ...tx, id: `tx-${Date.now()}` };
    setDb(prev => logAction(
      { ...prev, transactions: [newTx, ...prev.transactions] },
      currentUser,
      'Financial Entry',
      `${tx.type.toUpperCase()}: ${tx.category} - PKR ${tx.amount.toLocaleString()}`
    ));
  };

  // Salary
  const processSalaryPayment = (salaryData: Omit<SalaryRecord, 'id' | 'slipNo'>) => {
    const slipNo = `SLIP-${salaryData.month.replace('-', '')}-${String(db.salaryRecords.length + 1).padStart(2, '0')}`;
    const newRecord: SalaryRecord = {
      ...salaryData,
      id: `sal-${Date.now()}`,
      slipNo,
    };
    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: salaryData.paymentDate,
      type: 'expense',
      category: 'Teacher Salary',
      amount: salaryData.netPaid,
      description: `Disbursed salary slip ${slipNo} for month ${salaryData.month}`,
      referenceId: slipNo,
      paymentMethod: 'Bank / Cash',
      recordedBy: currentUser.name,
    };
    setDb(prev => logAction(
      { 
        ...prev, 
        salaryRecords: [newRecord, ...prev.salaryRecords],
        transactions: [newTx, ...prev.transactions]
      },
      currentUser,
      'Salary Disbursed',
      `Paid salary slip ${slipNo} (Net PKR ${salaryData.netPaid.toLocaleString()})`
    ));
  };

  // Library
  const issueBook = (bookId: string, studentId: string, dueDate: string) => {
    const newIssue: BookIssue = {
      id: `iss-${Date.now()}`,
      bookId,
      studentId,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      status: 'borrowed',
    };
    setDb(prev => {
      const updatedBooks = prev.libraryBooks.map(b => {
        if (b.id === bookId && b.availableQuantity > 0) {
          return { ...b, availableQuantity: b.availableQuantity - 1 };
        }
        return b;
      });
      return logAction(
        { ...prev, libraryBooks: updatedBooks, bookIssues: [newIssue, ...prev.bookIssues] },
        currentUser,
        'Library Book Issued',
        `Issued book ${bookId} to student ${studentId}`
      );
    });
  };

  const returnBook = (issueId: string) => {
    setDb(prev => {
      const issue = prev.bookIssues.find(i => i.id === issueId);
      if (!issue) return prev;
      const updatedIssues = prev.bookIssues.map(i => i.id === issueId ? { ...i, status: 'returned' as const, returnDate: new Date().toISOString().split('T')[0] } : i);
      const updatedBooks = prev.libraryBooks.map(b => b.id === issue.bookId ? { ...b, availableQuantity: b.availableQuantity + 1 } : b);
      return logAction(
        { ...prev, libraryBooks: updatedBooks, bookIssues: updatedIssues },
        currentUser,
        'Library Book Returned',
        `Returned book from issue record ${issueId}`
      );
    });
  };

  // Settings & Backup
  const updateSettings = (settings: AcademySettings) => {
    setDb(prev => logAction(
      { ...prev, settings },
      currentUser,
      'Settings Updated',
      'Updated academy operational configurations'
    ));
  };

  const exportDatabaseJSON = () => {
    const jsonStr = JSON.stringify(db, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `INDUS_ACADEMY_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.settings || !parsed.students) {
        return false;
      }
      setDb(parsed);
      saveDatabase(parsed);
      return true;
    } catch {
      return false;
    }
  };

  const resetDatabase = () => {
    const initial = getDefaultDatabase();
    setDb(initial);
    saveDatabase(initial);
  };

  const unreadCount = db.announcements.length;

  return (
    <AppContext.Provider
      value={{
        db,
        currentUser,
        setCurrentUser,
        isAuthenticated,
        isAuthLoading,
        loginUser,
        logout,
        lang,
        setLang,
        t,
        isRTL,
        activeTab,
        setActiveTab,
        showSplash,
        dismissSplash,
        globalSearch,
        setGlobalSearch,
        unreadCount,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        saveStudentAttendance,
        saveTeacherAttendance,
        generateMonthlyFees,
        recordFeePayment,
        saveExamResult,
        addHomework,
        addAnnouncement,
        addTransaction,
        processSalaryPayment,
        issueBook,
        returnBook,
        updateSettings,
        exportDatabaseJSON,
        importDatabaseJSON,
        resetDatabase,
        printModal,
        openPrintModal,
        closePrintModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
