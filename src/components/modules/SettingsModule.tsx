import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, Download, Upload, RefreshCw, 
  ShieldCheck, AlertTriangle, Save, CheckCircle2 
} from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { db, updateSettings, exportDatabaseJSON, importDatabaseJSON, resetDatabase, t } = useApp();

  const [settingsForm, setSettingsForm] = useState(db.settings);
  const [saveMsg, setSaveMsg] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSaveMsg('Settings saved successfully!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        setImportStatus('Backup database successfully restored!');
      } else {
        setImportStatus('Error: Invalid database backup JSON file.');
      }
      setTimeout(() => setImportStatus(''), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 font-display">
          {t('settings')}
        </h2>
        <p className="text-xs text-slate-500">
          Institutional parameters, administrative backup, database restore, and audit verification
        </p>
      </div>

      {saveMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveMsg}</span>
        </div>
      )}

      {importStatus && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs font-semibold">
          {importStatus}
        </div>
      )}

      {/* Academy Operational Parameters */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 font-display mb-4">
          Official Institutional Identity
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Academy Name</label>
              <input
                type="text"
                value={settingsForm.academyName}
                onChange={e => setSettingsForm({ ...settingsForm, academyName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Urdu Academy Name (اردو نام)</label>
              <input
                type="text"
                dir="rtl"
                value={settingsForm.academyNameUrdu}
                onChange={e => setSettingsForm({ ...settingsForm, academyNameUrdu: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-urdu font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Campus Location</label>
              <input
                type="text"
                value={settingsForm.location}
                onChange={e => setSettingsForm({ ...settingsForm, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Director / Principal</label>
              <input
                type="text"
                value={settingsForm.directorName}
                onChange={e => setSettingsForm({ ...settingsForm, directorName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Tagline</label>
              <input
                type="text"
                value={settingsForm.tagline}
                onChange={e => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Current Academic Session</label>
              <input
                type="text"
                value={settingsForm.currentSession}
                onChange={e => setSettingsForm({ ...settingsForm, currentSession: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Official Contact Phone</label>
              <input
                type="text"
                value={settingsForm.phone}
                onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Institutional Email</label>
              <input
                type="email"
                value={settingsForm.email}
                onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow"
            >
              <Save className="w-4 h-4" />
              <span>Save Institutional Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Backup & Restore Center */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export JSON Backup */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Download className="w-4 h-4 text-emerald-600" />
              <h3 className="font-display">Institutional Database Backup</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Download the complete snapshot of all student profiles, attendance histories, fee ledgers, exam marks, and financial transactions as a structured JSON file.
            </p>
          </div>

          <button
            onClick={exportDatabaseJSON}
            className="w-full py-2.5 rounded-lg bg-[#0B192C] text-white font-bold text-xs flex items-center justify-center gap-2 shadow active:scale-95"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Database Backup (.JSON)</span>
          </button>
        </div>

        {/* Restore from JSON */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <h3 className="font-display">Restore Database from Backup</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Upload a previously exported Indus Academy backup JSON file to safely restore all system records.
            </p>
          </div>

          <label className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-300">
            <Upload className="w-4 h-4 text-blue-600" />
            <span>Select Backup File to Restore</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Security & Operational Audit Trail ({db.auditLogs.length} events)</span>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset database to initial pristine demonstration seed data?')) {
                resetDatabase();
              }
            }}
            className="flex items-center gap-1 text-[11px] text-rose-600 hover:underline font-bold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
          {db.auditLogs.map(log => (
            <div key={log.id} className="p-3 flex items-start justify-between gap-3 hover:bg-slate-50">
              <div>
                <div className="font-bold text-slate-900">{log.action}</div>
                <div className="text-slate-600 text-[11px]">{log.details}</div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-slate-400 block">{log.timestamp.slice(0, 19).replace('T', ' ')}</span>
                <span className="text-[10px] font-bold text-amber-600">{log.userName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
