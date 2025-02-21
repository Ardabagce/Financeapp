import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { Ionicons } from '@expo/vector-icons';
import { useAyarlar } from './context/AyarlarContext';

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
    GIDER_KATEGORILERI
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

  const gizliMiktar = (miktar) => {
    return bakiyeGizli ? '******' : `${paraBirimiSembol}${formatNumber(miktar.toFixed(2))}`;
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
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
                    {paraBirimiSembol}{formatNumber(item.miktar.toFixed(2))}
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
                    {paraBirimiSembol}{formatNumber(item.miktar.toFixed(2))}
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
}); 