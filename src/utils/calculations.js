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
    
    return {
      ...driver,
      totalLoads,
      totalAmount,
      totalPaid,
      remaining
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
    ).length
  }));
};

export const calculateGlobalStats = (loads, drivers, payments) => {
  return {
    totalAmount: loads.reduce((sum, load) => 
      sum + parseFloat(load.total_amount || load.totalAmount), 0
    ),
    totalPaid: loads.reduce((sum, load) => 
      sum + getTotalPaid(load.id, payments), 0
    ),
    totalRemaining: loads.reduce((sum, load) => 
      sum + getRemainingBalance(load, payments), 0
    ),
    loadsCount: loads.length,
    driversCount: drivers.length,
    paymentsCount: payments.length
  };
};