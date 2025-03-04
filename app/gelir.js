import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, Dimensions, Animated, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useAyarlar } from './context/AyarlarContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Gelir() {
  const router = useRouter();
  const pathname = usePathname();
  const { gelirler, gelirSil, formatNumber, yaklasanGelirler, geliriTamamla, yaklasanGelirSil } = useFinans();
  const { t, getParaBirimiSembol, tema } = useAyarlar();
  const paraBirimiSembol = getParaBirimiSembol();

  const formatTarih = (tarih) => {
    return new Date(tarih).toLocaleDateString('tr-TR');
  };

  const geliriSil = (id) => {
    const isYaklasan = yaklasanGelirler.some(g => g.id === id);
    
    Alert.alert(
      t('geliriSil'),
      t('geliriSilOnay'),
      [
        { text: t('iptal'), style: 'cancel' },
        { 
          text: t('sil'), 
          style: 'destructive',
          onPress: async () => {
            if (isYaklasan) {
              await yaklasanGelirSil(id);
            } else {
              await gelirSil(id);
            }
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
          onPress={() => geliriSil(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.deleteText}>{t('silButon')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGelir = ({ item }) => {
    const isYaklasan = yaklasanGelirler.some(g => g.id === item.id);
    
    return (
      <Swipeable
        renderRightActions={(progress, dragX) => 
          renderRightActions(progress, dragX, item)
        }
        overshootRight={false}
        friction={2}
      >
        <Pressable
          onLongPress={() => {
            if (isYaklasan) {
              Alert.alert(
                t('geliriTamamla'),
                t('geliriTamamlaOnay'),
                [
                  { text: t('iptal'), style: 'cancel' },
                  { 
                    text: t('tamamla'), 
                    onPress: () => geliriTamamla(item.id)
                  }
                ]
              );
            }
          }}
          style={[
            styles.gelirItem,
            { backgroundColor: tema.cardBackground },
            isYaklasan && styles.yaklasanGelir
          ]}
        >
          <View style={[styles.leftBorder, { backgroundColor: tema.success }]} />
          <View style={styles.gelirBilgi}>
            <View style={styles.baslikRow}>
              <Text style={[styles.kategori, { color: tema.text }]}>
                {t(item.kategori?.toLowerCase() || 'kategori_diger')}
              </Text>
              <TouchableOpacity 
                style={styles.islemButon}
                onPress={() => router.push({
                  pathname: '/gelir-ekle',
                  params: {
                    duzenle: 'true',
                    id: item.id,
                    miktar: item.miktar.toString(),
                    aciklama: item.aciklama,
                    kategori: item.kategori || GELIR_KATEGORILERI.DIGER,
                    yaklasan: isYaklasan.toString(),
                  }
                })}
              >
                <Ionicons name="pencil-outline" size={18} color={tema.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.aciklama, { color: tema.textSecondary }]}>
              {item.aciklama}
            </Text>
            <View style={styles.altBilgi}>
              <Text style={[styles.tarih, { color: tema.textTertiary }]}>
                {formatTarih(item.tarih)}
              </Text>
              <Text style={[styles.miktar, { color: tema.text }]}>
                {paraBirimiSembol}{formatNumber(item.miktar.toFixed(2))}
              </Text>
            </View>
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      {/* Üst Kart */}
      <View style={[styles.topCard, { 
        backgroundColor: tema.success,
      }]}>
        <View style={styles.topCardHeader}>
          <Text style={[styles.topCardTitle, { color: '#fff' }]}>
            {t('toplamGelir')}
          </Text>
        </View>
        <Text style={[styles.balanceAmount, { color: '#fff' }]}>
          {paraBirimiSembol}{formatNumber((gelirler.reduce((sum, item) => sum + (item.miktar || 0), 0) || 0).toFixed(2))}
        </Text>
        <Text style={[styles.balanceChange, { color: '#fff', opacity: 0.8 }]}>
          {t('buAyEklenenGelir')}: {gelirler.length}
        </Text>
      </View>

      {/* Liste */}
      <View style={styles.transactionCards}>
        <FlatList
          data={[...gelirler, ...yaklasanGelirler]}
          renderItem={renderGelir}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Yeni Gelir Ekleme Butonu */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={[styles.floatingButton, { backgroundColor: tema.success }]}
          onPress={() => router.push('/gelir-ekle')}
        >
          <Ionicons name="add" size={30} color="#fff" />
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
    backgroundColor: '#4CAF50',
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
  gelirItem: {
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
    backgroundColor: '#4CAF50',
  },
  gelirBilgi: {
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
    color: '#4CAF50',
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
    color: '#4CAF50',
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
  yaklasanGelir: {
    opacity: 0.6,
  },
  altBilgi: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tarih: {
    fontSize: 14,
    color: '#666',
  },
}); 