import React from 'react';
import { Search, FileText, Phone } from 'lucide-react';
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
  onDeletePayment,
  drivers = [] // Assurez-vous de passer les drivers en prop
}) => {
  const safeLoads = Array.isArray(loads) ? loads : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  
  if (safeLoads.length === 0 && safePayments.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
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
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <FileText size={48} className="mx-auto text-red-400 mb-4" />
        <p className="text-red-500">Erreur lors du chargement des chargements</p>
      </div>
    );
  }
  
  // Fonction pour obtenir le téléphone du chauffeur
  const getDriverPhone = (driverName) => {
    const driver = drivers.find(d => d.name === driverName);
    return driver ? driver.phone : 'Non renseigné';
  };

  const filteredLoads = enrichedLoads.filter(load => {
    try {
      const searchLower = (searchTerm || '').toLowerCase();
      const driverName = (load.driverName || load.driver_name || '').toLowerCase();
      const loadNumber = (load.loadNumber || load.load_number || '').toLowerCase();
      const origin = (load.origin || '').toLowerCase();
      const destination = (load.destination || '').toLowerCase();
      const driverPhone = getDriverPhone(load.driverName || load.driver_name || '').toLowerCase();
      
      return (
        driverName.includes(searchLower) ||
        loadNumber.includes(searchLower) ||
        origin.includes(searchLower) ||
        destination.includes(searchLower) ||
        driverPhone.includes(searchLower)
      );
    } catch (error) {
      console.error('Erreur filtrage:', error);
      return true;
    }
  });

  return (
    <div className="space-y-4">
      {/* En-tête optimisé mobile */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Chargements</h2>
          <p className="text-gray-500 text-sm">{filteredLoads.length} chargement(s)</p>
        </div>
        
        {/* Barre de recherche mobile */}
        <div className="relative w-full sm:w-auto">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher chauffeur, téléphone, destination..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>

      {/* Liste des chargements - version mobile compacte */}
      <div className="space-y-3">
        {filteredLoads.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
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
              const driverPhone = getDriverPhone(load.driverName || load.driver_name || '');
              
              return (
                <LoadCard
                  key={load.id}
                  load={load}
                  loadPayments={loadPayments}
                  driverPhone={driverPhone} // Passer le téléphone en prop
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAddPayment={onAddPayment}
                  onDeletePayment={onDeletePayment}
                />
              );
            } catch (error) {
              console.error('Erreur affichage load:', load.id, error);
              return (
                <div key={load.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-red-600 text-sm">Erreur d'affichage du chargement</p>
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