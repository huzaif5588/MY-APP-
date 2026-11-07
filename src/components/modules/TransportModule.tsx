import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bus, Phone, Users, ShieldCheck } from 'lucide-react';

export const TransportModule: React.FC = () => {
  const { db, t } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 font-display">
          {t('transport')}
        </h2>
        <p className="text-xs text-slate-500">
          Academy fleet, driver contacts, regional transit routes, and student transport allocations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {db.transportVehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    {v.vehicleNumber}
                  </span>
                  <h3 className="font-bold text-base text-slate-900 mt-2 font-display">{v.routeName}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Bus className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Driver:</span>
                  <strong className="text-slate-800">{v.driverName}</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Driver Contact:</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {v.driverPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Route Fee:</span>
                  <span className="font-mono font-bold text-emerald-700">PKR {v.monthlyFeePerStudent} / student</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Seating Capacity:</span>
              <span className="font-mono font-bold text-slate-900">
                {v.allocatedStudentsCount} / {v.capacity} Passengers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
