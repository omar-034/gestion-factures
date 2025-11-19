// components/Dashboard/Dashboard.jsx - Mis à jour avec Marchés
import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, Users } from 'lucide-react';
import StatCard from './StatCard';
import MarcheDashboard from '../Marches/MarcheDashboard';
import { getEnrichedLoads, getDriverStats, formatNumber, sortPaymentsByDate, getRecentPayments } from '../../utils/calculations';

const Dashboard = ({ loads, drivers, payments, stats, onViewMarcheDetails }) => {
  const enrichedLoads = getEnrichedLoads(loads, payments);
  const driverStats = getDriverStats(drivers, loads, payments);
  const recentPayments = getRecentPayments(payments, loads, 5);

  // Trier les chauffeurs par date du dernier chargement (du plus récent au plus ancien)
  const sortedDriverStats = [...driverStats].sort((a, b) => 
    new Date(b.lastLoadDate) - new Date(a.lastLoadDate)
  );

  // Fonction pour normaliser la méthode de paiement
  const getPaymentMethodInfo = (paymentMethod) => {
    const method = String(paymentMethod || '').toLowerCase().trim();
    
    if (method.includes('espèce') || method === 'espèces' || method === 'cash') {
      return { label: 'Espèces', class: 'bg-blue-100 text-blue-700' };
    } else if (method.includes('mobile') || method.includes('money')) {
      return { label: 'Mobile Money', class: 'bg-orange-100 text-orange-700' };
    } else if (method.includes('virement')) {
      return { label: 'Virement', class: 'bg-purple-100 text-purple-700' };
    } else if (method.includes('cheque') || method.includes('chèque')) {
      return { label: 'Chèque', class: 'bg-green-100 text-green-700' };
    } else {
      return { label: `Autre (${paymentMethod})`, class: 'bg-gray-100 text-gray-700' };
    }
  };

  // Calculer le montant restant pour chaque paiement
  const getRemainingAmount = (payment) => {
    const load = loads.find(l => l.id === (payment.load_id || payment.loadId));
    if (!load) return 0;
    
    const loadTotal = load.total_amount || load.totalAmount || 0;
    const loadPayments = payments.filter(p => (p.load_id || p.loadId) === load.id);
    const totalPaid = loadPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    
    return loadTotal - totalPaid;
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Tableau de Bord</h2>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          icon={DollarSign} 
          title="Montant Total" 
          value={`${formatNumber(stats.totalAmount)} FCFA`} 
          color="#10b981"
          subtitle={`${stats.loadsCount} chargement(s)`}
        />
        <StatCard 
          icon={TrendingUp} 
          title="Total Payé" 
          value={`${formatNumber(stats.totalPaid)} FCFA`} 
          color="#3b82f6"
          subtitle={`${stats.paymentsCount} paiement(s)`}
        />
        <StatCard 
          icon={AlertCircle} 
          title="Solde Restant" 
          value={`${formatNumber(stats.totalRemaining)} FCFA`} 
          color="#f59e0b"
        />
        <StatCard 
          icon={Users} 
          title="Chauffeurs" 
          value={formatNumber(stats.driversCount)} 
          color="#8b5cf6"
        />
      </div>

      {/* Section Marchés Actifs */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-1">
          <MarcheDashboard onViewDetails={onViewMarcheDetails} />
        </div>

        {/* Derniers Paiements */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Derniers Paiements</h3>
            <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
              {recentPayments.length}
            </span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentPayments.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">💰</div>
                <p className="text-gray-500 text-sm">Aucun paiement enregistré</p>
              </div>
            ) : (
              recentPayments.map(payment => {
                const methodInfo = getPaymentMethodInfo(payment.paymentMethod);
                const remainingAmount = getRemainingAmount(payment);
                
                return (
                  <div
                    key={payment.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-green-50 rounded-lg hover:shadow-md transition border border-gray-100"
                  >
                    <div className="flex-1 mb-2 sm:mb-0">
                      <p className="font-semibold text-gray-800">{payment.driverName}</p>
                      <p className="text-xs sm:text-sm text-gray-500">Chargement #{payment.loadNumber}</p>
                      <p className="text-xs text-gray-400">{payment.origin} → {payment.destination}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payment.created_at || payment.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-green-600 text-sm sm:text-base">
                        {formatNumber(payment.amount)} FCFA
                      </p>
                      <p className="text-xs sm:text-sm text-blue-600">
                        Total: {formatNumber(payment.loadTotal)} FCFA
                      </p>
                      <p className="text-xs sm:text-sm text-orange-600 font-semibold">
                        Reste: {formatNumber(remainingAmount)} FCFA
                      </p>
                      <span className={`inline-block text-xs px-2 py-1 rounded-full mt-1 ${methodInfo.class}`}>
                        {methodInfo.label}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Top Chauffeurs */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800">Top Chauffeurs</h3>
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded-full">
            {sortedDriverStats.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {sortedDriverStats.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <div className="text-gray-400 mb-2">👤</div>
              <p className="text-gray-500 text-sm">Aucun chauffeur enregistré</p>
            </div>
          ) : (
            sortedDriverStats.slice(0, 6).map((driver, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg hover:shadow-md transition border border-gray-100">
                <div className="flex items-center gap-3 mb-2 sm:mb-0">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {driver.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{driver.name}</p>
                    <p className="text-xs text-gray-500">{driver.phone}</p>
                    <p className="text-xs text-gray-400">{driver.totalLoads} chargement(s)</p>
                    {driver.lastLoadDate && (
                      <p className="text-xs text-gray-500 mt-1">
                        Dernier: {new Date(driver.lastLoadDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-600">Total: {formatNumber(driver.totalAmount)} FCFA</p>
                  <p className="text-xs sm:text-sm text-green-600">Payé: {formatNumber(driver.totalPaid)} FCFA</p>
                  <p className="font-bold text-orange-600 text-sm">Reste: {formatNumber(driver.remaining)} FCFA</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;