// src/components/Marches/MarcheDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Briefcase, TrendingUp, Target, Eye } from 'lucide-react';
import { marchesService } from '../../services/marches.service';

const MarcheDashboard = ({ onViewDetails }) => {
  const [marchesStats, setMarchesStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarchesStats();
  }, []);

  const loadMarchesStats = async () => {
    try {
      setLoading(true);
      const marches = await marchesService.getActive();
      
      // Charger les stats pour chaque marché actif
      const statsPromises = marches.map(marche => 
        marchesService.getStats(marche.id)
      );
      const stats = await Promise.all(statsPromises);
      
      setMarchesStats(stats);
    } catch (error) {
      console.error('Erreur chargement marchés:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (taux) => {
    if (taux >= 100) return 'bg-green-500';
    if (taux >= 75) return 'bg-blue-500';
    if (taux >= 50) return 'bg-yellow-500';
    if (taux >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressTextColor = (taux) => {
    if (taux >= 100) return 'text-green-600';
    if (taux >= 75) return 'text-blue-600';
    if (taux >= 50) return 'text-yellow-600';
    if (taux >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (marchesStats.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">Marchés Actifs</h3>
          <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full">
            0
          </span>
        </div>
        <div className="text-center py-8">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Aucun marché actif</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase size={24} className="text-blue-600" />
          Marchés Actifs
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
          {marchesStats.length}
        </span>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {marchesStats.map((stat) => (
          <div
            key={stat.marche.id}
            className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
            onClick={() => onViewDetails && onViewDetails(stat.marche)}
          >
            {/* En-tête */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">
                  {stat.marche.nom}
                </h4>
                <p className="text-xs text-gray-500">
                  Réf: {stat.marche.reference}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails && onViewDetails(stat.marche);
                }}
                className="text-blue-600 hover:text-blue-800"
                title="Voir les détails"
              >
                <Eye size={18} />
              </button>
            </div>

            {/* Progression */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Progression</span>
                <span className={`text-sm font-bold ${getProgressTextColor(stat.taux_execution_global)}`}>
                  {stat.taux_execution_global.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getProgressColor(stat.taux_execution_global)}`}
                  style={{ width: `${Math.min(stat.taux_execution_global, 100)}%` }}
                />
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-xs text-gray-600">Destinations</p>
                <p className="text-lg font-bold text-blue-600">
                  {stat.destinations.length}
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <p className="text-xs text-gray-600">Livrés</p>
                <p className="text-lg font-bold text-green-600">
                  {stat.total_livre}
                </p>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <p className="text-xs text-gray-600">Requis</p>
                <p className="text-lg font-bold text-orange-600">
                  {stat.total_requis}
                </p>
              </div>
            </div>

            {/* Destinations critiques (< 50%) */}
            {stat.destinations.filter(d => d.taux_execution < 50).length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-orange-600 font-semibold mb-1">
                  ⚠️ Destinations en retard:
                </p>
                <div className="flex flex-wrap gap-1">
                  {stat.destinations
                    .filter(d => d.taux_execution < 50)
                    .slice(0, 3)
                    .map((dest, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded"
                      >
                        {dest.destination} ({dest.taux_execution.toFixed(0)}%)
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarcheDashboard;