# INDUS ACADEMY – KALABAGH
## Production Academy Management System & Android Deployment Guide
**Director & Principal: Sir Noman**  
**Location: Kalabagh, Mianwali, Pakistan**  
**Tagline: LEARN • GROW • SUCCEED**  
**Version: 1.0 Production Release**

---

### 1. System Overview
Indus Academy Management System is an enterprise-grade ERP designed specifically for the daily administrative, academic, financial, and parent-communication operations of Indus Academy in Kalabagh.

The software offers dual deployment:
1. **Instant Android PWA (WebAPK)**: Installable directly onto any Android phone or tablet from Google Chrome, featuring offline data persistence, touch navigation, native splash screen, and full-screen display.
2. **Flutter Clean Architecture Native Android Project**: Located in `/flutter_indus_academy` for compiling standalone APKs using Flutter & Android Studio.

---

### 2. User Roles & Access Control
- **Super Admin**: Full unrestricted access across all 17 modules, audit trails, system configuration, JSON backup, and database restore.
- **Principal (Sir Noman)**: Student management, faculty coordination, daily attendance sessions, examination management, result card publishing, and official circulars.
- **Accountant**: Tuition fee invoice generation, payment receipts (Cash, Bank Transfer, EasyPaisa, JazzCash), expense ledger recording, faculty payroll slips, and fee defaulters tracking with WhatsApp reminders.
- **Teachers**: Assigned class attendance marking, subject marks entry, daily homework assignment, and timetable schedule.
- **Parents**: Dedicated portal for linked children, real-time attendance %, fee dues and verified receipt downloads, exam result cards, and homework diary.

---

### 3. Complete Module Architecture
1. **Dashboard**: Live metrics, today's attendance rate, monthly revenue recoveries vs operational expenses, fee collection trends, and class distribution charts.
2. **Student Admission & Records**: Registration numbers formatted as `IA-KBH-2026-XXXX`, photo allotment, class assignment, sibling discounts, ID card generator, and admission forms.
3. **Faculty & Staff Management**: Qualifications, experience, assigned classes & subjects, monthly basic salaries, bonus/deduction tracking, and salary slips.
4. **Student & Faculty Attendance**: Date-wise attendance session recording (Present, Absent, Late, Leave), bulk "All Present" trigger, duplicate prevention, and monthly attendance registers.
5. **Fee Management**: Automatic monthly fee invoice generation, partial and full payments, transaction reference IDs (`RCP-2026-XXXXX`), official printable receipts, and fee defaulters list with direct WhatsApp message links.
6. **Examinations & Results**: Term schedules, subject-wise marks entry, automated percentage, letter grades (A+, A, B, C, D, Fail), class ranks, and printable official Result Cards.
7. **Classes & Curriculum**: Class tiers from Nursery through Class 10 (Science), section allocations, and class teacher designations.
8. **Timetable**: 8-period weekly schedule (Monday–Saturday) with period start/end timings, break interval, and teacher conflict detection.
9. **Homework Diary**: Class-wise assignments, submission deadlines, instructions, and parent notifications.
10. **Parent Portal**: Secure view restricted to linked children, fee balances, printable receipts, and report cards.
11. **Accounts & Expenses**: Financial ledger recording utility bills (FESCO), rent, stationery, maintenance, lab chemicals, and fuel expenses.
12. **Library**: Book catalog, shelf locations, borrowing tracking, and due date monitoring.
13. **Transport**: Fleet vehicles, routes across Kalabagh (Mari Indus, Daud Khel, Kukranwala), driver contacts, and route fees.
14. **Inventory**: Assets, laboratory microscopes, IT lab computers, and low stock warnings.
15. **Reports & Exports**: Filterable reports with 1-click export to Excel (CSV) and printable documents.
16. **Announcements**: Bilingual notices (English and Urdu) with pin-to-top option.
17. **Android & APK Center**: Offline setup, PWA installation button, and Flutter code.
18. **Settings & Backup**: Administrative parameters, manual JSON backup export, and backup file restore.

---

### 4. Official Document Printing
All documents are formatted for standard A4 printing and Android PDF export:
- **Fee Receipt**: With official Academy emblem, receipt number, student particulars, fee breakdown, and Accountant/Principal signature lines.
- **Student ID Card**: Front & back badges with student details and emergency contacts.
- **Result Card**: Subject-wise obtained/max marks table, percentage, letter grade, rank, and Principal Sir Noman signature.
- **Admission Form**: Official enrollment agreement.
- **Salary Slip**: Faculty payroll disbursement statement.
- **Character, Leaving & Bonafide Certificates**: Official letterhead certifications.

---

### 5. Building the Native Flutter Android APK
To compile the standalone APK from the source code in `/flutter_indus_academy`:

```bash
cd flutter_indus_academy
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter build apk --release --split-per-abi
```

Generated APK location:
`flutter_indus_academy/build/app/outputs/flutter-apk/app-release.apk`
