import React from 'react';
import { useApp } from '../../context/AppContext';
import { Package, AlertTriangle, CheckCircle, Shield } from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { db, t } = useApp();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 font-display">
          {t('inventory')}
        </h2>
        <p className="text-xs text-slate-500">
          Academy institutional assets, science laboratory hardware, IT lab systems, and stationery stocks
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B192C] text-white">
              <tr>
                <th className="p-3">Asset Name</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">In Stock</th>
                <th className="p-3">Location</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Last Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {db.inventory.map(item => {
                const isLow = item.quantity <= item.minStockAlert;

                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900">{item.itemName}</td>
                    
                    <td className="p-3">
                      <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    </td>

                    <td className="p-3 text-center font-mono font-bold text-slate-800">
                      {item.quantity} {item.unit}
                    </td>

                    <td className="p-3 text-slate-600">{item.location}</td>

                    <td className="p-3 text-center">
                      {isLow ? (
                        <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Low Stock</span>
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          Adequate
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono text-slate-500">{item.lastUpdated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
