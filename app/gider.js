import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView, Dimensions, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useAyarlar } from './context/AyarlarContext';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Gider() {
  const router = useRouter();
  const { giderler, giderSil, formatNumber, yaklasanGiderler, gideriTamamla, yaklasanGiderSil, GIDER_KATEGORILERI } = useFinans();
  const { t, getParaBirimiSembol, tema } = useAyarlar();
  const paraBirimiSembol = getParaBirimiSembol();

  const formatTarih = (tarih) => {
    return new Date(tarih).toLocaleDateString('tr-TR');
  };

  const gideriSil = (id) => {
    const isYaklasan = yaklasanGiderler.some(g => g.id === id);
    
    Alert.alert(
      t('gideriSil'),
      t('gideriSilOnay'),
      [
        { text: t('iptal'), style: 'cancel' },
        { 
          text: t('sil'), 
          style: 'destructive',
          onPress: async () => {
            if (isYaklasan) {
              await yaklasanGiderSil(id);
            } else {
              await giderSil(id);
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
          onPress={() => gideriSil(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#fff" />
          <Text style={styles.deleteText}>{t('silButon')}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGider = ({ item }) => {
    const isYaklasan = yaklasanGiderler.some(g => g.id === item.id);
    
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
                t('gideriTamamla'),
                t('gideriTamamlaOnay'),
                [
                  { text: t('iptal'), style: 'cancel' },
                  { 
                    text: t('tamamla'), 
                    onPress: () => gideriTamamla(item.id)
                  }
                ]
              );
            }
          }}
          style={[
            styles.giderItem,
            { backgroundColor: tema.cardBackground },
            isYaklasan && styles.yaklasanGider
          ]}
        >
          <View style={[styles.leftBorder, { backgroundColor: tema.danger }]} />
          <View style={styles.giderBilgi}>
            <View style={styles.baslikRow}>
              <Text style={[styles.kategori, { color: tema.text }]}>
                {t(item.kategori?.toLowerCase() || 'kategori_diger')}
              </Text>
              <TouchableOpacity 
                style={styles.islemButon}
                onPress={() => router.push({
                  pathname: '/gider-ekle',
                  params: {
                    duzenle: 'true',
                    id: item.id,
                    miktar: item.miktar.toString(),
                    aciklama: item.aciklama,
                    kategori: item.kategori || GIDER_KATEGORILERI.DIGER,
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
      <View style={[styles.topCard, { backgroundColor: tema.cardBackground }]}>
        <View style={styles.topCardHeader}>
          <Text style={[styles.topCardTitle, { color: tema.text }]}>
            {t('toplamGider')}
          </Text>
        </View>
        <Text style={[styles.balanceAmount, { color: tema.text }]}>
          {paraBirimiSembol}{formatNumber(giderler.reduce((sum, item) => sum + item.miktar, 0).toFixed(2))}
        </Text>
        <Text style={[styles.balanceChange, { color: tema.textSecondary }]}>
          {t('buAyEklenenGider')}: {giderler.length}
        </Text>
      </View>

      {/* Liste */}
      <View style={styles.transactionCards}>
        <FlatList
          data={[...giderler, ...yaklasanGiderler]}
          renderItem={renderGider}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Yeni Gider Ekleme Butonu */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={[styles.floatingButton, { backgroundColor: tema.danger }]}
          onPress={() => router.push('/gider-ekle')}
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
  yaklasanGider: {
    opacity: 0.6,
  },
  altBilgi: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tarih: {
    fontSize: 12,
    color: '#666',
  },
}); 