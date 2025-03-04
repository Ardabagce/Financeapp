// Dosyayı app/context/ klasörüne taşı

import { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { useAyarlar } from './AyarlarContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BildirimContext = createContext();

// Bildirim mesajları için çeviriler
const bildirimCevirileri = {
  tr: {
    yaklasanGelirBaslik: 'Yaklaşan Gelir Hatırlatması',
    yaklasanGelirIcerik: (miktar, aciklama) => `${miktar} TL tutarında "${aciklama}" geliri yaklaşıyor.`,
    yaklasanGiderBaslik: 'Yaklaşan Gider Hatırlatması',
    yaklasanGiderIcerik: (miktar, aciklama) => `${miktar} TL tutarında "${aciklama}" gideri yaklaşıyor.`,
    vadesiGelenGiderBaslik: 'Ödeme Zamanı Geldi',
    vadesiGelenGiderIcerik: (miktar, aciklama) => `${miktar} TL tutarında "${aciklama}" ödemesi bugün yapılmalı.`,
    bildirimIzinHata: 'Bildirim izni alınamadı!'
  },
  en: {
    yaklasanGelirBaslik: 'Upcoming Income Reminder',
    yaklasanGelirIcerik: (miktar, aciklama) => `Upcoming income of ${miktar} for "${aciklama}".`,
    yaklasanGiderBaslik: 'Upcoming Expense Reminder',
    yaklasanGiderIcerik: (miktar, aciklama) => `Upcoming expense of ${miktar} for "${aciklama}".`,
    vadesiGelenGiderBaslik: 'Payment Due Today',
    vadesiGelenGiderIcerik: (miktar, aciklama) => `Payment of ${miktar} for "${aciklama}" is due today.`,
    bildirimIzinHata: 'Failed to get notification permission!'
  }
};

// Bildirim işleyicisini ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function BildirimProvider({ children }) {
  const [expoPushToken, setExpoPushToken] = useState('');
  const { dil } = useAyarlar();
  const [planlanmisGiderler, setPlanlanmisGiderler] = useState([]);

  // Push bildirimleri için kayıt fonksiyonu
  async function registerForPushNotificationsAsync() {
    let token;
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        alert(bildirimCevirileri[dil].bildirimIzinHata);
        return;
      }
      
      // Expo SDK 49 ve altı için uyumlu token alma
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants?.expoConfig?.extra?.eas?.projectId
        })).data;
      } catch (error) {
        console.log('Push token alma hatası:', error);
        // Eski yöntemi dene
        try {
          token = (await Notifications.getExpoPushTokenAsync()).data;
        } catch (error) {
          console.log('Alternatif push token alma hatası:', error);
        }
      }
    }

    return token;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        console.log('Push token:', token);
      }
    });
    
    // Uygulama başladığında vadesi gelen giderleri kontrol et
    kontrolVadesiGelenGiderler();
    
    // Her gün kontrol etmek için bir zamanlayıcı ayarla
    const gunlukKontrol = setInterval(() => {
      kontrolVadesiGelenGiderler();
    }, 24 * 60 * 60 * 1000); // 24 saat
    
    return () => clearInterval(gunlukKontrol);
  }, []);

  // Yaklaşan gelir/gider bildirimi planlama
  const planlaYaklasanBildirim = async (tip, { miktar, aciklama, tarih, id }) => {
    try {
      const trigger = new Date(tarih);
      trigger.setHours(trigger.getHours() - 24); // 24 saat önce bildirim
      
      if (trigger < new Date()) {
        console.log('Bildirim zamanı geçmiş');
        return null; // Bildirim zamanı geçmişse gönderme
      }

      const ceviriler = bildirimCevirileri[dil];
      const baslik = tip === 'gelir' ? ceviriler.yaklasanGelirBaslik : ceviriler.yaklasanGiderBaslik;
      const icerik = tip === 'gelir' 
        ? ceviriler.yaklasanGelirIcerik(miktar, aciklama)
        : ceviriler.yaklasanGiderIcerik(miktar, aciklama);

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: baslik,
          body: icerik,
          data: { tip, miktar, aciklama, id, tarih }
        },
        trigger,
      });
      
      console.log(`${tip} bildirimi planlandı, ID:`, identifier);
      
      // Eğer gider ise, vadesi geldiğinde kontrol etmek için kaydet
      if (tip === 'gider') {
        const yeniGider = { id, miktar, aciklama, tarih, bildirimId: identifier };
        const guncelGiderler = [...planlanmisGiderler, yeniGider];
        setPlanlanmisGiderler(guncelGiderler);
        await AsyncStorage.setItem('planlanmisGiderler', JSON.stringify(guncelGiderler));
      }
      
      return identifier;
    } catch (error) {
      console.error('Bildirim planlama hatası:', error);
      return null;
    }
  };

  // Vadesi gelen giderleri kontrol et ve bildirim gönder
  const kontrolVadesiGelenGiderler = async () => {
    try {
      // AsyncStorage'dan planlanmış giderleri al
      const kayitliGiderlerJSON = await AsyncStorage.getItem('planlanmisGiderler');
      const kayitliGiderler = kayitliGiderlerJSON ? JSON.parse(kayitliGiderlerJSON) : [];
      
      if (kayitliGiderler.length === 0) return;
      
      const bugun = new Date();
      bugun.setHours(0, 0, 0, 0); // Bugünün başlangıcı
      
      const vadesiGelenGiderler = kayitliGiderler.filter(gider => {
        const giderTarihi = new Date(gider.tarih);
        giderTarihi.setHours(0, 0, 0, 0);
        return giderTarihi.getTime() === bugun.getTime();
      });
      
      // Vadesi gelen her gider için bildirim gönder
      for (const gider of vadesiGelenGiderler) {
        const ceviriler = bildirimCevirileri[dil];
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: ceviriler.vadesiGelenGiderBaslik,
            body: ceviriler.vadesiGelenGiderIcerik(gider.miktar, gider.aciklama),
            data: { tip: 'gider', ...gider, vadesiGeldi: true }
          },
          trigger: null, // Hemen gönder
        });
        
        console.log(`Vadesi gelen gider bildirimi gönderildi: ${gider.aciklama}`);
      }
      
      // İşlenmiş giderleri listeden çıkar
      const guncelGiderler = kayitliGiderler.filter(gider => {
        const giderTarihi = new Date(gider.tarih);
        giderTarihi.setHours(0, 0, 0, 0);
        return giderTarihi.getTime() > bugun.getTime();
      });
      
      setPlanlanmisGiderler(guncelGiderler);
      await AsyncStorage.setItem('planlanmisGiderler', JSON.stringify(guncelGiderler));
      
    } catch (error) {
      console.error('Vadesi gelen gider kontrolü hatası:', error);
    }
  };

  // Test bildirimi gönderme fonksiyonu
  const testBildirimiGonder = async () => {
    try {
      // Bildirim izinlerini kontrol et
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          alert(bildirimCevirileri[dil].bildirimIzinHata);
          return false;
        }
      }
      
      // Expo Go'da daha güvenilir çalışması için Alert kullan
      Alert.alert(
        '🔔 Test Bildirimi',
        dil === 'tr' 
          ? 'Bu bir test bildirimidir. Expo Go\'da gerçek bildirimler çalışmayabilir.' 
          : 'This is a test notification. Real notifications may not work in Expo Go.',
        [{ text: 'Tamam', style: 'default' }]
      );
      
      // Yine de gerçek bildirimi planlamayı dene
      try {
        const now = new Date();
        now.setSeconds(now.getSeconds() + 5);
        
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔔 Test Bildirimi',
            body: dil === 'tr' ? 'Bu bir test bildirimidir!' : 'This is a test notification!',
            data: { test: true },
          },
          trigger: { date: now },
        });
        
        console.log('Test bildirimi planlandı, ID:', identifier);
      } catch (notifError) {
        console.log('Gerçek bildirim gönderme hatası (beklenen):', notifError);
      }
      
      return true;
    } catch (error) {
      console.error('Bildirim test hatası:', error);
      alert(`Bildirim hatası: ${error.message}`);
      return false;
    }
  };

  return (
    <BildirimContext.Provider value={{
      expoPushToken,
      planlaYaklasanBildirim,
      testBildirimiGonder,
      kontrolVadesiGelenGiderler
    }}>
      {children}
    </BildirimContext.Provider>
  );
}

export const useBildirim = () => useContext(BildirimContext);

export default BildirimProvider; 