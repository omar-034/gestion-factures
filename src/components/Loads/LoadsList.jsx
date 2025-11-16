import React from 'react';
import { Search, FileText } from 'lucide-react';
import LoadCard from './LoadCard';
import { getEnrichedLoads } from '../../utils/calculations';

const LoadsList = ({ 
  loads = [], 
  payments = [], 
  searchTerm = '', 
  onSearchChange, 
  onEdit, 
  onDelete,
  onAddPayment,
  onDeletePayment
}) => {
  const safeLoads = Array.isArray(loads) ? loads : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  
  if (safeLoads.length === 0 && safePayments.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow-md text-center">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Chargement des données...</p>
      </div>
    );
  }

  let enrichedLoads = [];
  try {
    enrichedLoads = getEnrichedLoads(safeLoads, safePayments);
  } catch (error) {
    console.error('Erreur enrichissement loads:', error);
    return (
      <div className="bg-white p-12 rounded-lg shadow-md text-center">
        <FileText size={48} className="mx-auto text-red-400 mb-4" />
        <p className="text-red-500">Erreur lors du chargement des chargements</p>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
      </div>
    );
  }
  
  const filteredLoads = enrichedLoads.filter(load => {
    try {
      const searchLower = (searchTerm || '').toLowerCase();
      const driverName = (load.driverName || load.driver_name || '').toLowerCase();
      const loadNumber = (load.loadNumber || load.load_number || '').toLowerCase();
      const origin = (load.origin || '').toLowerCase();
      const destination = (load.destination || '').toLowerCase();
      
      return (
        driverName.includes(searchLower) ||
        loadNumber.includes(searchLower) ||
        origin.includes(searchLower) ||
        destination.includes(searchLower)
      );
    } catch (error) {
      console.error('Erreur filtrage:', error);
      return true;
    }
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Liste des Chargements</h2>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="outline-none"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredLoads.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Aucun chargement trouvé pour cette recherche' : 'Aucun chargement enregistré'}
            </p>
          </div>
        ) : (
          filteredLoads.map(load => {
            try {
              const loadPayments = safePayments.filter(p => 
                (p.load_id || p.loadId) === load.id
              );
              
              return (
                <LoadCard
                  key={load.id}
                  load={load}
                  loadPayments={loadPayments}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddPayment={onAddPayment}
                  onDeletePayment={onDeletePayment}
                />
              );
            } catch (error) {
              console.error('Erreur affichage load:', load.id, error);
              return (
                <div key={load.id} className="bg-red-50 p-4 rounded">
                  <p className="text-red-600">Erreur d'affichage du chargement</p>
                </div>
              );
            }
          })
        )}
      </div>
    </div>
  );
};

export default LoadsList;