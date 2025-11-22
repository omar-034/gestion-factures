// utils/calculations.js
// Fonctions de calcul réutilisables

export const getTotalPaid = (loadId, payments) => {
  return payments
    .filter(p => (p.load_id || p.loadId) === loadId)
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);
};

export const getRemainingBalance = (load, payments) => {
  const totalPaid = getTotalPaid(load.id, payments);
  return parseFloat(load.total_amount || load.totalAmount) - totalPaid;
};

// Fonction mise à jour pour déterminer le statut d'un chargement dans un marché
export const getLoadStatus = (load, payments) => {
  const remaining = getRemainingBalance(load, payments);
  const totalAmount = parseFloat(load.totalAmount || load.total_amount);
  
  // Complété : reste entre 0 et 100 000 FCFA
  if (remaining >= 0 && remaining <= 100000) {
    return 'Complété';
  }
  
  // En attente : reste égal au montant total (aucun paiement)
  if (remaining === totalAmount) {
    return 'En attente';
  }
  
  // En cours : dans tous les autres cas
  return 'En cours';
};

// Fonction pour obtenir la couleur du badge de statut
export const getStatusColor = (status) => {
  switch (status) {
    case 'Complété':
      return 'bg-green-100 text-green-800';
    case 'En cours':
      return 'bg-yellow-100 text-yellow-800';
    case 'En attente':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getDriverStats = (drivers, loads, payments) => {
  return drivers.map(driver => {
    const driverLoads = loads.filter(load => 
      (load.driver_name || load.driverName) === driver.name
    );
    const totalLoads = driverLoads.length;
    const totalAmount = driverLoads.reduce((sum, load) => 
      sum + parseFloat(load.total_amount || load.totalAmount), 0
    );
    const totalPaid = driverLoads.reduce((sum, load) => 
      sum + getTotalPaid(load.id, payments), 0
    );
    const remaining = totalAmount - totalPaid;
    
    // Trouver la date du dernier chargement pour le tri
    const lastLoadDate = driverLoads.length > 0 
      ? driverLoads.reduce((latest, load) => {
          const loadDate = new Date(load.created_at || load.date || load.createdAt);
          const latestDate = new Date(latest);
          return loadDate > latestDate ? loadDate : latest;
        }, new Date(0))
      : null;

    return {
      ...driver,
      totalLoads,
      totalAmount,
      totalPaid,
      remaining,
      lastLoadDate
    };
  });
};

export const getEnrichedLoads = (loads, payments) => {
  return loads.map(load => ({
    ...load,
    driverName: load.driver_name || load.driverName,
    loadNumber: load.load_number || load.loadNumber,
    totalAmount: load.total_amount || load.totalAmount,
    totalPaid: getTotalPaid(load.id, payments),
    remaining: getRemainingBalance(load, payments),
    status: getLoadStatus(load, payments),
    paymentsCount: payments.filter(p => 
      (p.load_id || p.loadId) === load.id
    ).length,
    // Assurer la compatibilité avec les différents noms de champs de date
    created_at: load.created_at || load.createdAt,
    date: load.date || load.created_at
  }));
};

export const calculateGlobalStats = (loads, drivers, payments) => {
  const totalAmount = loads.reduce((sum, load) => 
    sum + parseFloat(load.total_amount || load.totalAmount), 0
  );
  const totalPaid = loads.reduce((sum, load) => 
    sum + getTotalPaid(load.id, payments), 0
  );
  const totalRemaining = totalAmount - totalPaid;

  return {
    totalAmount,
    totalPaid,
    totalRemaining,
    loadsCount: loads.length,
    driversCount: drivers.length,
    paymentsCount: payments.length
  };
};

// Fonction pour formater les nombres avec séparation des milliers
export const formatNumber = (number) => {
  return Number(number).toLocaleString('fr-FR');
};

// Fonction pour trier les paiements par date (plus récent en premier)
export const sortPaymentsByDate = (payments) => {
  return [...payments].sort((a, b) => {
    const dateA = new Date(a.created_at || a.date || a.createdAt || a.payment_date);
    const dateB = new Date(b.created_at || b.date || b.createdAt || b.payment_date);
    return dateB - dateA; // Ordre décroissant (plus récent en premier)
  });
};

// Fonction pour obtenir les paiements récents avec informations du chargement
export const getRecentPayments = (payments, loads, limit = 5) => {
  const sortedPayments = sortPaymentsByDate(payments);
  
  return sortedPayments.slice(0, limit).map(payment => {
    const load = loads.find(l => l.id === (payment.load_id || payment.loadId));
    
    return {
      ...payment,
      driverName: load ? (load.driver_name || load.driverName) : 'Chargement inconnu',
      loadNumber: load ? (load.load_number || load.loadNumber) : 'N/A',
      origin: load ? load.origin : 'Inconnu',
      destination: load ? load.destination : 'Inconnu',
      loadTotal: load ? (load.total_amount || load.totalAmount) : 0,
      paymentMethod: payment.payment_method || payment.paymentMethod || 'cash'
    };
  });
};

// NOUVELLE FONCTION : Obtenir les 10 derniers chargements
export const getRecentLoads = (loads, payments, limit = 10) => {
  const enrichedLoads = getEnrichedLoads(loads, payments);
  
  // Trier par date de création (plus récent en premier)
  return enrichedLoads
    .sort((a, b) => {
      const dateA = new Date(a.created_at || a.date);
      const dateB = new Date(b.created_at || b.date);
      return dateB - dateA; // Ordre décroissant
    })
    .slice(0, limit);
};

// Fonction pour trier les chauffeurs par date du dernier chargement (plus récent en premier)
export const sortDriversByLastLoad = (driverStats) => {
  return [...driverStats].sort((a, b) => {
    const dateA = a.lastLoadDate ? new Date(a.lastLoadDate) : new Date(0);
    const dateB = b.lastLoadDate ? new Date(b.lastLoadDate) : new Date(0);
    return dateB - dateA; // Ordre décroissant (plus récent en premier)
  });
};

// Fonction utilitaire pour formater la date d'affichage
export const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};