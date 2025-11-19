// src/components/Marches/MarchesList.jsx
import React, { useState, useEffect } from 'react';
import { Search, Plus, Briefcase, TrendingUp, Calendar, Eye, Edit2, Trash2 } from 'lucide-react';
import { marchesService } from '../../services/marches.service';

const MarchesList = ({ 
  onEdit, 
  onDelete, 
  onAddNew,
  onViewDetails 
}) => {
  const [marches, setMarches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marchesWithStats, setMarchesWithStats] = useState([]);

  useEffect(() => {
    loadMarches();
  }, []);

  const loadMarches = async () => {
    try {
      setLoading(true);
      const data = await marchesService.getAll();
      setMarches(data);
      
      // Charger les stats pour chaque marché
      const statsPromises = data.map(marche => 
        marchesService.getStats(marche.id)
      );
      const stats = await Promise.all(statsPromises);
      
      const marchesWithStatsData = data.map((marche, index) => ({
        ...marche,
        stats: stats[index]
      }));
      
      setMarchesWithStats(marchesWithStatsData);
    } catch (error) {
      console.error('Erreur chargement marchés:', error);
      alert('Erreur lors du chargement des marchés');
    } finally {
      setLoading(false);
    }
  };

  const filteredMarches = marchesWithStats.filter(marche =>
    marche.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marche.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'En cours': return 'bg-green-100 text-green-800';
      case 'Terminé': return 'bg-blue-100 text-blue-800';
      case 'Suspendu': return 'bg-orange-100 text-orange-800';
      case 'Annulé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (taux) => {
    if (taux >= 100) return 'bg-green-500';
    if (taux >= 75) return 'bg-blue-500';
    if (taux >= 50) return 'bg-yellow-500';
    if (taux >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Chargement des marchés...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Marchés</h2>
          <p className="text-gray-500 mt-1">{filteredMarches.length} marché(s)</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative flex-1 sm:flex-initial">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <button
            onClick={onAddNew}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Nouveau Marché</span>
          </button>
        </div>
      </div>

      {/* Liste des marchés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMarches.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
            <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun marché trouvé' : 'Aucun marché enregistré'}
            </p>
          </div>
        ) : (
          filteredMarches.map(marche => (
            <div key={marche.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
              {/* En-tête de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Briefcase className="text-blue-600" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {marche.nom}
                    </h3>
                    <p className="text-sm text-gray-500">Réf: {marche.reference}</p>
                    <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(marche.statut)}`}>
                      {marche.statut}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Calendar size={16} />
                <span>
                  {new Date(marche.date_debut).toLocaleDateString('fr-FR')}
                  {marche.date_fin && ` → ${new Date(marche.date_fin).toLocaleDateString('fr-FR')}`}
                </span>
              </div>

              {/* Progression */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm font-bold text-blue-600">
                    {marche.stats?.taux_execution_global?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(marche.stats?.taux_execution_global || 0)}`}
                    style={{ width: `${Math.min(marche.stats?.taux_execution_global || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Destinations</p>
                  <p className="text-lg font-bold text-blue-600">
                    {marche.marche_destinations?.length || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">Chargements</p>
                  <p className="text-lg font-bold text-green-600">
                    {marche.stats?.total_livre || 0} / {marche.stats?.total_requis || 0}
                  </p>
                </div>
              </div>

              {/* Description */}
              {marche.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {marche.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => onViewDetails(marche)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Détails
                </button>
                
                <button
                  onClick={() => onEdit(marche)}
                  className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition"
                  title="Modifier"
                >
                  <Edit2 size={16} />
                </button>
                
                <button
                  onClick={() => onDelete(marche.id)}
                  className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarchesList;