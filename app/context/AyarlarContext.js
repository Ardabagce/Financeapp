import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getText } from '../localization/translations';
import { lightTheme, darkTheme } from '../theme/colors';

const AyarlarContext = createContext();

const PARA_BIRIMLERI = {
  TRY: { id: 'TRY', sembol: '₺', ad: 'try' },
  USD: { id: 'USD', sembol: '$', ad: 'usd' },
  EUR: { id: 'EUR', sembol: '€', ad: 'eur' },
  GBP: { id: 'GBP', sembol: '£', ad: 'gbp' },
};

function AyarlarProvider({ children }) {
  const [dil, setDil] = useState('tr');
  const [paraBirimi, setParaBirimi] = useState(PARA_BIRIMLERI.TRY.id);
  const [karanlikMod, setKaranlikMod] = useState(false);
  const [bakiyeGizli, setBakiyeGizli] = useState(false);

  const dilSecenekleri = [
    { id: 'tr', ad: 'Türkçe' },
    { id: 'en', ad: 'English' },
    { id: 'de', ad: 'Deutsch' },
  ];

  const paraBirimiSecenekleri = [
    { id: PARA_BIRIMLERI.TRY.id, sembol: PARA_BIRIMLERI.TRY.sembol, ad: PARA_BIRIMLERI.TRY.ad },
    { id: PARA_BIRIMLERI.USD.id, sembol: PARA_BIRIMLERI.USD.sembol, ad: PARA_BIRIMLERI.USD.ad },
    { id: PARA_BIRIMLERI.EUR.id, sembol: PARA_BIRIMLERI.EUR.sembol, ad: PARA_BIRIMLERI.EUR.ad },
    { id: PARA_BIRIMLERI.GBP.id, sembol: PARA_BIRIMLERI.GBP.sembol, ad: PARA_BIRIMLERI.GBP.ad },
  ];

  useEffect(() => {
    ayarlariYukle();
  }, []);

  const ayarlariYukle = async () => {
    try {
      const kayitliDil = await AsyncStorage.getItem('dil');
      const kayitliParaBirimi = await AsyncStorage.getItem('paraBirimi');
      const kayitliKaranlikMod = await AsyncStorage.getItem('karanlikMod');
      const kayitliBakiyeGizli = await AsyncStorage.getItem('bakiyeGizli');
      
      if (kayitliDil) setDil(kayitliDil);
      if (kayitliParaBirimi) setParaBirimi(kayitliParaBirimi);
      if (kayitliKaranlikMod) setKaranlikMod(JSON.parse(kayitliKaranlikMod));
      if (kayitliBakiyeGizli) setBakiyeGizli(JSON.parse(kayitliBakiyeGizli));
    } catch (error) {
      console.error('Ayarlar yükleme hatası:', error);
    }
  };

  const dilDegistir = async (yeniDil) => {
    try {
      await AsyncStorage.setItem('dil', yeniDil);
      setDil(yeniDil);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };

  const paraBirimiDegistir = async (yeniParaBirimi) => {
    try {
      await AsyncStorage.setItem('paraBirimi', yeniParaBirimi);
      setParaBirimi(yeniParaBirimi);
    } catch (error) {
      console.error('Para birimi değiştirme hatası:', error);
    }
  };

  const karanlikModDegistir = async (yeniDurum) => {
    try {
      await AsyncStorage.setItem('karanlikMod', JSON.stringify(yeniDurum));
      setKaranlikMod(yeniDurum);
    } catch (error) {
      console.error('Karanlık mod değiştirme hatası:', error);
    }
  };

  const bakiyeGizliDegistir = async (yeniDurum) => {
    try {
      await AsyncStorage.setItem('bakiyeGizli', JSON.stringify(yeniDurum));
      setBakiyeGizli(yeniDurum);
    } catch (error) {
      console.error('Bakiye gizleme durumu değiştirme hatası:', error);
    }
  };

  const t = useCallback((key) => getText(key, dil), [dil]);

  const getParaBirimiSembol = useCallback(() => {
    return PARA_BIRIMLERI[paraBirimi].sembol;
  }, [paraBirimi]);

  const tema = karanlikMod ? darkTheme : lightTheme;

  return (
    <AyarlarContext.Provider value={{
      dil,
      paraBirimi,
      karanlikMod,
      bakiyeGizli,
      dilSecenekleri,
      paraBirimiSecenekleri,
      dilDegistir,
      paraBirimiDegistir,
      karanlikModDegistir,
      bakiyeGizliDegistir,
      t,
      getParaBirimiSembol,
      tema,
    }}>
      {children}
    </AyarlarContext.Provider>
  );
}

function useAyarlar() {
  return useContext(AyarlarContext);
}

export default AyarlarProvider;
export { useAyarlar }; 