import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { Ionicons } from '@expo/vector-icons';

export default function AnaSayfa() {
  const router = useRouter();
  const pathname = usePathname();
  const { toplamGelir, toplamGider, formatNumber } = useFinans();
  const bakiye = toplamGelir - toplamGider;

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Kart */}
      <View style={styles.topCard}>
        <View style={styles.topCardHeader}>
          <Text style={styles.topCardTitle}>Toplam Bakiye</Text>
        </View>
        <Text style={styles.balanceAmount}>₺{formatNumber(bakiye.toFixed(2))}</Text>
        <Text style={styles.balanceChange}>
          {bakiye >= 0 ? '↑' : '↓'} Son haftaya göre {formatNumber(Math.abs(bakiye).toFixed(2))}₺ {bakiye >= 0 ? 'artış' : 'azalış'}
        </Text>
      </View>

      {/* İşlem Kartları */}
      <View style={styles.transactionCards}>
        <TouchableOpacity 
          style={[styles.card, styles.incomeCard]}
          onPress={() => router.push('/gelir')}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Gelirler</Text>
            <Text style={styles.cardAmount}>₺{formatNumber(toplamGelir.toFixed(2))}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.card, styles.expenseCard]}
          onPress={() => router.push('/gider')}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Giderler</Text>
            <Text style={styles.cardAmount}>₺{formatNumber(toplamGider.toFixed(2))}</Text>
          </View>
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
    color: '#333',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
}); 