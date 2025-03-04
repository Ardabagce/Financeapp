// Dosyayı app/context/ klasörüne taşı

import { createContext, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import { useAyarlar } from './AyarlarContext';

const BildirimContext = createContext();

// Bildirim mesajları için çeviriler
const bildirimCevirileri = {
  tr: {
    yaklasanGelirBaslik: 'Yaklaşan Gelir Hatırlatması',
    yaklasanGelirIcerik: (miktar, aciklama) => `${miktar} TL tutarında "${aciklama}" geliri yaklaşıyor.`,
    yaklasanGiderBaslik: 'Yaklaşan Gider Hatırlatması',
    yaklasanGiderIcerik: (miktar, aciklama) => `${miktar} TL tutarında "${aciklama}" gideri yaklaşıyor.`,
    bildirimIzinHata: 'Bildirim izni alınamadı!'
  },
  en: {
    yaklasanGelirBaslik: 'Upcoming Income Reminder',
    yaklasanGelirIcerik: (miktar, aciklama) => `Upcoming income of ${miktar} for "${aciklama}".`,
    yaklasanGiderBaslik: 'Upcoming Expense Reminder',
    yaklasanGiderIcerik: (miktar, aciklama) => `Upcoming expense of ${miktar} for "${aciklama}".`,
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
  }, []);

  // Yaklaşan gelir/gider bildirimi planlama
  const planlaYaklasanBildirim = async (tip, { miktar, aciklama, tarih }) => {
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
          data: { tip, miktar, aciklama }
        },
        trigger,
      });
      
      console.log(`${tip} bildirimi planlandı, ID:`, identifier);
      return identifier;
    } catch (error) {
      console.error('Bildirim planlama hatası:', error);
      return null;
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
      testBildirimiGonder
    }}>
      {children}
    </BildirimContext.Provider>
  );
}

export const useBildirim = () => useContext(BildirimContext);

export default BildirimProvider; 