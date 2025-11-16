// components/Dashboard/StatCard.jsx
import React from 'react';

const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-l-4 transform hover:-translate-y-1" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-500 text-xs sm:text-sm font-medium mb-1">{title}</p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 break-words">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className="ml-4 flex-shrink-0">
        <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
          <Icon style={{ color }} size={28} className="sm:w-8 sm:h-8" />
        </div>
      </div>
    </div>
  </div>
);

export default StatCard;