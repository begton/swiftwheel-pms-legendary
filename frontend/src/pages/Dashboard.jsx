import React, { useEffect, useState } from 'react';
import api from '../api';

const StatCard = ({ label, value, sub, color }) => (
  <div className="card p-5">
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">{label}</p>
    <p className={`text-3xl font-bold ${color || 'text-white'}`}>{value}</p>
    {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/reports/stats').then(res => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">SwiftWheels Promotion & Marketing Subsystem</p>
      </div>

      {stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Vehicles" value={stats.totalVehicles} sub={`${stats.availableVehicles} available`} />
          <StatCard label="Total Customers" value={stats.totalCustomers} sub={`${stats.activeCustomers} active`} color="text-gray-200" />
          <StatCard label="Total Promotions" value={stats.totalPromotions} sub={`${stats.activePromotions} active`} color="text-gray-200" />
          <StatCard label="Available Vehicles" value={stats.availableVehicles} color="text-green-400" />
          <StatCard label="Active Customers" value={stats.activeCustomers} color="text-green-400" />
          <StatCard label="Active Promotions" value={stats.activePromotions} color="text-green-400" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-3 bg-gray-800 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-800 rounded w-16"></div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-5">
        <p className="text-gray-300 font-semibold mb-1">About This System</p>
        <p className="text-gray-500 text-sm leading-relaxed">
          SwiftWheels PMS manages promotions and marketing for vehicle fleet operations in Huye City, Rwanda.
          Use the sidebar to manage vehicles, customers, promotions, and generate reports.
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-[#111] rounded-lg p-3 border border-[#222]">
            <p className="text-gray-400 font-medium">Quick Actions</p>
            <ul className="text-gray-500 mt-2 space-y-1 text-xs">
              <li>→ Add a new vehicle in <span className="text-gray-300">Vehicles</span></li>
              <li>→ Register a customer in <span className="text-gray-300">Customers</span></li>
              <li>→ Create a promotion in <span className="text-gray-300">Promotions</span></li>
              <li>→ View full report in <span className="text-gray-300">Reports</span></li>
            </ul>
          </div>
          <div className="bg-[#111] rounded-lg p-3 border border-[#222]">
            <p className="text-gray-400 font-medium">Assessment Info</p>
            <ul className="text-gray-500 mt-2 space-y-1 text-xs">
              <li>TSS National Integrated Assessment</li>
              <li>Year: 2025-2026</li>
              <li>Stack: Node.js + React.js</li>
              <li>DB: MySQL (XAMPP)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
