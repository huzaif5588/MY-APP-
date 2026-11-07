import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from '../config';
import { 
  initialStudents, initialTeachers, initialClasses, 
  initialFeeInvoices, initialFeePayments, initialExaminations, 
  initialExamResults, initialHomeworkList, initialAnnouncements, 
  initialFinancialTransactions, initialSettings 
} from '../../data/initialData';

export async function isFirestoreEmpty(): Promise<boolean> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    return snap.empty;
  } catch (err) {
    console.warn('Error checking Firestore emptiness:', err);
    return false;
  }
}

export async function seedFirestoreDatabase(): Promise<{ success: boolean; count: number }> {
  let count = 0;
  try {
    // 1. Settings
    await setDoc(doc(db, 'settings', 'academy_settings'), initialSettings);
    count++;

    // 2. Classes
    for (const c of initialClasses) {
      await setDoc(doc(db, 'classes', c.id), c);
      count++;
    }

    // 3. Teachers
    for (const t of initialTeachers) {
      await setDoc(doc(db, 'teachers', t.id), t);
      count++;
    }

    // 4. Students
    for (const s of initialStudents) {
      await setDoc(doc(db, 'students', s.id), s);
      count++;
    }

    // 5. Fee Vouchers
    for (const inv of initialFeeInvoices) {
      await setDoc(doc(db, 'fee_vouchers', inv.id), inv);
      count++;
    }

    // 6. Fee Payments
    for (const p of initialFeePayments) {
      await setDoc(doc(db, 'fee_payments', p.id), p);
      count++;
    }

    // 7. Results
    for (const r of initialExamResults) {
      await setDoc(doc(db, 'results', r.id), r);
      count++;
    }

    // 8. Homework
    for (const h of initialHomeworkList) {
      await setDoc(doc(db, 'homework', h.id), h);
      count++;
    }

    // 9. Announcements
    for (const a of initialAnnouncements) {
      await setDoc(doc(db, 'announcements', a.id), a);
      count++;
    }

    // 10. Expenses
    for (const ex of initialFinancialTransactions) {
      await setDoc(doc(db, 'expenses', ex.id), ex);
      count++;
    }

    // 11. Authoritative Institutional Test Users (RBAC)
    const seedUsers = [
      {
        id: 'user-admin',
        uid: 'user-admin',
        email: 'admin@indusacademy.pk',
        name: 'Sir Noman Khan (Director & Principal)',
        username: 'admin',
        role: 'super_admin',
        portalType: 'admin',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'user-teacher',
        uid: 'user-teacher',
        email: 'teacher@indusacademy.pk',
        name: 'Sir Tariq Mehmood (Senior Faculty)',
        username: 'teacher',
        role: 'teacher',
        portalType: 'teacher',
        teacherId: 'TCH-01',
        assignedClasses: ['Class 9', 'Class 10'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'user-accountant',
        uid: 'user-accountant',
        email: 'accountant@indusacademy.pk',
        name: 'Rana Asif (Chief Accountant)',
        username: 'accountant',
        role: 'accountant',
        portalType: 'accountant',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'user-parent',
        uid: 'user-parent',
        email: 'parent@indusacademy.pk',
        name: 'Tariq Mehmood Khan (Authorized Parent)',
        username: 'parent',
        role: 'parent',
        portalType: 'parent',
        linkedStudentIds: ['s-01', 's-03'],
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'user-bootstrap-admin',
        uid: 'user-bootstrap-admin',
        email: 'ateequrrehman20521@gmail.com',
        name: 'Ateeq Ur Rehman (Super Admin)',
        username: 'ateeq',
        role: 'super_admin',
        portalType: 'admin',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];

    for (const u of seedUsers) {
      await setDoc(doc(db, 'users', u.id), u);
      count++;
    }

    return { success: true, count };
  } catch (err) {
    console.error('Error seeding Firestore database:', err);
    return { success: false, count };
  }
}
