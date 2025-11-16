// components/Dashboard/Dashboard.jsx
import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, Users } from 'lucide-react';
import StatCard from './StatCard';
import { getEnrichedLoads, getDriverStats } from '../../utils/calculations';

const Dashboard = ({ loads, drivers, payments, stats }) => {
  const enrichedLoads = getEnrichedLoads(loads, payments);
  const driverStats = getDriverStats(drivers, loads, payments);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Tableau de Bord</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon={DollarSign} 
          title="Montant Total" 
          value={`${stats.totalAmount.toFixed(2)} FCFA`} 
          color="#10b981"
          subtitle={`${stats.loadsCount} chargement(s)`}
        />
        <StatCard 
          icon={TrendingUp} 
          title="Total Payé" 
          value={`${stats.totalPaid.toFixed(2)} FCFA`} 
          color="#3b82f6"
          subtitle={`${stats.paymentsCount} paiement(s)`}
        />
        <StatCard 
          icon={AlertCircle} 
          title="Solde Restant" 
          value={`${stats.totalRemaining.toFixed(2)} FCFA`} 
          color="#f59e0b"
        />
        <StatCard 
          icon={Users} 
          title="Chauffeurs" 
          value={stats.driversCount} 
          color="#8b5cf6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Derniers Chargements */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Derniers Chargements</h3>
          <div className="space-y-3">
            {loads.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun chargement enregistré</p>
            ) : (
              enrichedLoads.slice(-5).reverse().map(load => (
                <div key={load.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">{load.driverName}</p>
                    <p className="text-sm text-gray-500">Chargement #{load.loadNumber}</p>
                    <p className="text-xs text-gray-400">{load.origin} → {load.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{load.totalAmount} FCFA</p>
                    <p className="text-sm text-green-600">Payé: {load.totalPaid.toFixed(0)} FCFA</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      load.status === 'Payé' ? 'bg-green-100 text-green-700' : 
                      load.status === 'Non payé' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {load.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chauffeurs - Soldes */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold mb-4">Chauffeurs - Soldes</h3>
          <div className="space-y-3">
            {drivers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun chauffeur enregistré</p>
            ) : (
              driverStats.slice(0, 5).map((driver, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-semibold">{driver.name}</p>
                    <p className="font-semibold">{driver.phone}</p>
                    <p className="text-sm text-gray-500">{driver.totalLoads} chargement(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total: {driver.totalAmount.toFixed(0)} FCFA</p>
                    <p className="text-sm text-green-600">Payé: {driver.totalPaid.toFixed(0)} FCFA</p>
                    <p className="font-bold text-orange-600">Reste: {driver.remaining.toFixed(0)} FCFA</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;