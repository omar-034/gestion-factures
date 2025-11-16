// components/Dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <Icon className="text-gray-400" size={40} />
    </div>
  </div>
);

export default StatCard;