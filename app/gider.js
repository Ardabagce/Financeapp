import React, { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert, SafeAreaView, Dimensions, Animated, Pressable, Modal, TouchableWithoutFeedback } from 'react-native';
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
  const [seciliGiderId, setSeciliGiderId] = useState(null);
  const [menuAcik, setMenuAcik] = useState(false);
  
  // Animasyon değerleri
  const menuScale = useRef(new Animated.Value(0)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;
  const buttonRotation = useRef(new Animated.Value(0)).current;
  
  // Menüyü aç/kapat
  const toggleMenu = () => {
    if (menuAcik) {
      // Menüyü kapat
      Animated.parallel([
        Animated.spring(menuScale, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(menuOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.spring(buttonRotation, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        })
      ]).start(() => setMenuAcik(false));
    } else {
      // Menüyü aç
      setMenuAcik(true);
      Animated.parallel([
        Animated.spring(menuScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(menuOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.spring(buttonRotation, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true
        })
      ]).start();
    }
  };
  
  // Buton döndürme animasyonu için
  const spin = buttonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const formatTarih = (tarih) => {
    if (!tarih) return '';
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
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={styles.deleteContainer}
        onPress={() => gideriSil(item.id)}
      >
        <Animated.View style={[styles.deleteButton, { transform: [{ scale }] }]}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
          <Text style={styles.deleteText}>{t('silButon')}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderGider = ({ item }) => {
    // Null veya undefined değerlere karşı koruma
    const miktar = item.miktar || 0;
    const isYaklasan = yaklasanGiderler.some(g => g.id === item.id);
    const kategoriAdi = GIDER_KATEGORILERI[item.kategori] || GIDER_KATEGORILERI.DIGER;
    
    return (
      <Swipeable
        renderRightActions={(progress, dragX) => 
          renderRightActions(progress, dragX, item)
        }
        overshootRight={false}
        friction={2}
        rightThreshold={40}
        containerStyle={styles.swipeableContainer}
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
                {t(kategoriAdi)}
              </Text>
              <TouchableOpacity 
                style={styles.islemButon}
                onPress={() => router.push({
                  pathname: '/gider-ekle',
                  params: {
                    duzenle: 'true',
                    id: item.id,
                    miktar: miktar.toString(),
                    aciklama: item.aciklama || '',
                    kategori: item.kategori || GIDER_KATEGORILERI.DIGER,
                    yaklasan: isYaklasan.toString(),
                  }
                })}
              >
                <Ionicons name="pencil-outline" size={18} color={tema.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.aciklama, { color: tema.textSecondary }]}>
              {item.aciklama || ''}
            </Text>
            <View style={styles.altBilgi}>
              <Text style={[styles.tarih, { color: tema.textTertiary }]}>
                {formatTarih(item.tarih)}
              </Text>
              <Text style={[styles.miktar, { color: tema.text }]}>
                {paraBirimiSembol}{formatNumber(miktar.toFixed(2))}
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
        backgroundColor: tema.danger,
      }]}>
        <View style={styles.topCardHeader}>
          <Text style={[styles.topCardTitle, { color: '#fff' }]}>
            {t('toplamGider')}
          </Text>
        </View>
        <Text style={[styles.balanceAmount, { color: '#fff' }]}>
          {paraBirimiSembol}{formatNumber(((giderler && giderler.length > 0) ? giderler.reduce((sum, item) => sum + (parseFloat(item.miktar) || 0), 0) : 0).toFixed(2))}
        </Text>
        <Text style={[styles.balanceChange, { color: '#fff', opacity: 0.8 }]}>
          {t('buAyEklenenGider')}: {giderler ? giderler.length : 0}
        </Text>
      </View>

      {/* Liste */}
      <View style={styles.transactionCards}>
        <FlatList
          data={[...(giderler || []), ...(yaklasanGiderler || [])]}
          renderItem={renderGider}
          keyExtractor={item => (item && item.id) ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Silme Onay Modalı */}
      <Modal
        transparent={true}
        visible={seciliGiderId !== null}
        onRequestClose={() => setSeciliGiderId(null)}
        animationType="fade"
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSeciliGiderId(null)}
        >
          <View 
            style={[styles.modalContent, { backgroundColor: tema.cardBackground }]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <Text style={[styles.modalTitle, { color: tema.text }]}>
              {t('gideriSil')}
            </Text>
            <Text style={[styles.modalText, { color: tema.textSecondary }]}>
              {t('gideriSilOnay')}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setSeciliGiderId(null)}
              >
                <Text style={styles.modalButtonText}>{t('vazgec')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => {
                  gideriSil(seciliGiderId);
                  setSeciliGiderId(null);
                }}
              >
                <Text style={styles.modalButtonText}>{t('sil')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Animasyonlu Menü */}
      {menuAcik && (
        <TouchableWithoutFeedback onPress={toggleMenu}>
          <View style={styles.menuOverlay}>
            <Animated.View 
              style={[
                styles.menuContainer,
                {
                  opacity: menuOpacity,
                  transform: [{ scale: menuScale }]
                }
              ]}
            >
              <TouchableOpacity 
                style={[styles.floatingButton, { backgroundColor: '#FFA726' }]}
                onPress={() => {
                  toggleMenu();
                  router.push('/seyahat-planla');
                }}
              >
                <Ionicons name="airplane" size={28} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.floatingButton, { backgroundColor: '#f44336', marginTop: 16 }]}
                onPress={() => {
                  toggleMenu();
                  router.push('/gider-ekle');
                }}
              >
                <Ionicons name="remove-circle" size={28} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Ana Ekle Butonu */}
      <View style={styles.mainButtonContainer}>
        <TouchableOpacity 
          style={[styles.floatingButton, { backgroundColor: '#f44336' }]}
          onPress={() => toggleMenu()}
          onLongPress={() => toggleMenu()}
        >
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons name="add" size={28} color="white" />
          </Animated.View>
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
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 8,
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
    width: 70,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#7B61FF33',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 998,
  },
  menuContainer: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    alignItems: 'flex-end',
  },
  mainButtonContainer: {
    position: 'absolute',
    right: 20,
    bottom: 105,
    zIndex: 999,
  },
  swipeableContainer: {
    marginBottom: 0,
  },
}); 