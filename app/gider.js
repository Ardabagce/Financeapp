import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Gider() {
  const router = useRouter();
  const { giderler, giderSil, formatNumber } = useFinans();

  const formatTarih = (tarih) => {
    return new Date(tarih).toLocaleDateString('tr-TR');
  };

  const gideriSil = (id) => {
    Alert.alert(
      'Gideri Sil',
      'Bu gideri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            await giderSil(id);
          }
        }
      ]
    );
  };

  const renderRightActions = (progress, dragX, item) => {
    return (
      <View style={styles.deleteContainer}>
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => gideriSil(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.deleteText}>Sil</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGider = ({ item }) => (
    <Swipeable
      renderRightActions={(progress, dragX) => 
        renderRightActions(progress, dragX, item)
      }
      overshootRight={false}
      friction={2}
    >
      <View style={styles.giderItem}>
        <View style={styles.leftBorder} />
        <View style={styles.giderBilgi}>
          <View style={styles.baslikRow}>
            <Text style={styles.kategori}>{item.kategori || 'Diğer'}</Text>
            <TouchableOpacity 
              style={styles.islemButon}
              onPress={() => router.push({
                pathname: '/gider-ekle',
                params: { 
                  duzenle: true, 
                  id: item.id,
                  miktar: item.miktar.toString(),
                  aciklama: item.aciklama,
                  kategori: item.kategori
                }
              })}
            >
              <Ionicons name="pencil" size={18} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.aciklama}>{item.aciklama}</Text>
          <Text style={styles.miktar}>₺{formatNumber(item.miktar.toFixed(2))}</Text>
        </View>
      </View>
    </Swipeable>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Üst Kart */}
      <View style={styles.topCard}>
        <View style={styles.topCardHeader}>
          <Text style={styles.topCardTitle}>Toplam Gider</Text>
        </View>
        <Text style={styles.balanceAmount}>
          ₺{formatNumber(giderler.reduce((sum, item) => sum + item.miktar, 0).toFixed(2))}
        </Text>
        <Text style={styles.balanceChange}>
          Bu ay eklenen gider sayısı: {giderler.length}
        </Text>
      </View>

      {/* Liste */}
      <View style={styles.transactionCards}>
        <FlatList
          data={giderler}
          renderItem={renderGider}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Yeni Gider Ekleme Butonu */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => router.push('/gider-ekle')}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Yeni Tab Bar */}
      <View style={styles.newTabBar}>
        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={24} color="#666" />
          <Text style={styles.tabText}>Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem}
          onPress={() => router.push('/gelir')}
        >
          <Ionicons name="arrow-up-circle-outline" size={24} color="#666" />
          <Text style={styles.tabText}>Gelir</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabItem, styles.activeTab]}
        >
          <Ionicons name="arrow-down-circle" size={24} color="#f44336" />
          <Text style={[styles.tabText, styles.activeTabText]}>Gider</Text>
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
    backgroundColor: '#f44336',
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
    flex: 1,
    paddingHorizontal: 16,
    marginBottom: 60,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  floatingButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 105,
    zIndex: 2,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  giderItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    overflow: 'hidden',
  },
  leftBorder: {
    width: 4,
    backgroundColor: '#f44336',
  },
  giderBilgi: {
    flex: 1,
    padding: 16,
  },
  baslikRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kategori: {
    fontSize: 14,
    color: '#f44336',
    fontWeight: '500',
  },
  aciklama: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  miktar: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: 8,
  },
  butonlar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  islemButon: {
    padding: 8,
    marginLeft: 8,
  },
  newTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 25,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#f44336',
    fontWeight: '500',
  },
  deleteContainer: {
    marginBottom: 12,
    width: 90,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
}); 