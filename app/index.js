import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal, FlatList, ScrollView, Alert } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { Ionicons } from '@expo/vector-icons';
import { useAyarlar } from './context/AyarlarContext';
import { useBildirim } from './context/BildirimContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tripEventEmitter } from './utils/eventEmitter';

export default function AnaSayfa() {
  const router = useRouter();
  const pathname = usePathname();
  const { 
    toplamGelir, 
    toplamGider, 
    formatNumber,
    gelirler,
    giderler,
    GELIR_KATEGORILERI,
    GIDER_KATEGORILERI,
    secilenAy,
    ayDegistir,
    aylar
  } = useFinans();
  const bakiye = toplamGelir - toplamGider;
  const { 
    t, 
    getParaBirimiSembol, 
    tema,
    bakiyeGizli,
    bakiyeGizliDegistir 
  } = useAyarlar();
  const paraBirimiSembol = getParaBirimiSembol();
  const [aySeciciVisible, setAySeciciVisible] = useState(false);
  const { kontrolVadesiGelenGiderler } = useBildirim();
  const [savedTrips, setSavedTrips] = useState([]);

  const gizliMiktar = (miktar) => {
    if (miktar === undefined || miktar === null) {
      return bakiyeGizli ? '******' : `${paraBirimiSembol}0.00`;
    }
    return bakiyeGizli ? '******' : `${paraBirimiSembol}${formatNumber((miktar || 0).toFixed(2))}`;
  };

  // Kategori toplamlarını hesaplayan fonksiyonlar
  const getGelirKategoriToplam = () => {
    const kategoriToplam = {};
    gelirler.forEach(gelir => {
      const kategoriId = gelir.kategori || GELIR_KATEGORILERI.DIGER;
      if (kategoriToplam[kategoriId]) {
        kategoriToplam[kategoriId] += gelir.miktar;
      } else {
        kategoriToplam[kategoriId] = gelir.miktar;
      }
    });
    return Object.entries(kategoriToplam).map(([kategori, miktar]) => ({
      kategori: t(kategori),
      miktar
    }));
  };

  const getGiderKategoriToplam = () => {
    const kategoriToplam = {};
    giderler.forEach(gider => {
      const kategoriId = gider.kategori || GIDER_KATEGORILERI.DIGER;
      if (kategoriToplam[kategoriId]) {
        kategoriToplam[kategoriId] += gider.miktar;
      } else {
        kategoriToplam[kategoriId] = gider.miktar;
      }
    });
    return Object.entries(kategoriToplam).map(([kategori, miktar]) => ({
      kategori: t(kategori),
      miktar
    }));
  };

  // Event listener'ı ekle
  useEffect(() => {
    const updateTrips = () => {
      loadSavedTrips();
    };

    // Event listener'ı ekle
    tripEventEmitter.on('tripUpdated', updateTrips);

    // Cleanup
    return () => {
      tripEventEmitter.off('tripUpdated', updateTrips);
    };
  }, []);

  // Seyahat verilerini yeniden yükleme fonksiyonu
  const loadSavedTrips = async () => {
    try {
      const savedTripsData = await AsyncStorage.getItem('savedTrips');
      console.log('Yüklenen seyahat verileri:', savedTripsData);
      
      if (savedTripsData) {
        const trips = JSON.parse(savedTripsData);
        console.log('Parsed trips:', trips);
        setSavedTrips(trips);
      }
    } catch (error) {
      console.error('Seyahat yükleme hatası:', error);
    }
  };

  useEffect(() => {
    // Uygulama başladığında vadesi gelen giderleri kontrol et
    kontrolVadesiGelenGiderler();
  }, []);

  // Sayfa fokuslandığında seyahatleri yeniden yükle
  useEffect(() => {
    if (pathname === '/') {
      loadSavedTrips();
    }
  }, [pathname]);

  // İlk yüklemede örnek veriyi ekle
  useEffect(() => {
    const initializeTrips = async () => {
      try {
        const savedTripsData = await AsyncStorage.getItem('savedTrips');
        if (!savedTripsData) {
          const testTrip = [{
            id: '1',
            location: 'Antalya',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalCost: 5000
          }];
          await AsyncStorage.setItem('savedTrips', JSON.stringify(testTrip));
          setSavedTrips(testTrip);
          console.log('Test seyahati eklendi:', testTrip);
        } else {
          setSavedTrips(JSON.parse(savedTripsData));
        }
      } catch (error) {
        console.error('Seyahat yükleme hatası:', error);
      }
    };
    initializeTrips();
  }, []);

  // Debug için savedTrips state'ini izleyelim
  useEffect(() => {
    console.log('Güncel savedTrips:', savedTrips);
  }, [savedTrips]);

  // Seyahat silme fonksiyonu
  const deleteTrip = async (tripId) => {
    try {
      // Kullanıcıya silme işlemini onayla
      Alert.alert(
        "Seyahati Sil",
        "Bu seyahati silmek istediğinizden emin misiniz?",
        [
          {
            text: "İptal",
            style: "cancel"
          },
          {
            text: "Sil",
            style: "destructive",
            onPress: async () => {
              // Mevcut seyahatleri al
              const savedTripsData = await AsyncStorage.getItem('savedTrips');
              if (savedTripsData) {
                const trips = JSON.parse(savedTripsData);
                // Seçilen seyahati filtrele
                const updatedTrips = trips.filter(trip => trip.id !== tripId);
                // Güncellenmiş listeyi kaydet
                await AsyncStorage.setItem('savedTrips', JSON.stringify(updatedTrips));
                // State'i güncelle
                setSavedTrips(updatedTrips);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Seyahat silme hatası:', error);
      Alert.alert("Hata", "Seyahat silinirken bir hata oluştu");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Ay Seçici Buton */}
        <TouchableOpacity 
          style={[styles.monthSelector, { backgroundColor: tema.cardBackground }]}
          onPress={() => setAySeciciVisible(true)}
        >
          <View style={styles.monthSelectorContent}>
            <Ionicons name="calendar-outline" size={24} color={tema.primary} />
            <Text style={[styles.monthSelectorText, { color: tema.text }]}>
              {secilenAy === 'all' ? 'Tümü' : t(secilenAy)}
            </Text>
            <Ionicons name="chevron-down" size={24} color={tema.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Üst Bilgi Kartı */}
        <View style={[styles.topCard, { backgroundColor: tema.cardBackground }]}>
          <View style={styles.balanceSection}>
            <Text style={[styles.balanceTitle, { color: tema.textSecondary }]}>
              {t('toplamBakiye')}
            </Text>
            <View style={styles.balanceRow}>
              <Text style={[styles.balanceAmount, { color: tema.text }]}>
                {gizliMiktar(bakiye)}
              </Text>
              <TouchableOpacity 
                onPress={() => bakiyeGizliDegistir(!bakiyeGizli)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={bakiyeGizli ? "eye-off" : "eye"} 
                  size={24} 
                  color={tema.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceChange}>
              <Ionicons 
                name={bakiye >= 0 ? "trending-up" : "trending-down"} 
                size={20} 
                color={bakiye >= 0 ? tema.success : tema.error} 
              />
              <Text style={[styles.changeText, { 
                color: bakiye >= 0 ? tema.success : tema.error,
                marginLeft: 4
              }]}>
                {bakiye >= 0 ? t('artis') : t('azalis')}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: tema.background }]}>
              <Text style={[styles.statTitle, { color: tema.textSecondary }]}>
                {t('gelirler')}
              </Text>
              <Text style={[styles.statAmount, { color: tema.success }]}>
                {gizliMiktar(toplamGelir)}
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: tema.background }]}>
              <Text style={[styles.statTitle, { color: '#FF4B4B' }]}>
                {t('giderler')}
              </Text>
              <Text style={[styles.statAmount, { color: '#FF4B4B' }]}>
                {gizliMiktar(toplamGider)}
              </Text>
            </View>
          </View>
        </View>

        {/* Hızlı İşlemler */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: tema.success + '20' }]}
            onPress={() => router.push('/gelir-ekle')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: tema.success + '40' }]}>
              <Ionicons name="add-circle" size={24} color={tema.success} />
            </View>
            <Text style={[styles.quickActionText, { color: tema.success }]}>
              {t('yeniGelir')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: '#FF4B4B40' }]}
            onPress={() => router.push('/gider-ekle')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FF4B4B80' }]}>
              <Ionicons name="remove-circle" size={24} color="#FF4B4B" />
            </View>
            <Text style={[styles.quickActionText, { color: '#FF4B4B' }]}>
              {t('yeniGider')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: tema.primary + '20' }]}
            onPress={() => router.push('/seyahat-planla')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: tema.primary + '40' }]}>
              <Ionicons name="airplane" size={24} color={tema.primary} />
            </View>
            <Text style={[styles.quickActionText, { color: tema.primary }]}>
              {t('seyahatPlanla')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Planlanan Seyahatler */}
        {savedTrips.length > 0 && (
          <View style={[styles.tripsContainer, { backgroundColor: tema.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="map" size={24} color={tema.primary} />
                <Text style={[styles.sectionTitle, { color: tema.text }]}>
                  {t('planlanmisSeyahatler')}
                </Text>
              </View>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tripsScrollView}
            >
              {savedTrips
                .map((trip, index) => (
                  <TouchableOpacity 
                    key={trip.id}
                    style={[styles.tripCard, { 
                      backgroundColor: tema.background,
                      marginRight: index === savedTrips.length - 1 ? 16 : 8
                    }]}
                    onPress={() => {
                      router.push({
                        pathname: '/seyahat-planla',
                        params: {
                          editMode: true,
                          tripId: trip.id,
                          location: trip.location,
                          startDate: trip.startDate,
                          endDate: trip.endDate,
                          totalCost: trip.totalCost,
                          expenses: JSON.stringify(trip.expenses || {})
                        }
                      });
                    }}
                  >
                    <View style={[styles.tripImageContainer, { backgroundColor: tema.primary + '20' }]}>
                      <Ionicons name="airplane" size={32} color={tema.primary} />
                    </View>
                    <View style={styles.tripInfo}>
                      <Text style={[styles.tripLocation, { color: tema.text }]} numberOfLines={1}>
                        {trip.location}
                      </Text>
                      <Text style={[styles.tripDate, { color: tema.textSecondary }]} numberOfLines={1}>
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </Text>
                      <Text style={[styles.tripCost, { color: tema.primary }]}>
                        {paraBirimiSembol}{formatNumber(trip.totalCost.toFixed(2))}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Ay Seçici Modal */}
      <Modal
        visible={aySeciciVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAySeciciVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: tema.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: tema.text }]}>
                {t('aySecin')}
              </Text>
              <TouchableOpacity 
                onPress={() => setAySeciciVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={tema.textSecondary} 
                />
              </TouchableOpacity>
            </View>
            <FlatList
              data={Object.entries(aylar)}
              keyExtractor={([key]) => key}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: [key, value] }) => (
                <TouchableOpacity
                  style={[
                    styles.ayItem,
                    { borderColor: tema.border },
                    secilenAy === key && { 
                      backgroundColor: tema.primaryLight,
                      borderColor: tema.primary 
                    }
                  ]}
                  onPress={() => {
                    ayDegistir(key);
                    setAySeciciVisible(false);
                  }}
                >
                  <View style={styles.ayItemContent}>
                    <Text style={[
                      styles.ayItemText,
                      { color: tema.text },
                      secilenAy === key && { color: tema.primary }
                    ]}>
                      {value}
                    </Text>
                    {secilenAy === key && (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={tema.primary} 
                      />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 60,
  },
  topCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 12,
  },
  balanceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tripsContainer: {
    marginHorizontal: 16,
    marginBottom: 50,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tripsScrollView: {
    marginLeft: 0,
  },
  tripCard: {
    width: 200,
    borderRadius: 16,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripImageContainer: {
    height: 100,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripInfo: {
    padding: 12,
  },
  tripLocation: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  tripCost: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: 4,
  },
  ayItem: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  ayItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ayItemText: {
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 20,
  },
  monthSelector: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthSelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 