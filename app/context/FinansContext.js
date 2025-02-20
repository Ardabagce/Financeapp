import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FinansContext = createContext();

export function FinansProvider({ children }) {
  const [gelirler, setGelirler] = useState([]);
  const [giderler, setGiderler] = useState([]);

  useEffect(() => {
    // Uygulama başladığında verileri yükle
    verileriYukle();
  }, []);

  const verileriYukle = async () => {
    try {
      const kayitliGelirler = await AsyncStorage.getItem('gelirler');
      const kayitliGiderler = await AsyncStorage.getItem('giderler');
      
      if (kayitliGelirler) setGelirler(JSON.parse(kayitliGelirler));
      if (kayitliGiderler) setGiderler(JSON.parse(kayitliGiderler));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };

  const gelirEkle = async (yeniGelir) => {
    try {
      const yeniGelirler = [...gelirler, { ...yeniGelir, id: Date.now() }];
      await AsyncStorage.setItem('gelirler', JSON.stringify(yeniGelirler));
      setGelirler(yeniGelirler);
    } catch (error) {
      console.error('Gelir ekleme hatası:', error);
    }
  };

  const giderEkle = async (yeniGider) => {
    try {
      const yeniGiderler = [...giderler, { ...yeniGider, id: Date.now() }];
      await AsyncStorage.setItem('giderler', JSON.stringify(yeniGiderler));
      setGiderler(yeniGiderler);
    } catch (error) {
      console.error('Gider ekleme hatası:', error);
    }
  };

  const gelirGuncelle = async (id, guncelGelir) => {
    try {
      const yeniGelirler = gelirler.map(gelir => 
        gelir.id === id ? { ...guncelGelir, id } : gelir
      );
      await AsyncStorage.setItem('gelirler', JSON.stringify(yeniGelirler));
      setGelirler(yeniGelirler);
    } catch (error) {
      console.error('Gelir güncelleme hatası:', error);
    }
  };

  const giderGuncelle = async (id, guncelGider) => {
    try {
      const yeniGiderler = giderler.map(gider => 
        gider.id === id ? { ...guncelGider, id } : gider
      );
      await AsyncStorage.setItem('giderler', JSON.stringify(yeniGiderler));
      setGiderler(yeniGiderler);
    } catch (error) {
      console.error('Gider güncelleme hatası:', error);
    }
  };

  const gelirSil = async (id) => {
    try {
      const yeniGelirler = gelirler.filter(gelir => gelir.id !== id);
      await AsyncStorage.setItem('gelirler', JSON.stringify(yeniGelirler));
      setGelirler(yeniGelirler);
    } catch (error) {
      console.error('Gelir silme hatası:', error);
    }
  };

  const giderSil = async (id) => {
    try {
      const yeniGiderler = giderler.filter(gider => gider.id !== id);
      await AsyncStorage.setItem('giderler', JSON.stringify(yeniGiderler));
      setGiderler(yeniGiderler);
    } catch (error) {
      console.error('Gider silme hatası:', error);
    }
  };

  // Para formatı için yardımcı fonksiyon
  const formatNumber = (num) => {
    // Sayıyı string'e çevirip noktadan bölelim
    const [whole, decimal] = num.toString().split('.');
    
    // Tam sayı kısmına binlik ayracı (nokta) ekleyelim
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Eğer ondalık kısım varsa virgülle birleştirelim, yoksa sadece tam kısmı döndürelim
    return decimal ? `${formattedWhole},${decimal}` : formattedWhole;
  };

  // Toplam hesaplama fonksiyonları
  const toplamGelir = gelirler.reduce((sum, item) => sum + item.miktar, 0);
  const toplamGider = giderler.reduce((sum, item) => sum + item.miktar, 0);

  return (
    <FinansContext.Provider value={{
      gelirler,
      giderler,
      gelirEkle,
      giderEkle,
      gelirGuncelle,
      giderGuncelle,
      gelirSil,
      giderSil,
      toplamGelir,
      toplamGider,
      formatNumber,
    }}>
      {children}
    </FinansContext.Provider>
  );
}

export function useFinans() {
  return useContext(FinansContext);
} 