import React from 'react';

export default function StatCard({ icon, label, value, suffix = '', color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div>
        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-primaryText break-words">
          {typeof value === 'object' ? JSON.stringify(value) : value}{suffix}
        </div>
        <div className="text-xs sm:text-sm text-gray-600 mt-1">{label}</div>
      </div>
    </div>
  );
}
