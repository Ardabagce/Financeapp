import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAyarlar } from './AyarlarContext';

const FinansContext = createContext();

// Gelir kategorileri
const GELIR_KATEGORILERI = {
  MAAS: 'kategori_maas',
  EK_GELIR: 'kategori_ekgelir',
  YATIRIM: 'kategori_yatirim',
  HEDIYE: 'kategori_hediye',
  DIGER: 'kategori_diger'
};

// Gider kategorileri
const GIDER_KATEGORILERI = {
  MARKET: 'kategori_market',
  FATURA: 'kategori_fatura',
  KIRA: 'kategori_kira',
  ULASIM: 'kategori_ulasim',
  SAGLIK: 'kategori_saglik',
  EGLENCE: 'kategori_eglence',
  DIGER: 'kategori_diger'
};

function FinansProvider({ children }) {
  const [gelirler, setGelirler] = useState([]);
  const [giderler, setGiderler] = useState([]);
  const [yaklasanGelirler, setYaklasanGelirler] = useState([]);
  const [yaklasanGiderler, setYaklasanGiderler] = useState([]);
  const [secilenAy, setSecilenAy] = useState('all');
  const { t } = useAyarlar();

  // Ayları t() fonksiyonu ile çevirilmiş şekilde oluştur
  const aylar = useMemo(() => ({
    'all': t('tumZamanlar'),
    '2025-01': `${t('ay_01')} 2025`,
    '2025-02': `${t('ay_02')} 2025`,
    '2025-03': `${t('ay_03')} 2025`,
    '2025-04': `${t('ay_04')} 2025`,
    '2025-05': `${t('ay_05')} 2025`,
    '2025-06': `${t('ay_06')} 2025`,
    '2025-07': `${t('ay_07')} 2025`,
    '2025-08': `${t('ay_08')} 2025`,
    '2025-09': `${t('ay_09')} 2025`,
    '2025-10': `${t('ay_10')} 2025`,
    '2025-11': `${t('ay_11')} 2025`,
    '2025-12': `${t('ay_12')} 2025`,
  }), [t]);

  useEffect(() => {
    // Uygulama başladığında verileri yükle
    verileriYukle();
  }, []);

  const verileriYukle = useCallback(async () => {
    try {
      const [
        kayitliGelirler,
        kayitliGiderler,
        kayitliYaklasanGelirler,
        kayitliYaklasanGiderler
      ] = await Promise.all([
        AsyncStorage.getItem('gelirler'),
        AsyncStorage.getItem('giderler'),
        AsyncStorage.getItem('yaklasanGelirler'),
        AsyncStorage.getItem('yaklasanGiderler')
      ]);
      
      if (kayitliGelirler) setGelirler(JSON.parse(kayitliGelirler));
      if (kayitliGiderler) setGiderler(JSON.parse(kayitliGiderler));
      if (kayitliYaklasanGelirler) setYaklasanGelirler(JSON.parse(kayitliYaklasanGelirler));
      if (kayitliYaklasanGiderler) setYaklasanGiderler(JSON.parse(kayitliYaklasanGiderler));
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  }, []);

  const gelirEkle = useCallback(async (gelir) => {
    try {
      const yeniGelir = {
        ...gelir,
        id: Date.now(),
        kategori: gelir.kategori || GELIR_KATEGORILERI.DIGER
      };
      const yeniGelirler = [...gelirler, yeniGelir];
      await AsyncStorage.setItem('gelirler', JSON.stringify(yeniGelirler));
      setGelirler(yeniGelirler);
    } catch (error) {
      console.error('Gelir ekleme hatası:', error);
    }
  }, [gelirler]);

  const giderEkle = useCallback(async (gider) => {
    try {
      const yeniGider = {
        ...gider,
        id: Date.now(),
        kategori: gider.kategori || GIDER_KATEGORILERI.DIGER
      };
      const yeniGiderler = [...giderler, yeniGider];
      await AsyncStorage.setItem('giderler', JSON.stringify(yeniGiderler));
      setGiderler(yeniGiderler);
    } catch (error) {
      console.error('Gider ekleme hatası:', error);
    }
  }, [giderler]);

  const yaklasanGelirEkle = useCallback(async (yeniGelir) => {
    try {
      const yeniYaklasanGelirler = [...yaklasanGelirler, { ...yeniGelir, id: Date.now(), tamamlandi: false }];
      await AsyncStorage.setItem('yaklasanGelirler', JSON.stringify(yeniYaklasanGelirler));
      setYaklasanGelirler(yeniYaklasanGelirler);
    } catch (error) {
      console.error('Yaklaşan gelir ekleme hatası:', error);
    }
  }, [yaklasanGelirler]);

  const yaklasanGiderEkle = useCallback(async (yeniGider) => {
    try {
      const yeniYaklasanGiderler = [...yaklasanGiderler, { ...yeniGider, id: Date.now(), tamamlandi: false }];
      await AsyncStorage.setItem('yaklasanGiderler', JSON.stringify(yeniYaklasanGiderler));
      setYaklasanGiderler(yeniYaklasanGiderler);
    } catch (error) {
      console.error('Yaklaşan gider ekleme hatası:', error);
    }
  }, [yaklasanGiderler]);

  const geliriTamamla = useCallback(async (id) => {
    try {
      const gelir = yaklasanGelirler.find(g => g.id === id);
      if (gelir) {
        // Yaklaşan gelirlerden çıkar
        const yeniYaklasanGelirler = yaklasanGelirler.filter(g => g.id !== id);
        await AsyncStorage.setItem('yaklasanGelirler', JSON.stringify(yeniYaklasanGelirler));
        setYaklasanGelirler(yeniYaklasanGelirler);

        // Normal gelirlere ekle
        await gelirEkle(gelir);
      }
    } catch (error) {
      console.error('Gelir tamamlama hatası:', error);
    }
  }, [gelirEkle, yaklasanGelirler]);

  const gideriTamamla = useCallback(async (id) => {
    try {
      const gider = yaklasanGiderler.find(g => g.id === id);
      if (gider) {
        // Yaklaşan giderlerden çıkar
        const yeniYaklasanGiderler = yaklasanGiderler.filter(g => g.id !== id);
        await AsyncStorage.setItem('yaklasanGiderler', JSON.stringify(yeniYaklasanGiderler));
        setYaklasanGiderler(yeniYaklasanGiderler);

        // Normal giderlere ekle
        await giderEkle(gider);
      }
    } catch (error) {
      console.error('Gider tamamlama hatası:', error);
    }
  }, [giderEkle, yaklasanGiderler]);

  const gelirGuncelle = useCallback(async (id, guncelGelir) => {
    try {
      const yeniGelirler = gelirler.map(gelir => 
        gelir.id === id ? { ...guncelGelir, id } : gelir
      );
      await AsyncStorage.setItem('gelirler', JSON.stringify(yeniGelirler));
      setGelirler(yeniGelirler);
    } catch (error) {
      console.error('Gelir güncelleme hatası:', error);
    }
  }, [gelirler]);

  const giderGuncelle = useCallback(async (id, guncelGider) => {
    try {
      const yeniGiderler = giderler.map(gider => 
        gider.id === id ? { ...guncelGider, id } : gider
      );
      await AsyncStorage.setItem('giderler', JSON.stringify(yeniGiderler));
      setGiderler(yeniGiderler);
    } catch (error) {
      console.error('Gider güncelleme hatası:', error);
    }
  }, [giderler]);

  const gelirSil = useCallback(async (id) => {
    try {
      const yeniGelirler = gelirler.filter(gelir => gelir.id !== id);
      await AsyncStorage.setItem('gelirler', JSON.stringify(yeniGelirler));
      setGelirler(yeniGelirler);
    } catch (error) {
      console.error('Gelir silme hatası:', error);
    }
  }, [gelirler]);

  const giderSil = useCallback(async (id) => {
    try {
      const yeniGiderler = giderler.filter(gider => gider.id !== id);
      await AsyncStorage.setItem('giderler', JSON.stringify(yeniGiderler));
      setGiderler(yeniGiderler);
    } catch (error) {
      console.error('Gider silme hatası:', error);
    }
  }, [giderler]);

  const yaklasanGelirSil = useCallback(async (id) => {
    try {
      const yeniYaklasanGelirler = yaklasanGelirler.filter(gelir => gelir.id !== id);
      await AsyncStorage.setItem('yaklasanGelirler', JSON.stringify(yeniYaklasanGelirler));
      setYaklasanGelirler(yeniYaklasanGelirler);
    } catch (error) {
      console.error('Yaklaşan gelir silme hatası:', error);
    }
  }, [yaklasanGelirler]);

  const yaklasanGiderSil = useCallback(async (id) => {
    try {
      const yeniYaklasanGiderler = yaklasanGiderler.filter(gider => gider.id !== id);
      await AsyncStorage.setItem('yaklasanGiderler', JSON.stringify(yeniYaklasanGiderler));
      setYaklasanGiderler(yeniYaklasanGiderler);
    } catch (error) {
      console.error('Yaklaşan gider silme hatası:', error);
    }
  }, [yaklasanGiderler]);

  // Para formatı için yardımcı fonksiyon
  const formatNumber = (num) => {
    // Sayıyı string'e çevirip noktadan bölelim
    const [whole, decimal] = num.toString().split('.');
    
    // Tam sayı kısmına binlik ayracı (nokta) ekleyelim
    const formattedWhole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    // Eğer ondalık kısım varsa virgülle birleştirelim, yoksa sadece tam kısmı döndürelim
    return decimal ? `${formattedWhole},${decimal}` : formattedWhole;
  };

  // Filtrelenmiş verileri hesapla
  const filtreliGelirler = useMemo(() => {
    if (secilenAy === 'all') return gelirler;
    return gelirler.filter(gelir => {
      const gelirTarihi = new Date(gelir.tarih);
      const ayStr = `${gelirTarihi.getFullYear()}-${String(gelirTarihi.getMonth() + 1).padStart(2, '0')}`;
      return ayStr === secilenAy;
    });
  }, [gelirler, secilenAy]);

  const filtreliGiderler = useMemo(() => {
    if (secilenAy === 'all') return giderler;
    return giderler.filter(gider => {
      const giderTarihi = new Date(gider.tarih);
      const ayStr = `${giderTarihi.getFullYear()}-${String(giderTarihi.getMonth() + 1).padStart(2, '0')}`;
      return ayStr === secilenAy;
    });
  }, [giderler, secilenAy]);

  // Filtrelenmiş toplamları hesapla
  const toplamGelir = useMemo(() => 
    filtreliGelirler.reduce((sum, item) => sum + item.miktar, 0),
    [filtreliGelirler]
  );

  const toplamGider = useMemo(() => 
    filtreliGiderler.reduce((sum, item) => sum + item.miktar, 0),
    [filtreliGiderler]
  );

  const ayDegistir = useCallback((yeniAy) => {
    setSecilenAy(yeniAy);
  }, []);

  // Context değerini güncelle
  const contextValue = useMemo(() => ({
    gelirler: filtreliGelirler,
    giderler: filtreliGiderler,
    yaklasanGelirler,
    yaklasanGiderler,
    gelirEkle,
    giderEkle,
    yaklasanGelirEkle,
    yaklasanGiderEkle,
    geliriTamamla,
    gideriTamamla,
    gelirGuncelle,
    giderGuncelle,
    gelirSil,
    giderSil,
    yaklasanGelirSil,
    yaklasanGiderSil,
    toplamGelir,
    toplamGider,
    formatNumber,
    GELIR_KATEGORILERI,
    GIDER_KATEGORILERI,
    secilenAy,
    ayDegistir,
    aylar,
  }), [
    filtreliGelirler,
    filtreliGiderler,
    toplamGelir,
    toplamGider,
    secilenAy,
    aylar,
  ]);

  return (
    <FinansContext.Provider value={contextValue}>
      {children}
    </FinansContext.Provider>
  );
}

function useFinans() {
  return useContext(FinansContext);
}

// Varsayılan olarak FinansProvider'ı export ediyoruz
export default FinansProvider;

// Named exports
export { useFinans }; 