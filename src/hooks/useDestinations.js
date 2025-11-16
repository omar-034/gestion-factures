// src/hooks/useDestinations.js
import { useState, useEffect } from 'react';
import { destinationsService } from '../services/destinations.service';
// OU si l'export nommé ne marche pas, essayez :
// import destinationsService from '../services/destinations.service';

export const useDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 useDestinations: Chargement des destinations...');
      
      // Vérifions que le service existe
      console.log('🔍 destinationsService:', destinationsService);
      console.log('🔍 destinationsService.getAll:', destinationsService.getAll);
      
      if (typeof destinationsService.getAll !== 'function') {
        throw new Error('destinationsService.getAll is not a function');
      }
      
      const data = await destinationsService.getAll();
      console.log('📊 useDestinations: Données reçues:', data);
      
      setDestinations(data);
      setIsEmpty(data.length === 0);
      
      if (data.length === 0) {
        console.warn('⚠️ useDestinations: Table destinations vide');
      }
    } catch (err) {
      console.error('❌ useDestinations: Erreur:', err);
      setError('Erreur lors du chargement des destinations: ' + err.message);
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  };

  return {
    destinations,
    loading,
    error,
    isEmpty,
    refetch: loadDestinations
  };
};