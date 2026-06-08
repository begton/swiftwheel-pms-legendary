import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const perfColor = (p) => {
  const map = { Excellent: 'text-green-400', Good: 'text-blue-400', Average: 'text-yellow-400', Poor: 'text-red-400' };
  return map[p] || 'text-gray-400';
};

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/reports/customer-promotions')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load report'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = data.filter(r =>
    search === '' ||
    r.CustomerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.VehicleBrand?.toLowerCase().includes(search.toLowerCase()) ||
    r.VehicleModel?.toLowerCase().includes(search.toLowerCase()) ||
    r.PromotionTitle?.toLowerCase().includes(search.toLowerCase())
  );

  const printReport = () => window.print();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Report</h1>
          <p className="text-gray-500 text-sm mt-0.5">Customers & applicable promotions — {filtered.length} rows</p>
        </div>
        <button onClick={printReport} className="btn-secondary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>

      {/* Report Info */}
      <div className="card p-4 mb-4 border-l-2 border-gray-500">
        <p className="text-gray-400 text-sm font-medium">Report: All Customers × All Active Promotions</p>
        <p className="text-gray-600 text-xs mt-1">Shows active customers and active promotions linked to vehicles. Fields: Customer Name, Vehicle Brand, Vehicle Model, Promotion Title, Discount Value, Performance.</p>
      </div>

      <div className="card p-3 mb-4">
        <input className="input-field" placeholder="Filter by customer, brand, model, promotion..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                {['Customer Name', 'Phone', 'Status', 'Vehicle Brand', 'Vehicle Model', 'Plate No.', 'Promotion Title', 'Discount Type', 'Discount Value', 'Performance'].map(h => (
                  <th key={h} className="text-left text-gray-500 text-xs font-medium uppercase tracking-wider px-3 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-[#1e1e1e]">
                  {[...Array(10)].map((_, j) => <td key={j} className="px-3 py-3"><div className="h-3 bg-gray-800 rounded animate-pulse w-14"></div></td>)}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-10 text-center text-gray-600">No data found. Ensure there are active customers and promotions linked to vehicles.</td></tr>
              ) : filtered.map((r, i) => (
                <tr key={i} className="border-b border-[#1a1a1a] hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-3 py-2.5 text-gray-200 font-medium whitespace-nowrap">{r.CustomerName}</td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">{r.PhoneNumber}</td>
                  <td className="px-3 py-2.5"><span className="badge-active">{r.CustomerStatus}</span></td>
                  <td className="px-3 py-2.5 text-gray-300">{r.VehicleBrand}</td>
                  <td className="px-3 py-2.5 text-gray-400">{r.VehicleModel}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{r.Plate_Number}</td>
                  <td className="px-3 py-2.5 text-gray-300 text-xs whitespace-nowrap">{r.PromotionTitle}</td>
                  <td className="px-3 py-2.5"><span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">{r.Discount_Type}</span></td>
                  <td className="px-3 py-2.5 text-gray-300 font-mono text-xs">{Number(r.Discount_Value).toLocaleString()}</td>
                  <td className="px-3 py-2.5 font-medium text-xs"><span className={perfColor(r.Performance)}>{r.Performance}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
