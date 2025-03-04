import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Modal, FlatList } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { Ionicons } from '@expo/vector-icons';
import { useAyarlar } from './context/AyarlarContext';
import { useBildirim } from './context/BildirimContext';

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

  useEffect(() => {
    // Uygulama başladığında vadesi gelen giderleri kontrol et
    kontrolVadesiGelenGiderler();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      {/* Ay Seçici */}
      <View style={[styles.aySeciciContainer, { backgroundColor: tema.cardBackground }]}>
        <TouchableOpacity 
          style={styles.aySeciciButton}
          onPress={() => setAySeciciVisible(true)}
        >
          <View style={styles.aySeciciContent}>
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              color={tema.primary}
              style={styles.aySeciciIcon}
            />
            <Text style={[styles.aySeciciText, { color: tema.text }]}>
              {aylar[secilenAy]}
            </Text>
            <Ionicons 
              name="chevron-down-outline" 
              size={20} 
              color={tema.textSecondary}
            />
          </View>
        </TouchableOpacity>
      </View>

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

      {/* Üst Kart */}
      <View style={[styles.topCard, { backgroundColor: tema.primary }]}>
        <View style={styles.topCardHeader}>
          <Text style={[styles.topCardTitle, { color: '#fff' }]}>
            {t('toplamBakiye')}
          </Text>
          <TouchableOpacity 
            onPress={() => bakiyeGizliDegistir(!bakiyeGizli)}
            style={styles.eyeButton}
          >
            <Ionicons 
              name={bakiyeGizli ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.balanceAmount, { color: '#fff' }]}>
          {gizliMiktar(bakiye)}
        </Text>
        <Text style={[styles.balanceChange, { color: '#fff' }]}>
          {bakiye >= 0 ? '↑' : '↓'} {t('sonHaftayaGore')} {gizliMiktar(Math.abs(bakiye))} {bakiye >= 0 ? t('artis') : t('azalis')}
        </Text>
      </View>

      {/* İşlem Kartları */}
      <View style={styles.transactionCards}>
        <TouchableOpacity 
          style={[
            styles.card, 
            styles.incomeCard,
            { backgroundColor: tema.cardBackground }
          ]}
          onPress={() => router.push('/gelir')}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: tema.text }]}>
              {t('gelirler')}
            </Text>
            <Text style={[styles.cardAmount, { color: tema.text }]}>
              {gizliMiktar(toplamGelir)}
            </Text>
          </View>
          {!bakiyeGizli && (
            <View style={[styles.categoryList, { borderTopColor: tema.border }]}>
              {getGelirKategoriToplam().map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={[styles.categoryName, { color: tema.textSecondary }]}>
                    {item.kategori}
                  </Text>
                  <Text style={[styles.categoryAmount, { color: tema.text }]}>
                    {paraBirimiSembol}{formatNumber((item.miktar || 0).toFixed(2))}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.card, 
            styles.expenseCard,
            { backgroundColor: tema.cardBackground }
          ]}
          onPress={() => router.push('/gider')}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: tema.text }]}>
              {t('giderler')}
            </Text>
            <Text style={[styles.cardAmount, { color: tema.text }]}>
              {gizliMiktar(toplamGider)}
            </Text>
          </View>
          {!bakiyeGizli && (
            <View style={[styles.categoryList, { borderTopColor: tema.border }]}>
              {getGiderKategoriToplam().map((item, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={[styles.categoryName, { color: tema.textSecondary }]}>
                    {item.kategori}
                  </Text>
                  <Text style={[styles.categoryAmount, { color: tema.text }]}>
                    {paraBirimiSembol}{formatNumber((item.miktar || 0).toFixed(2))}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topCard: {
    backgroundColor: '#7B61FF',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topCardTitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceChange: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  transactionCards: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eyeButton: {
    padding: 5,
  },
  categoryList: {
    marginTop: 10,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryName: {
    fontSize: 12,
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: '500',
  },
  aySeciciContainer: {
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  aySeciciButton: {
    padding: 16,
  },
  aySeciciContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aySeciciIcon: {
    marginRight: 8,
  },
  aySeciciText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
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
}); 