import React, { createContext, useContext, useState } from 'react';

const GiderContext = createContext();

export function GiderProvider({ children }) {
  const [giderler, setGiderler] = useState([]);

  const giderEkle = (yeniGider) => {
    const giderId = Date.now().toString();
    setGiderler(onceki => [...onceki, { id: giderId, ...yeniGider }]);
  };

  const giderGuncelle = (giderId, guncelGider) => {
    setGiderler(onceki =>
      onceki.map(gider =>
        gider.id === giderId ? { ...gider, ...guncelGider } : gider
      )
    );
  };

  const giderSil = (giderId) => {
    setGiderler(onceki => onceki.filter(gider => gider.id !== giderId));
  };

  return (
    <GiderContext.Provider value={{
      giderler,
      giderEkle,
      giderGuncelle,
      giderSil
    }}>
      {children}
    </GiderContext.Provider>
  );
}

export function useGiderContext() {
  const context = useContext(GiderContext);
  if (!context) {
    throw new Error('useGiderContext must be used within a GiderProvider');
  }
  return context;
} 