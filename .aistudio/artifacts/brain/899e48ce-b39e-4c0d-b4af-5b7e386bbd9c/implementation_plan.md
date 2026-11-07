# Firebase Phone OTP & Dual-Layer CAPTCHA Verification Flow

A secure, production-grade phone authentication architecture for Indus Academy – Kalabagh integrating Firebase `signInWithPhoneNumber`, a dual-layer security CAPTCHA system, and authoritative Firestore role verification before granting portal access.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following technical choices were aligned and confirmed in Phase 1:

- **Confirmed Decision 1 (Dual-Layer CAPTCHA)**: The user will first solve the custom high-contrast distorted alphanumeric CAPTCHA widget. Only after successful custom challenge validation is the Firebase `RecaptchaVerifier` triggered.
- **Confirmed Decision 2 (Hybrid Verification Mode)**: Full support for both live Firebase carrier SMS dispatch and pre-registered institutional test numbers (`+92 300 5559988`, `+92 300 7891234`, `+92 302 4443322`, `+92 301 5551234`) with instant test OTPs (`123456`) to ensure frictionless testing in development and sandbox environments.
- **Confirmed Decision 3 (Graceful Fallback & Domain Setup Guidance)**: If the cloud preview environment encounters Firebase `auth/unauthorized-domain` or carrier network limits, the interface displays an informative troubleshooting alert detailing how to authorize domains in the Firebase Console while permitting development test bypass without blocking development.

---

## 1. Overview & Core Concept

- **What It Does**: Upgrades the mobile phone login in `src/features/authentication/LoginScreen.tsx` to utilize Firebase Authentication's `signInWithPhoneNumber` and `RecaptchaVerifier`. Users input their Pakistani mobile number, pass an interactive visual bot challenge, receive an official OTP verification code, enter the 6-digit code into auto-advancing verification boxes, and have their phone number verified against server Firestore permissions before landing on their designated dashboard.
- **Target Audience / Persona**: Academy Administrators (Sir Noman), Teachers, Accountants, and Parents accessing their institutional portals via mobile or desktop.
- **Key Value**: Guarantees phone number authenticity, prevents automated bot attacks through dual validation, and strictly maintains role-based isolation without allowing unauthorized users into sensitive academic or financial dashboards.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Portal Selection & Phone Tab**:
   - User chooses portal (Admin, Teacher, Accountant, Parent) with role-distinct palettes.
   - Selects the "Mobile Phone & OTP" method tab.
   - Enters mobile phone in E.164 Pakistani format (`+92 3XX XXXXXXX`).

2. **Dual-Layer Bot Challenge**:
   - High-contrast visual CAPTCHA box renders distorted alphanumeric characters with strike-through styling.
   - User types the captcha; dynamic client-side validation runs instantly with audio/visual refresh capability.
   - Once verified, the primary CTA activates: *"Send 6-Digit Verification Code (OTP)"*.

3. **Firebase reCAPTCHA & SMS Dispatch**:
   - Hidden or badge-level `recaptcha-container` mounts.
   - Calls Firebase `signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)`.
   - Transition to 6-digit OTP code entry view with countdown timer (60s), SMS status banner, and instant test helper.

4. **OTP Verification & Server Role Guard**:
   - User inputs 6-digit code across discrete focus-navigated boxes.
   - Calls `confirmationResult.confirm(otpCode)` to establish authenticated Firebase session.
   - Fetches Firestore server profile (`users/{uid}`) to verify the phone belongs to the chosen role.
   - If verified, forwards to authorized dashboard; if mismatched, triggers the 403 Access Denied barrier.

### Visual Styling & Role Palette Consistency
- **Admin**: Obsidian & Royal Amber (`border-amber-500/50`, `text-amber-400`, `bg-amber-500`).
- **Teacher**: Deep Navy & Cyan (`border-blue-500/50`, `text-blue-400`, `bg-blue-600`).
- **Accountant**: Emerald & Mint (`border-emerald-500/50`, `text-emerald-400`, `bg-emerald-600`).
- **Parent**: Royal Purple & Lavender (`border-purple-500/50`, `text-purple-400`, `bg-purple-600`).
- **Numeric & Form Typography**: Tabular monospace numerals (`font-mono`) across OTP inputs, countdown timers, and CAPTCHA digits.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Layer CAPTCHA Sequence**
  - *Chosen Approach*: User solves custom on-screen CAPTCHA first; on success, invisible Firebase `RecaptchaVerifier` executes.
  - *Why*: Prevents bot spam from consuming Firebase SMS quotas and carrier fees before invoking Google reCAPTCHA.
  - *Alternatives Considered*: Native reCAPTCHA v2 checkbox only (often blocked by restrictive iframe third-party cookie policies in sandboxes).

- **Decision 2: Hybrid Testing Mode with Registered Institutional Directory**
  - *Chosen Approach*: Official phone numbers for each role are pre-wired to support instant testing in preview while sending real SMS when carrier capabilities and Firebase domain allowlists are configured.
  - *Why*: Allows immediate evaluation by QA/stakeholders without waiting for SMS gateway delivery delays.

- **Decision 3: Server-Authoritative Profile Lookup**
  - *Chosen Approach*: `authService.ts` verifies `userProfile` via `getDocFromServer(doc(db, 'users', uid))` immediately after OTP confirmation.
  - *Why*: Prevents client-side manipulation from granting administrative or financial privileges to an arbitrary phone number.

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Authentication Sequence

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LoginScreen.tsx (UI)                            │
│                                                                        │
│  ┌───────────────────────┐              ┌───────────────────────────┐  │
│  │ Custom CAPTCHA Widget │              │   6-Digit OTP Boxes UI    │  │
│  │ (Distorted Canvas/Txt)│              │ (Auto-Focus & Resend 60s) │  │
│  └──────────┬────────────┘              └─────────────┬─────────────┘  │
└─────────────┼─────────────────────────────────────────┼────────────────┘
              │ 1. Validate custom code                 │ 4. Submit OTP
              ▼                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      authService.ts (Firebase Auth)                    │
│                                                                        │
│  2. new RecaptchaVerifier('recaptcha-container', { size: 'invisible' })│
│  3. signInWithPhoneNumber(auth, phoneNumber, appVerifier)             │
│     └── Yields confirmationResult                                     │
│  5. confirmationResult.confirm(otpCode)                                │
│     └── Yields UserCredential (request.auth.uid)                       │
└───────────────────────────────────────────────┬────────────────────────┘
                                                │ 6. Verify Role
                                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Cloud Firestore (Server-Authoritative)                  │
│                                                                        │
│  Collection: /users/{uid}                                              │
│  Verification: userDoc.role === selectedPortal                         │
│  Access Granted: onLoginSuccess(userProfile) ──► Targeted Dashboard    │
│  Access Mismatched: Render AccessDeniedScreen (403 Barrier)            │
└────────────────────────────────────────────────────────────────────────┘
```

### Component & State Mutation Plan

1. **`src/firebase/services/authService.ts`**:
   - `createRecaptchaVerifier(containerId: string)`: Instantiates a `RecaptchaVerifier` with explicit cleanup to prevent duplicate container errors during React re-renders.
   - `sendPhoneVerificationCode(phoneNumber: string, verifier: RecaptchaVerifier)`: Wraps `signInWithPhoneNumber`, captures `ConfirmationResult`, and handles fallback for domain restrictions.
   - `confirmPhoneOtpCode(confirmationResult: ConfirmationResult | null, code: string, portal: UserRole, phone: string)`: Confirms the code with Firebase Auth, executes server-side role validation against `users/{uid}`, updates `lastLogin`, and returns verified `User` profile.

2. **`src/features/authentication/LoginScreen.tsx`**:
   - Embeds `<div id="recaptcha-container"></div>` container outside the form flow.
   - Tracks `confirmationResult` and `isFirebaseRecaptchaReady` in component state.
   - Adds custom CAPTCHA verification check before invoking `sendPhoneVerificationCode`.
   - Renders OTP input field with 6 boxes, paste handler, live resend timer, and explicit error messaging.
   - On successful confirmation, triggers `onLoginSuccess(userProfile)` to transition directly to the authorized dashboard.
