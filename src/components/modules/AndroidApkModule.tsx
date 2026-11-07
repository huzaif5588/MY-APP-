import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { 
  Smartphone, Download, Terminal, ShieldCheck, 
  Database, Code2, CheckCircle2, Copy, ExternalLink,
  Layers, Cpu
} from 'lucide-react';

export const AndroidApkModule: React.FC = () => {
  const { db, t } = useApp();
  const { isInstallable, install, isInstalled } = usePWAInstall();
  const [copiedKey, setCopiedKey] = useState<string>('');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const flutterCommands = `# 1. Clone or extract Indus Academy Flutter Project
cd flutter_indus_academy

# 2. Get dependencies
flutter pub get

# 3. Generate Drift SQLite database code
dart run build_runner build --delete-conflicting-outputs

# 4. Build Production Release APK for Android
flutter build apk --release --split-per-abi

# 5. Generated APK Output Location:
# build/app/outputs/flutter-apk/app-release.apk
# Install directly via adb:
adb install build/app/outputs/flutter-apk/app-release.apk`;

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    function isSuperAdmin() {
      return isAuthenticated() && request.auth.token.role == 'super_admin';
    }
    function isPrincipal() {
      return isAuthenticated() && (request.auth.token.role == 'principal' || isSuperAdmin());
    }
    function isAccountant() {
      return isAuthenticated() && (request.auth.token.role == 'accountant' || isSuperAdmin());
    }
    
    // Students Collection
    match /students/{studentId} {
      allow read: if isAuthenticated();
      allow write: if isPrincipal();
    }
    
    // Fee Invoices and Payments
    match /feeInvoices/{invoiceId} {
      allow read: if isAuthenticated();
      allow write: if isAccountant();
    }
    match /feePayments/{paymentId} {
      allow read: if isAuthenticated();
      allow write: if isAccountant();
    }
  }
}`;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] text-white p-6 shadow-xl border border-amber-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Smartphone className="w-4 h-4" />
              <span>INDUS ACADEMY • ANDROID DEPLOYMENT SUITE</span>
            </div>
            <h1 className="text-2xl font-black font-display">
              Android APK & Flutter Source Architecture
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Install the application instantly as an Android PWA, or compile the Clean Architecture Flutter + Drift SQLite Android APK.
            </p>
          </div>

          <div className="shrink-0">
            {isInstalled ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Installed as Android App</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Install APK / WebAPK Now</span>
              </button>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs">
                Installable via Chrome Menu (Add to Home screen)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Pillars: 1. Native PWA Engine vs 2. Native Flutter Codebase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Pillar 1: Android PWA Engine */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h3 className="font-display">Option 1: Instant Native Android App (PWA)</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Requires <strong>zero compilation</strong>. Runs directly on Android phones with full-screen immersive display, camera photo uploads, offline caching, and instant startup from home screen.
            </p>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Full-screen standalone view (hides browser address bar)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Works offline via Service Worker & Local Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Custom Indus Academy Navy & Gold Launcher Icon</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant Android Print & PDF Receipt Generation</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Target Platform:</span>
            <span className="font-bold text-slate-800">Android 8.0+ (Chrome / Samsung Internet)</span>
          </div>
        </div>

        {/* Pillar 2: Flutter Clean Architecture */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <h3 className="font-display">Option 2: Native Flutter APK Build</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Production Flutter project built with <strong>Clean Architecture</strong>, <strong>Riverpod 2.0</strong>, <strong>GoRouter</strong>, and <strong>Drift (SQLite)</strong> offline persistence.
            </p>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Package ID: <code>com.indusacademy.kalabagh</code></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Local SQLite DB: Drift ORM with full offline caching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>State Management: Riverpod feature-based providers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Material 3 with Navy/Royal Blue/Gold Theme</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Framework:</span>
            <span className="font-bold text-slate-800">Flutter 3.24+ / Dart 3.5+</span>
          </div>
        </div>

      </div>

      {/* Terminal Build Guide & Exact Commands */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-slate-200 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
            <Terminal className="w-4 h-4" />
            <span>Terminal: Build Native Android APK</span>
          </div>

          <button
            onClick={() => copyToClipboard(flutterCommands, 'build_cmds')}
            className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedKey === 'build_cmds' ? 'Copied!' : 'Copy Commands'}</span>
          </button>
        </div>

        <pre className="text-xs font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-950 rounded-lg">
          {flutterCommands}
        </pre>
      </div>

      {/* Firestore Security Rules Blueprint */}
      <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-slate-200 shadow-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Firestore Security Rules (firestore.rules)</span>
          </div>

          <button
            onClick={() => copyToClipboard(firestoreRules, 'rules')}
            className="flex items-center gap-1 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedKey === 'rules' ? 'Copied!' : 'Copy Rules'}</span>
          </button>
        </div>

        <pre className="text-xs font-mono text-amber-300/90 overflow-x-auto p-2 bg-slate-950 rounded-lg">
          {firestoreRules}
        </pre>
      </div>

    </div>
  );
};
