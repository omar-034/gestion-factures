// src/components/InitDestinations.jsx
import React, { useState } from 'react';
import { destinationsService } from '../services/destinations.service';

const InitDestinations = ({ onInitialized }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const initDestinations = async () => {
    setLoading(true);
    setMessage('Initialisation en cours...');
    
    try {
      // Données COMPLÈTES avec région ET ville
      const destinationsData = {
        destinations: [
          { region: 'Sedhiou', ville: 'Sedhiou', prixParTonne: 11000 },
          { region: 'Goudomp', ville: 'Goudomp', prixParTonne: 13000 },
          { region: 'Boukiling', ville: 'Boukiling', prixParTonne: 9000 },
          { region: 'Saraya', ville: 'Saraya', prixParTonne: 21000 },
          { region: 'Salemata', ville: 'Salemata', prixParTonne: 22000 },
          { region: 'Kedougou', ville: 'Kedougou', prixParTonne: 18000 },
          { region: 'Kounguel', ville: 'Kounguel', prixParTonne: 8000 },
          { region: 'Malem hodar', ville: 'Malem hodar', prixParTonne: 6500 },
          { region: 'Kaffrine', ville: 'Kaffrine', prixParTonne: 6000 },
          { region: 'Mbirkilane', ville: 'Mbirkilane', prixParTonne: 4500 },
          { region: 'Kabrousse', ville: 'Kabrousse', prixParTonne: 13000 },
          { region: 'Bignona', ville: 'Bignona', prixParTonne: 11000 },
          { region: 'Goudiry', ville: 'Goudiry', prixParTonne: 16000 },
          { region: 'Tamba', ville: 'Tamba', prixParTonne: 13000 },
          { region: 'Koumpentoum', ville: 'Koumpentoum', prixParTonne: 9000 },
          { region: 'Backel', ville: 'Backel', prixParTonne: 17000 },
          { region: 'Dagana', ville: 'Dagana', prixParTonne: 10500 },
          { region: 'Ranerou', ville: 'Ranerou', prixParTonne: 11000 },
          { region: 'Bokidiawe', ville: 'Bokidiawe', prixParTonne: 15000 },
          { region: 'Kanel', ville: 'Kanel', prixParTonne: 14000 },
          { region: 'Louga', ville: 'Louga', prixParTonne: 5000 },
          { region: 'Linguere', ville: 'Linguere', prixParTonne: 9000 },
          { region: 'Kebemer', ville: 'Kebemer', prixParTonne: 4500 },
          { region: 'Velingara', ville: 'Velingara', prixParTonne: 15000 },
          { region: 'Nioro', ville: 'Nioro', prixParTonne: 5500 },
          { region: 'Gossas', ville: 'Gossas', prixParTonne: 4500 },
          { region: 'Mbacke', ville: 'Mbacke', prixParTonne: 4500 }
        ]
      };

      await destinationsService.seedDestinations(destinationsData);
      setMessage('✅ Destinations initialisées avec succès!');
      setTimeout(() => {
        onInitialized();
      }, 2000);
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('❌ Erreur lors de l\'initialisation: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Initialisation des Destinations</h2>
        <p className="text-gray-600 mb-4">
          La base de données des destinations est vide. Voulez-vous initialiser avec les données par défaut ?
        </p>
        
        {message && (
          <div className={`p-3 rounded mb-4 ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            onClick={initDestinations}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Initialisation...' : 'Initialiser'}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
          >
            Actualiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default InitDestinations;