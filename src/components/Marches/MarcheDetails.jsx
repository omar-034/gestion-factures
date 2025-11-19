// src/components/Marches/MarcheDetails.jsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Package, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { marchesService } from '../../services/marches.service';

const MarcheDetails = ({ marcheId, onBack }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [marcheId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await marchesService.getStats(marcheId);
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
      alert('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (number) => {
    return Number(number).toLocaleString('fr-FR');
  };

  const getProgressColor = (taux) => {
    if (taux >= 100) return 'bg-green-500';
    if (taux >= 75) return 'bg-blue-500';
    if (taux >= 50) return 'bg-yellow-500';
    if (taux >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'Terminé': return 'bg-blue-100 text-blue-800';
      case 'Suspendu': return 'bg-orange-100 text-orange-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Erreur lors du chargement des détails</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          Retour
        </button>
      </div>
    );
  }

  const { marche, destinations, taux_execution_global, total_requis, total_livre } = stats;

  return (
    <div className="space-y-6">
      {/* Bouton retour */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
      >
        <ArrowLeft size={20} />
        Retour aux marchés
      </button>

      {/* En-tête */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {marche.nom}
            </h1>
            <p className="text-gray-600 mb-3">Référence: {marche.reference}</p>
            <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(marche.statut)}`}>
              {marche.statut}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={20} />
            <div className="text-sm">
              <p className="font-semibold">
                {new Date(marche.date_debut).toLocaleDateString('fr-FR')}
              </p>
              {marche.date_fin && (
                <p>→ {new Date(marche.date_fin).toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          </div>
        </div>

        {marche.description && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-gray-700">{marche.description}</p>
          </div>
        )}
      </div>

      {/* Progression globale */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Progression Globale</h3>
            <p className="text-blue-100 text-sm">
              {total_livre} / {total_requis} chargements livrés
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold">
              {taux_execution_global.toFixed(1)}%
            </p>
            <p className="text-blue-100 text-sm">d'exécution</p>
          </div>
        </div>
        
        <div className="w-full bg-blue-900 bg-opacity-50 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-500"
            style={{ width: `${Math.min(taux_execution_global, 100)}%` }}
          />
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-3 rounded-lg">
              <MapPin className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {destinations.length}
              </p>
              <p className="text-sm text-gray-600">Destinations</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {destinations.filter(d => d.taux_execution >= 100).length}
              </p>
              <p className="text-sm text-gray-600">Complétées</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-3 rounded-lg">
              <AlertCircle className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {destinations.filter(d => d.taux_execution < 100).length}
              </p>
              <p className="text-sm text-gray-600">En cours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Détails par destination */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package size={24} className="text-blue-600" />
          Détails par Destination
        </h3>

        <div className="space-y-4">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-gray-900">
                    {dest.destination}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {dest.quantite_livree} / {dest.quantite_requise} chargements livrés
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {dest.taux_execution.toFixed(1)}%
                  </p>
                  {dest.taux_execution >= 100 && (
                    <div className="flex items-center justify-end gap-1 text-green-600 text-sm mt-1">
                      <CheckCircle size={16} />
                      <span>Complété</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                <div
                  className={`h-full transition-all duration-500 ${getProgressColor(dest.taux_execution)}`}
                  style={{ width: `${Math.min(dest.taux_execution, 100)}%` }}
                />
              </div>

              {/* Chargements associés */}
              {dest.loads && dest.loads.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Voir les {dest.loads.length} chargement(s)
                  </summary>
                  <div className="mt-3 space-y-2 pl-4">
                    {dest.loads.map((load, loadIndex) => (
                      <div
                        key={loadIndex}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                      >
                        <div>
                          <p className="font-medium">
                            #{load.load_number} - {load.driver_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(load.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatNumber(load.total_amount)} FCFA
                          </p>
                          <p className="text-xs text-gray-500">
                            {load.quantite} tonnes
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarcheDetails;