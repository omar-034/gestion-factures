// src/components/Marches/MarcheDetails.jsx - Avec détails des chargements
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, TrendingUp, Package, MapPin, CheckCircle, AlertCircle, Truck, Phone, DollarSign } from 'lucide-react';
import { marchesService } from '../../services/marches.service';
import { getStatusColor } from '../../utils/calculations';

const MarcheDetails = ({ marcheId, onBack }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedDestination, setExpandedDestination] = useState(null);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getProgressColor = (taux) => {
    if (taux >= 100) return 'bg-green-500';
    if (taux >= 75) return 'bg-blue-500';
    if (taux >= 50) return 'bg-yellow-500';
    if (taux >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStatusColorForMarche = (statut) => {
    switch (statut) {
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'Terminé': return 'bg-blue-100 text-blue-800';
      case 'Suspendu': return 'bg-orange-100 text-orange-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour compter les chargements par statut pour une destination
  const getLoadStatusCounts = (loads) => {
    const counts = {
      complete: 0,
      enCours: 0,
      enAttente: 0
    };

    loads.forEach(load => {
      switch (load.status) {
        case 'Complété':
          counts.complete++;
          break;
        case 'En cours':
          counts.enCours++;
          break;
        case 'En attente':
          counts.enAttente++;
          break;
      }
    });

    return counts;
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

  // Compter les chargements complétés globalement
  const totalLoadsComplete = destinations.reduce((sum, dest) => {
    return sum + (dest.loads?.filter(l => l.status === 'Complété').length || 0);
  }, 0);

  const totalLoadsEnCours = destinations.reduce((sum, dest) => {
    return sum + (dest.loads?.filter(l => l.status === 'En cours').length || 0);
  }, 0);

  const totalLoadsEnAttente = destinations.reduce((sum, dest) => {
    return sum + (dest.loads?.filter(l => l.status === 'En attente').length || 0);
  }, 0);

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
            <span className={`inline-block text-sm px-3 py-1 rounded-full font-medium ${getStatusColorForMarche(marche.statut)}`}>
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

      {/* Statistiques rapides avec statuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {totalLoadsComplete}
              </p>
              <p className="text-sm text-gray-600">Complétés</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <TrendingUp className="text-yellow-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {totalLoadsEnCours}
              </p>
              <p className="text-sm text-gray-600">En cours</p>
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
                {totalLoadsEnAttente}
              </p>
              <p className="text-sm text-gray-600">En attente</p>
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
          {destinations.map((dest, index) => {
            const statusCounts = getLoadStatusCounts(dest.loads || []);
            const isExpanded = expandedDestination === index;
            
            return (
              <div
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                {/* En-tête de la destination */}
                <div 
                  className="p-4 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setExpandedDestination(isExpanded ? null : index)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <MapPin size={18} className="text-blue-600" />
                        {dest.destination}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {dest.quantite_livree} / {dest.quantite_requise} chargements livrés
                      </p>
                      
                      {/* Compteurs de statuts */}
                      <div className="flex gap-2 mt-2">
                        {statusCounts.complete > 0 && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            ✓ {statusCounts.complete} Complété{statusCounts.complete > 1 ? 's' : ''}
                          </span>
                        )}
                        {statusCounts.enCours > 0 && (
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            ⏳ {statusCounts.enCours} En cours
                          </span>
                        )}
                        {statusCounts.enAttente > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                            ⏸️ {statusCounts.enAttente} En attente
                          </span>
                        )}
                      </div>
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
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressColor(dest.taux_execution)}`}
                      style={{ width: `${Math.min(dest.taux_execution, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Chargements détaillés - Expanded */}
                {isExpanded && dest.loads && dest.loads.length > 0 && (
                  <div className="border-t bg-gray-50 p-4">
                    <h5 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Truck size={18} />
                      Chargements ({dest.loads.length})
                    </h5>
                    <div className="space-y-3">
                      {dest.loads.map((load, loadIndex) => {
                        // Calculer le reste pour ce chargement
                        const totalAmount = load.total_amount || 0;
                        const totalPaid = load.total_paid || 0;
                        const remaining = totalAmount - totalPaid;
                        
                        return (
                          <div
                            key={loadIndex}
                            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
                          >
                            {/* En-tête du chargement */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                  {load.driver_name?.charAt(0) || '?'}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {load.driver_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    #{load.load_number}
                                  </p>
                                </div>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(load.status)}`}>
                                {load.status}
                              </span>
                            </div>

                            {/* Détails du chargement */}
                            <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                              <div>
                                <p className="text-gray-500 text-xs">Date</p>
                                <p className="font-medium text-gray-900">
                                  {formatDate(load.date)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Type</p>
                                <p className="font-medium text-gray-900">
                                  {load.type_chargement || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Quantité</p>
                                <p className="font-medium text-gray-900">
                                  {load.quantite} tonnes
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Prix/tonne</p>
                                <p className="font-medium text-gray-900">
                                  {formatNumber(load.prix_par_tonne)} FCFA
                                </p>
                              </div>
                            </div>

                            {/* Financier */}
                            <div className="pt-3 border-t border-gray-200">
                              <div className="grid grid-cols-3 gap-2 text-center mb-2">
                                <div>
                                  <p className="text-xs text-gray-500">Total</p>
                                  <p className="text-sm font-bold text-blue-600">
                                    {formatNumber(totalAmount)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Payé</p>
                                  <p className="text-sm font-bold text-green-600">
                                    {formatNumber(totalPaid)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Reste</p>
                                  <p className="text-sm font-bold text-orange-600">
                                    {formatNumber(remaining)}
                                  </p>
                                </div>
                              </div>

                              {/* Indicateur de statut */}
                              {load.status === 'Complété' && (
                                <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                                  <p className="text-xs text-green-800 text-center">
                                    ✓ Chargement complété (reste ≤ 100 000 FCFA)
                                  </p>
                                </div>
                              )}
                              {load.status === 'En attente' && (
                                <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                                  <p className="text-xs text-red-800 text-center">
                                    ⏸️ En attente de paiement
                                  </p>
                                </div>
                              )}
                              {load.status === 'En cours' && remaining <= 100000 && (
                                <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                                  <p className="text-xs text-blue-800 text-center">
                                    💡 Presque terminé ! Reste {formatNumber(remaining)} FCFA
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Message si aucun chargement */}
                {isExpanded && (!dest.loads || dest.loads.length === 0) && (
                  <div className="border-t bg-gray-50 p-4 text-center">
                    <Package size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Aucun chargement pour cette destination
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarcheDetails;