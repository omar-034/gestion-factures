import React from 'react';
import { DollarSign, TrendingUp, AlertCircle, Users, Package, MapPin, Calendar } from 'lucide-react';
import StatCard from './StatCard';
import MarcheDashboard from '../Marches/MarcheDashboard';
import { getEnrichedLoads, formatNumber, getRecentPayments, getRecentLoads, getStatusColor } from '../../utils/calculations';

const Dashboard = ({ loads, drivers, payments, stats, onViewMarcheDetails, userRole }) => {
  const recentPayments = getRecentPayments(payments, loads, 5);
  const recentLoads = getRecentLoads(loads, payments, 10);
  
  // Vérifier si admin
  const showFinancials = userRole === 'admin';

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
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* Cartes de statistiques - Filtrées pour les viewers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Afficher les finances seulement pour les admins */}
        {showFinancials && (
          <>
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
          </>
        )}
        
        {/* Toujours afficher les chauffeurs */}
        <StatCard 
          icon={Users} 
          title="Chauffeurs" 
          value={formatNumber(stats.driversCount)} 
          color="#8b5cf6"
        />

        {/* Afficher le nombre de chargements pour combler l'espace si pas admin */}
        {!showFinancials && (
           <StatCard 
             icon={Package} 
             title="Total Chargements" 
             value={formatNumber(stats.loadsCount)} 
             color="#3b82f6"
           />
        )}
      </div>

      <div className={`grid grid-cols-1 ${showFinancials ? 'xl:grid-cols-3' : 'xl:grid-cols-1'} gap-4 sm:gap-6`}>
        {/* Marchés - Prend toute la largeur si pas de paiements à afficher */}
        <div className="xl:col-span-1">
          <MarcheDashboard onViewDetails={onViewMarcheDetails} />
        </div>

        {/* Derniers Paiements - MASQUÉ pour Viewer */}
        {showFinancials && (
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
        )}
      </div>

      {/* 10 Derniers Chargements - Modifié pour Viewer */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <Package size={24} className="text-blue-600" />
            10 Derniers Chargements
          </h3>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
            {recentLoads.length}
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {recentLoads.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <Package size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 text-sm">Aucun chargement enregistré</p>
            </div>
          ) : (
            recentLoads.map((load) => (
              <div 
                key={load.id} 
                className="flex flex-col p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg hover:shadow-md transition border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {load.driverName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{load.driverName}</p>
                      <p className="text-xs text-gray-500">#{load.loadNumber}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(load.status)}`}>
                    {load.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                  <MapPin size={14} className="flex-shrink-0" />
                  <span className="truncate">{load.origin} → {load.destination}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                  <Calendar size={14} className="flex-shrink-0" />
                  <span>
                    {new Date(load.date || load.created_at).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="text-xs text-gray-600 mb-3">
                  <p>{load.type_chargement} • {load.quantite} tonnes</p>
                </div>

                {/* Financier - MASQUÉ pour Viewer */}
                {showFinancials && (
                  <div className="pt-3 border-t border-gray-200 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-blue-600">{formatNumber(load.totalAmount)} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Payé:</span>
                      <span className="font-bold text-green-600">{formatNumber(load.totalPaid)} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Restant:</span>
                      <span className="font-bold text-orange-600">{formatNumber(load.remaining)} FCFA</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs pt-2">
                      <span className="text-gray-500">
                        {load.paymentsCount} paiement{load.paymentsCount > 1 ? 's' : ''}
                      </span>
                      {load.remaining > 0 && load.remaining <= 100000 && (
                        <span className="text-green-600 font-medium">✓ Presque terminé</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;