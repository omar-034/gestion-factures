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

export const getLoadStatus = (load, payments) => {
  const remaining = getRemainingBalance(load, payments);
  if (remaining === 0) return 'Payé';
  if (remaining === parseFloat(load.totalAmount || load.total_amount)) return 'Non payé';
  return 'Partiellement payé';
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