import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Image, FlatList, SafeAreaView, Alert, useColorScheme, Platform, Modal, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAyarlar } from './context/AyarlarContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tripEventEmitter } from './utils/eventEmitter';

export default function SeyahatPlanla() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditMode = params?.editMode === 'true';
  const { t, tema, language } = useAyarlar();
  const [searchQuery, setSearchQuery] = useState('');
  const [tarihPickerVisible, setTarihPickerVisible] = useState(false);
  const [aktifTarihSecimi, setAktifTarihSecimi] = useState('baslangic');
  const [baslangicTarihi, setBaslangicTarihi] = useState(
    isEditMode ? new Date(params.startDate) : new Date()
  );
  const [bitisTarihi, setBitisTarihi] = useState(
    isEditMode ? new Date(params.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expenses, setExpenses] = useState(
    isEditMode && params.expenses ? JSON.parse(params.expenses) : {}
  );
  const [location, setLocation] = useState(isEditMode ? params.location : '');
  const [savedTrips, setSavedTrips] = useState([]);
  
  // Android için tarih seçici durumu
  const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);
  
  // Ekran boyutlarını al
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;

  const [expenseModalVisible, setExpenseModalVisible] = useState(false);

  // Düzenleme modunda harcama detaylarını yükle
  useEffect(() => {
    const loadTripExpenses = async () => {
      if (isEditMode && params.tripId) {
        try {
          const savedTripsData = await AsyncStorage.getItem('savedTrips');
          if (savedTripsData) {
            const trips = JSON.parse(savedTripsData);
            const currentTrip = trips.find(trip => trip.id === params.tripId);
            if (currentTrip && currentTrip.expenses) {
              setExpenses(currentTrip.expenses);
              // Eğer bir kategori varsa, onu seç
              const firstCategoryWithExpense = Object.keys(currentTrip.expenses)[0];
              if (firstCategoryWithExpense) {
                const category = categories.find(cat => cat.id === firstCategoryWithExpense);
                if (category) {
                  setSelectedCategory(category);
                }
              }
            }
          }
        } catch (error) {
          console.error('Harcama detayları yüklenirken hata:', error);
        }
      }
    };

    loadTripExpenses();
  }, [isEditMode, params.tripId]);

  // Düzenleme modunda ilk kategoriyi seç
  useEffect(() => {
    if (isEditMode && params.expenses) {
      try {
        const parsedExpenses = JSON.parse(params.expenses);
        // İlk harcaması olan kategoriyi bul ve seç
        const firstCategoryWithExpense = Object.keys(parsedExpenses)[0];
        if (firstCategoryWithExpense) {
          const category = categories.find(cat => cat.id === firstCategoryWithExpense);
          if (category) {
            setSelectedCategory(category);
          }
        }
      } catch (error) {
        console.error('Harcama detayları parse edilirken hata:', error);
      }
    }
  }, [isEditMode, params.expenses]);

  // Tarih formatı
  const tarihGoster = (tarih) => {
    if (!tarih || !(tarih instanceof Date) || isNaN(tarih)) {
      return 'Geçersiz Tarih';
    }

    try {
      const gun = tarih.getDate().toString().padStart(2, '0');
      const ay = t(`ay_${(tarih.getMonth() + 1).toString().padStart(2, '0')}`);
      const yil = tarih.getFullYear();
      
      return `${gun} ${ay} ${yil}`;
    } catch (e) {
      console.error('Tarih formatı hatası:', e);
      return 'Geçersiz Tarih';
    }
  };

  // Tarih seçildiğinde - iOS
  const tarihSecildiIOS = (event, secilenTarih) => {
    if (secilenTarih) {
      const yeniTarih = new Date(secilenTarih);
      if (aktifTarihSecimi === 'baslangic') {
        setBaslangicTarihi(yeniTarih);
      } else {
        setBitisTarihi(yeniTarih);
      }
    }
  };

  // Tarih seçildiğinde - ANDROID
  const tarihSecildiAndroid = (event, secilenTarih) => {
    setShowAndroidDatePicker(false);
    
    if (event.type === 'set' && secilenTarih) {
      const yeniTarih = new Date(secilenTarih);
      if (aktifTarihSecimi === 'baslangic') {
        setBaslangicTarihi(yeniTarih);
      } else {
        setBitisTarihi(yeniTarih);
      }
    }
  };

  // Tarih seçim butonuna tıklandığında
  const tarihSeciminiGoster = (secim) => {
    setAktifTarihSecimi(secim);
    if (Platform.OS === 'android') {
      setShowAndroidDatePicker(true);
    } else {
      setTarihPickerVisible(true);
    }
  };

  // Kategori data
  const categories = [
    { id: 'hotels', icon: 'bed', title: t('konaklama'), color: '#FF5A5F', fields: ['konaklama', 'kahvalti', 'ekstra'] },
    { id: 'flights', icon: 'airplane', title: t('ucuslar'), color: '#00BCD4', fields: ['ucusBedeli', 'havalimaniTransfer', 'bagajUcreti'] },
    { id: 'cars', icon: 'car', title: t('arac'), color: '#2196F3', fields: ['aracKiralama', 'yakitGideri', 'otopark'] },
    { id: 'foods', icon: 'restaurant', title: t('yemek'), color: '#FF7043', fields: ['gunlukYemek', 'ozelRestoranlar', 'atistirmaliklar'] },
    { id: 'activities', icon: 'bicycle', title: t('aktiviteler'), color: '#FFC107', fields: ['muze', 'eglenceMerkezi', 'sporAktiviteleri'] },
    { id: 'shopping', icon: 'cart', title: t('alisveris'), color: '#4CAF50', fields: ['hediyelik', 'kisiselAlisveris', 'digerAlisveris'] },
    { id: 'transport', icon: 'bus', title: t('ulasim'), color: '#00BCD4', fields: ['taksi', 'topluTasima', 'digerUlasim'] },
    { id: 'health', icon: 'medkit', title: t('saglik'), color: '#795548', fields: ['sigorta', 'ilaclar', 'digerSaglik'] },
    { id: 'other', icon: 'apps', title: t('diger'), color: '#9C27B0', fields: ['harclik', 'planlanmamisGiderler', 'digerHarcamalar'] },
  ];

  // Toplam masrafı hesapla
  const totalExpense = useMemo(() => {
    let total = 0;
    Object.values(expenses).forEach(categoryExpense => {
      Object.values(categoryExpense).forEach(value => {
        const amount = parseFloat(value) || 0;
        total += amount;
      });
    });
    return total;
  }, [expenses]);

  // Kategori tıklandığında
  const selectCategory = (category) => {
    setSelectedCategory(category);
    setExpenseModalVisible(true);
    if (!expenses[category.id]) {
      // Kategori için varsayılan boş alanlar oluştur
      const defaultExpenses = {};
      category.fields.forEach(field => {
        defaultExpenses[field] = '';
      });
      setExpenses(prev => ({
        ...prev,
        [category.id]: defaultExpenses
      }));
    }
  };

  // Harcama güncellendiğinde
  const updateExpense = (categoryId, field, value) => {
    setExpenses(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [field]: value
      }
    }));
  };

  // Kategori fieldleri için başlıkları getir
  const getFieldTitle = (field) => {
    const fieldTitles = {
      // Konaklama
      konaklama: t('otel_ucreti'),
      kahvalti: t('kahvalti_ucreti'),
      ekstra: t('ekstra_hizmetler'),
      
      // Uçuşlar
      ucusBedeli: t('ucak_bileti'),
      havalimaniTransfer: t('havalimani_transfer'),
      bagajUcreti: t('bagaj_ucreti'),
      
      // Araç
      aracKiralama: t('arac_kiralama'),
      yakitGideri: t('yakit_gideri'),
      otopark: t('otopark_ucreti'),
      
      // Yemek
      gunlukYemek: t('gunluk_yemek'),
      ozelRestoranlar: t('restoran_harcamalari'),
      atistirmaliklar: t('atistirmaliklar'),
      
      // Aktiviteler
      muze: t('muze_ve_turlar'),
      eglenceMerkezi: t('eglence_aktiviteleri'),
      sporAktiviteleri: t('spor_etkinlikleri'),
      
      // Alışveriş
      hediyelik: t('hediyelik_esya'),
      kisiselAlisveris: t('kisisel_alisveris'),
      digerAlisveris: t('diger_alisveris'),
      
      // Ulaşım
      taksi: t('taksi_ucretleri'),
      topluTasima: t('toplu_tasima'),
      digerUlasim: t('diger_ulasim'),
      
      // Sağlık
      sigorta: t('seyahat_sigortasi'),
      ilaclar: t('ilac_giderleri'),
      digerSaglik: t('diger_saglik'),
      
      // Diğer
      harclik: t('gunluk_harclik'),
      planlanmamisGiderler: t('beklenmeyen_giderler'),
      digerHarcamalar: t('diger_harcamalar'),
    };
    
    return fieldTitles[field] || field;
  };

  const renderCategory = ({ item, index }) => {
    const isSelected = selectedCategory && selectedCategory.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          { backgroundColor: tema.cardBackground },
          isSelected && { 
            borderColor: tema.primary,
            borderWidth: 1
          }
        ]}
        onPress={() => selectCategory(item)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={item.icon} size={24} color={item.color} />
        </View>
        <Text style={[
          styles.categoryText,
          { color: tema.text },
          isSelected && { 
            fontWeight: 'bold', 
            color: tema.primary 
          }
        ]}>{item.title}</Text>
      </TouchableOpacity>
    );
  };
  
  // Kategorileri 3'lü grid olarak render et
  const renderCategoryGrid = () => {
    const rows = Math.ceil(categories.length / 3);
    const grids = [];
    
    for (let i = 0; i < rows; i++) {
      const startIdx = i * 3;
      const rowCategories = categories.slice(startIdx, startIdx + 3);
      
      grids.push(
        <View key={`row-${i}`} style={styles.categoryRow}>
          {rowCategories.map((category, index) => (
            <View key={category.id} style={{ flex: 1 }}>
              {renderCategory({ item: category, index: startIdx + index })}
            </View>
          ))}
          {/* Eğer son satırda 3'ten az kategori varsa, boş view ile dolduralım */}
          {rowCategories.length < 3 && Array(3 - rowCategories.length).fill().map((_, index) => (
            <View key={`empty-${index}`} style={{ flex: 1 }} />
          ))}
        </View>
      );
    }
    
    return grids;
  };
  
  // Tarih seçimi bölümü render edildiğinde
  const renderDateSection = () => {
    return (
      <View style={styles.dateSection}>
        <View style={styles.dateContainer}>
          <Text style={[styles.dateLabel, { color: tema.textSecondary }]}>
            {t('baslangicTarihi')}:
          </Text>
          <TouchableOpacity 
            style={[
              styles.dateButton,
              { 
                backgroundColor: tema.cardBackground,
                borderColor: tema.border
              }
            ]}
            onPress={() => tarihSeciminiGoster('baslangic')}
          >
            <Text style={[styles.dateButtonText, { color: tema.text }]}>
              {tarihGoster(baslangicTarihi)}
            </Text>
            <Ionicons name="calendar" size={18} color={tema.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.dateContainer}>
          <Text style={[styles.dateLabel, { color: tema.textSecondary }]}>
            {t('bitisTarihi')}:
          </Text>
          <TouchableOpacity 
            style={[
              styles.dateButton,
              { 
                backgroundColor: tema.cardBackground,
                borderColor: tema.border
              }
            ]}
            onPress={() => tarihSeciminiGoster('bitis')}
          >
            <Text style={[styles.dateButtonText, { color: tema.text }]}>
              {tarihGoster(bitisTarihi)}
            </Text>
            <Ionicons name="calendar" size={18} color={tema.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const saveTrip = async () => {
    if (!location) {
      Alert.alert(
        "Uyarı",
        "Lütfen seyahat edilecek yeri girin",
        [{ text: "Tamam" }]
      );
      return;
    }

    try {
      console.log('Seyahat kaydetme başladı');
      
      // Mevcut seyahatleri al
      const existingTripsData = await AsyncStorage.getItem('savedTrips');
      let existingTrips = existingTripsData ? JSON.parse(existingTripsData) : [];

      if (isEditMode) {
        // Düzenleme modunda: Mevcut seyahati güncelle
        existingTrips = existingTrips.map(trip => 
          trip.id === params.tripId
            ? {
                id: params.tripId,
                location,
                startDate: baslangicTarihi.toISOString(),
                endDate: bitisTarihi.toISOString(),
                totalCost: totalExpense,
                expenses: expenses // Harcama detaylarını da kaydet
              }
            : trip
        );
      } else {
        // Yeni seyahat ekleme
        const newTrip = {
          id: Date.now().toString(),
          location,
          startDate: baslangicTarihi.toISOString(),
          endDate: bitisTarihi.toISOString(),
          totalCost: totalExpense,
          expenses: expenses // Harcama detaylarını da kaydet
        };
        existingTrips.push(newTrip);
      }

      // Güncellenmiş listeyi kaydet
      await AsyncStorage.setItem('savedTrips', JSON.stringify(existingTrips));
      
      // Event'i tetikle
      tripEventEmitter.emit('tripUpdated');

      Alert.alert(
        "Başarılı",
        isEditMode ? "Seyahat planınız başarıyla güncellendi." : "Seyahat planınız başarıyla kaydedildi.",
        [
          { 
            text: "Tamam", 
            onPress: () => router.replace('/')
          }
        ]
      );
    } catch (error) {
      console.error('Seyahat kaydetme hatası:', error);
      Alert.alert(
        "Hata",
        `Seyahat planı ${isEditMode ? 'güncellenirken' : 'kaydedilirken'} bir hata oluştu: ${error.message}`,
        [{ text: "Tamam" }]
      );
    }
  };

  const renderSavedTrips = () => {
    return savedTrips.map(trip => (
      <View 
        key={trip.id}
        style={[styles.savedTripCard, { 
          backgroundColor: tema.cardBackground,
          borderColor: tema.border 
        }]}
      >
        <View style={styles.savedTripImageContainer}>
          <View style={[styles.savedTripImagePlaceholder, { backgroundColor: tema.primary + '20' }]}>
            <Ionicons name="airplane" size={48} color={tema.primary} />
          </View>
          <View style={[styles.savedTripOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <Text style={styles.savedTripLocation}>{trip.location}</Text>
          </View>
        </View>
        <View style={styles.savedTripDetails}>
          <View style={styles.savedTripDateContainer}>
            <Ionicons name="calendar-outline" size={16} color={tema.textSecondary} />
            <Text style={[styles.savedTripDate, { color: tema.textSecondary }]}>
              {tarihGoster(trip.startDate)} - {tarihGoster(trip.endDate)}
            </Text>
          </View>
          <View style={styles.savedTripCostContainer}>
            <Ionicons name="wallet-outline" size={16} color={tema.primary} />
            <Text style={[styles.savedTripCost, { color: tema.primary }]}>
              ₺{trip.totalCost.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      <ScrollView style={[styles.content, { backgroundColor: tema.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[styles.backButton, { backgroundColor: tema.cardBackground }]}
          >
            <Ionicons name="arrow-back" size={24} color={tema.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tema.text }]}>
            {isEditMode ? t('seyahatDuzenle') : t('seyahat_planla')}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={[styles.locationContainer, { 
          backgroundColor: tema.cardBackground,
          borderColor: tema.border,
          borderWidth: 1
        }]}>
          <View style={styles.locationHeader}>
            <Ionicons name="location" size={24} color={tema.primary} />
            <Text style={[styles.locationTitle, { color: tema.text }]}>
              {t('searchDestination')}
            </Text>
          </View>
          <View style={[styles.searchInputContainer, { 
            backgroundColor: tema.background,
            borderColor: tema.border
          }]}>
            <Ionicons name="search" size={20} color={tema.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: tema.text }]}
              placeholder={t('ornekSeyahatAdi')}
              placeholderTextColor={tema.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
            {location.length > 0 && (
              <TouchableOpacity onPress={() => setLocation('')}>
                <Ionicons name="close-circle" size={20} color={tema.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.dateSection}>
          <View style={styles.dateContainer}>
            <Text style={[styles.dateLabel, { color: tema.textSecondary }]}>
              {t('baslangicTarihi')}:
            </Text>
            <TouchableOpacity 
              style={[
                styles.dateButton,
                { 
                  backgroundColor: tema.cardBackground,
                  borderColor: tema.border
                }
              ]}
              onPress={() => tarihSeciminiGoster('baslangic')}
            >
              <Text style={[styles.dateButtonText, { color: tema.text }]}>
                {tarihGoster(baslangicTarihi)}
              </Text>
              <Ionicons name="calendar" size={18} color={tema.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={[styles.dateLabel, { color: tema.textSecondary }]}>
              {t('bitisTarihi')}:
            </Text>
            <TouchableOpacity 
              style={[
                styles.dateButton,
                { 
                  backgroundColor: tema.cardBackground,
                  borderColor: tema.border
                }
              ]}
              onPress={() => tarihSeciminiGoster('bitis')}
            >
              <Text style={[styles.dateButtonText, { color: tema.text }]}>
                {tarihGoster(bitisTarihi)}
              </Text>
              <Ionicons name="calendar" size={18} color={tema.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.totalCostCard, { 
          backgroundColor: tema.cardBackground,
          borderColor: tema.border,
          borderWidth: 1
        }]}>
          <View style={styles.totalCostHeader}>
            <Ionicons name="calculator-outline" size={24} color={tema.primary} />
            <Text style={[styles.totalCostTitle, { color: tema.text }]}>
              {t('toplam_maliyet')}
            </Text>
          </View>
          <Text style={[styles.totalCostAmount, { color: tema.text }]}>
            ₺{totalExpense.toFixed(2)}
          </Text>
          <Text style={[styles.totalCostSubtitle, { color: tema.textSecondary }]}>
            {tarihGoster(baslangicTarihi)} - {tarihGoster(bitisTarihi)}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: tema.text }]}>
            {t('harcama_kategorileri')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: tema.textSecondary }]}>
            {t('kategori_secim_aciklama')}
          </Text>
        </View>

        <View style={[styles.categoriesContainer, { backgroundColor: tema.background }]}>
          {renderCategoryGrid()}
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: tema.success }]}
          onPress={saveTrip}
        >
          <Ionicons name="save-outline" size={20} color="#FFFFFF" />
          <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
            {isEditMode ? t('seyahat_planini_guncelle') : t('seyahat_planini_kaydet')}
          </Text>
        </TouchableOpacity>

        {savedTrips.length > 0 && (
          <View style={styles.savedTripsContainer}>
            <View style={styles.savedTripsHeader}>
              <Ionicons name="bookmark" size={24} color={tema.primary} />
              <Text style={[styles.savedTripsTitle, { color: tema.text }]}>
                {t('kaydedilen_seyahatler')}
              </Text>
            </View>
            {renderSavedTrips()}
          </View>
        )}
      </ScrollView>

      {showAndroidDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={aktifTarihSecimi === 'baslangic' ? baslangicTarihi : bitisTarihi}
          mode="date"
          display="calendar"
          onChange={tarihSecildiAndroid}
          positiveButton={{label: t('tamam'), textColor: tema.primary}}
          negativeButton={{label: t('iptal'), textColor: tema.error}}
          accentColor={tema.primary}
          locale={language}
          style={{ backgroundColor: tema.cardBackground }}
        />
      )}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={Platform.OS === 'ios' && tarihPickerVisible}
        onRequestClose={() => setTarihPickerVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.datePickerContainer, { 
            backgroundColor: tema.cardBackground,
            borderColor: tema.border,
            borderWidth: 1
          }]}>
            <View style={[styles.datePickerHeader, { borderBottomColor: tema.border }]}>
              <Text style={[styles.datePickerTitle, { color: tema.text }]}>
                {aktifTarihSecimi === 'baslangic' ? t('baslangic_tarihi_sec') : t('bitis_tarihi_sec')}
              </Text>
              <TouchableOpacity
                onPress={() => setTarihPickerVisible(false)}
                style={styles.datePickerCloseButton}
              >
                <Ionicons name="close" size={24} color={tema.text} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.datePickerWrapper, { backgroundColor: tema.cardBackground }]}>
              <DateTimePicker
                value={aktifTarihSecimi === 'baslangic' ? baslangicTarihi : bitisTarihi}
                mode="date"
                display="spinner"
                onChange={tarihSecildiIOS}
                textColor={tema.text}
                accentColor={tema.primary}
                locale={language}
                style={[styles.datePicker, { backgroundColor: tema.cardBackground }]}
              />
            </View>
            
            <View style={[styles.datePickerActions, { 
              borderTopColor: tema.border,
              backgroundColor: tema.cardBackground
            }]}>
              <TouchableOpacity
                onPress={() => setTarihPickerVisible(false)}
                style={[styles.datePickerButton, styles.cancelButton]}
              >
                <Text style={[styles.datePickerButtonText, { color: tema.error }]}>
                  {t('iptal')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setTarihPickerVisible(false)}
                style={[styles.datePickerButton, styles.confirmButton]}
              >
                <Text style={[styles.datePickerButtonText, { color: tema.primary }]}>
                  {t('tamam')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Harcama Giriş Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={expenseModalVisible}
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.expenseModalContainer, { 
            backgroundColor: tema.cardBackground,
            borderColor: tema.border,
            borderWidth: 1
          }]}>
            <View style={[styles.expenseModalHeader, { borderBottomColor: tema.border }]}>
              <View style={styles.expenseModalTitleContainer}>
                <View style={[styles.categoryIcon, { backgroundColor: selectedCategory?.color + '20' }]}>
                  <Ionicons name={selectedCategory?.icon} size={24} color={selectedCategory?.color} />
                </View>
                <Text style={[styles.expenseModalTitle, { color: tema.text }]}>
                  {selectedCategory?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setExpenseModalVisible(false)}
                style={styles.expenseModalCloseButton}
              >
                <Ionicons name="close" size={24} color={tema.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.expenseModalContent}>
              {selectedCategory?.fields.map((field) => (
                <View key={field} style={styles.expenseField}>
                  <Text style={[styles.expenseFieldLabel, { color: tema.text }]}>
                    {getFieldTitle(field)}
                  </Text>
                  <View style={[styles.expenseInputContainer, { 
                    backgroundColor: tema.background,
                    borderColor: tema.border
                  }]}>
                    <TextInput
                      style={[styles.expenseInput, { color: tema.text }]}
                      placeholder="0"
                      placeholderTextColor={tema.textSecondary}
                      keyboardType="numeric"
                      value={expenses[selectedCategory.id]?.[field] || ''}
                      onChangeText={(value) => updateExpense(selectedCategory.id, field, value)}
                    />
                    <Text style={[styles.currencySymbol, { color: tema.text }]}>₺</Text>
                  </View>
                </View>
              ))}

              <View style={[styles.categoryTotalContainer, { borderTopColor: tema.border }]}>
                <Text style={[styles.categoryTotalLabel, { color: tema.text }]}>
                  {t('kategori_toplami')}
                </Text>
                <Text style={[styles.categoryTotalValue, { color: tema.primary }]}>
                  ₺{Object.values(expenses[selectedCategory?.id] || {})
                      .reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
                      .toFixed(2)}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.expenseModalSaveButton, { backgroundColor: tema.primary }]}
              onPress={() => setExpenseModalVisible(false)}
            >
              <Text style={[styles.expenseModalSaveButtonText, { color: '#FFFFFF' }]}>
                {t('tamam')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
  totalCostCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  totalCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalCostTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  totalCostAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  totalCostSubtitle: {
    fontSize: 14,
    opacity: 0.9,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  categoryItem: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  expenseFieldsContainer: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expenseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  expenseField: {
    marginBottom: 16,
  },
  expenseFieldLabel: {
    fontSize: 15,
    marginBottom: 6,
    fontWeight: '500',
  },
  expenseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  expenseInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  currencySymbol: {
    fontSize: 16,
    paddingRight: 12,
    fontWeight: '500',
  },
  categoryTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  categoryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  datePickerCloseButton: {
    padding: 8,
  },
  datePickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  datePicker: {
    height: 220,
    width: '100%',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  datePickerButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  confirmButton: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
  },
  locationContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    marginRight: 8,
    padding: 8,
  },
  savedTripsContainer: {
    marginTop: 32,
    marginBottom: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  savedTripsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  savedTripsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  savedTripCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  savedTripImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  savedTripImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedTripOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  savedTripLocation: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  savedTripDetails: {
    padding: 16,
  },
  savedTripDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedTripDate: {
    marginLeft: 8,
    fontSize: 14,
  },
  savedTripCostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedTripCost: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  expenseModalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  expenseModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  expenseModalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expenseModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  expenseModalCloseButton: {
    padding: 8,
  },
  expenseModalContent: {
    padding: 16,
  },
  expenseModalSaveButton: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  expenseModalSaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 