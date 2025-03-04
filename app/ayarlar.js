import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Switch,
  Alert
} from 'react-native';
import { useAyarlar } from './context/AyarlarContext';
import { useBildirim } from './context/BildirimContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export default function Ayarlar() {
  const { 
    dil, 
    paraBirimi, 
    karanlikMod,
    dilSecenekleri, 
    paraBirimiSecenekleri,
    dilDegistir,
    paraBirimiDegistir,
    karanlikModDegistir,
    tema,
    t
  } = useAyarlar();
  const { testBildirimiGonder } = useBildirim();
  const [bildirimIzni, setBildirimIzni] = useState(false);

  useEffect(() => {
    // Bildirim izinlerini kontrol et
    async function izinKontrol() {
      const { status } = await Notifications.getPermissionsAsync();
      setBildirimIzni(status === 'granted');
    }
    izinKontrol();
  }, []);

  const bildirimIzniIste = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setBildirimIzni(status === 'granted');
    
    if (status === 'granted') {
      // İzin alındı, test bildirimi gönder
      testBildirimiGonder();
      Alert.alert(
        dil === 'tr' ? 'Bildirim Gönderildi' : 'Notification Sent',
        dil === 'tr' ? 'Test bildirimi gönderildi. Lütfen bildirim gelip gelmediğini kontrol edin.' : 
                      'Test notification sent. Please check if you received it.'
      );
    } else {
      // İzin alınamadı
      Alert.alert(
        dil === 'tr' ? 'Bildirim İzni Gerekli' : 'Notification Permission Required',
        dil === 'tr' ? 'Bildirimleri göndermek için izin gerekiyor. Lütfen ayarlardan izin verin.' : 
                      'Permission is required to send notifications. Please grant permission in settings.'
      );
    }
  };

  const testBildirimiGonderVeOnay = () => {
    testBildirimiGonder();
    Alert.alert(
      dil === 'tr' ? 'Bildirim Gönderildi' : 'Notification Sent',
      dil === 'tr' ? 'Test bildirimi gönderildi. Lütfen bildirim gelip gelmediğini kontrol edin.' : 
                    'Test notification sent. Please check if you received it.'
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tema.text }]}>
            {t('dilSecenekleri')}
          </Text>
          {dilSecenekleri.map((secenek) => (
            <TouchableOpacity
              key={secenek.id}
              style={[
                styles.option,
                { backgroundColor: tema.cardBackground },
                dil === secenek.id && { backgroundColor: tema.selectedBackground }
              ]}
              onPress={() => dilDegistir(secenek.id)}
            >
              <Text style={[styles.optionText, { color: tema.text }]}>
                {secenek.ad}
              </Text>
              {dil === secenek.id && (
                <Ionicons name="checkmark" size={24} color={tema.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tema.text }]}>
            {t('paraBirimi')}
          </Text>
          {paraBirimiSecenekleri.map((secenek) => (
            <TouchableOpacity
              key={secenek.id}
              style={[
                styles.option,
                { backgroundColor: tema.cardBackground },
                paraBirimi === secenek.id && { backgroundColor: tema.selectedBackground }
              ]}
              onPress={() => paraBirimiDegistir(secenek.id)}
            >
              <View style={styles.currencyOption}>
                <Text style={[styles.currencySymbol, { color: tema.textSecondary }]}>
                  {secenek.sembol}
                </Text>
                <Text style={[styles.optionText, { color: tema.text }]}>
                  {t(secenek.ad)}
                </Text>
              </View>
              {paraBirimi === secenek.id && (
                <Ionicons name="checkmark" size={24} color={tema.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[
          styles.option, 
          { 
            backgroundColor: tema.cardBackground,
            marginHorizontal: 16,
            marginBottom: 16
          }
        ]}>
          <Text style={[styles.optionText, { color: tema.text }]}>
            {t('karanlikMod')}
          </Text>
          <Switch
            value={karanlikMod}
            onValueChange={karanlikModDegistir}
            trackColor={{ 
              false: tema.border, 
              true: karanlikMod ? '#7B61FF80' : '#4CAF5080'
            }}
            thumbColor={karanlikMod ? tema.primary : '#f4f3f4'}
            ios_backgroundColor={tema.border}
          />
        </View>

        <View style={[styles.section, { backgroundColor: tema.cardBackground, marginTop: 20 }]}>
          <Text style={[styles.sectionTitle, { color: tema.text }]}>
            {dil === 'tr' ? 'Bildirim Testi' : 'Notification Test'}
          </Text>
          
          {bildirimIzni ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: tema.success, padding: 15, marginVertical: 10 }]}
              onPress={testBildirimiGonderVeOnay}
            >
              <Text style={[styles.buttonText, { color: '#fff', fontSize: 16, fontWeight: 'bold' }]}>
                {dil === 'tr' ? 'Test Bildirimi Gönder' : 'Send Test Notification'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: tema.warning, padding: 15, marginVertical: 10 }]}
              onPress={bildirimIzniIste}
            >
              <Text style={[styles.buttonText, { color: '#fff', fontSize: 16, fontWeight: 'bold' }]}>
                {dil === 'tr' ? 'Bildirim İzni İste' : 'Request Notification Permission'}
              </Text>
            </TouchableOpacity>
          )}
          
          <Text style={[styles.description, { color: tema.textSecondary, marginTop: 5 }]}>
            {bildirimIzni 
              ? (dil === 'tr' ? 'Bildirim izni verildi. Test bildirimini göndermek için butona tıklayın.' : 'Notification permission granted. Click the button to send a test notification.')
              : (dil === 'tr' ? 'Bildirim izni verilmedi. İzin vermek için butona tıklayın.' : 'Notification permission not granted. Click the button to grant permission.')}
          </Text>
        </View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: tema.textSecondary }]}>
            {t('versiyon')} {Constants.expoConfig.version}
          </Text>
          <Text style={[styles.copyrightText, { color: tema.textTertiary }]}>
            {t('copyright')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#e8f5e9',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#666',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1, // ScrollView'in tüm alanı kaplamasını sağlar
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 80, // Tab bar + 40px ekstra boşluk
    marginTop: 'auto', // En alta itecek
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  darkModeOption: {
    backgroundColor: '#fff',
    marginBottom: 0,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
  },
}); 