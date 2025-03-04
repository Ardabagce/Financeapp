import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ScrollView, Image, FlatList, SafeAreaView, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useAyarlar } from './context/AyarlarContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SeyahatPlanla() {
  const router = useRouter();
  const { t, tema } = useAyarlar();
  const [searchQuery, setSearchQuery] = useState('');
  const [tarihPickerVisible, setTarihPickerVisible] = useState(false);
  const [aktifTarihSecimi, setAktifTarihSecimi] = useState('baslangic');
  const [baslangicTarihi, setBaslangicTarihi] = useState(new Date());
  const [bitisTarihi, setBitisTarihi] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 1 hafta sonrası
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expenses, setExpenses] = useState({});

  const tarihGoster = (tarih) => {
    return tarih.toLocaleDateString('tr-TR');
  };

  const tarihSecildi = (event, secilenTarih) => {
    setTarihPickerVisible(false);
    if (event.type === 'set') {
      if (aktifTarihSecimi === 'baslangic') {
        setBaslangicTarihi(secilenTarih);
      } else {
        setBitisTarihi(secilenTarih);
      }
    }
  };

  // Kategori data
  const categories = [
    { id: 'hotels', icon: 'bed', title: t('hotels'), color: '#FF5A5F', fields: ['konaklama', 'kahvalti', 'ekstra'] },
    { id: 'flights', icon: 'airplane', title: t('flights'), color: '#00BCD4', fields: ['ucusBedeli', 'havalimaniTransfer', 'bagajUcreti'] },
    { id: 'cars', icon: 'car', title: t('cars'), color: '#2196F3', fields: ['aracKiralama', 'yakitGideri', 'otopark'] },
    { id: 'foods', icon: 'restaurant', title: 'Yemek', color: '#FF7043', fields: ['gunlukYemek', 'ozelRestoranlar', 'atistirmaliklar'] },
    { id: 'activities', icon: 'bicycle', title: 'Aktiviteler', color: '#FFC107', fields: ['muze', 'eglenceMerkezi', 'sporAktiviteleri'] },
    { id: 'shopping', icon: 'cart', title: 'Alışveriş', color: '#4CAF50', fields: ['hediyelik', 'kisiselAlisveris', 'digerAlisveris'] },
    { id: 'transport', icon: 'bus', title: 'Ulaşım', color: '#00BCD4', fields: ['taksi', 'topluTasima', 'digerUlasim'] },
    { id: 'health', icon: 'medkit', title: 'Sağlık', color: '#795548', fields: ['sigorta', 'ilaclar', 'digerSaglik'] },
    { id: 'other', icon: 'apps', title: 'Diğer', color: '#9C27B0', fields: ['harclik', 'planlanmamisGiderler', 'digerHarcamalar'] },
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
      // Otel
      konaklama: 'Konaklama Bedeli',
      kahvalti: 'Kahvaltı/Yemek Ücreti',
      ekstra: 'Ekstra Hizmetler',
      
      // Uçuşlar
      ucusBedeli: 'Uçuş Bedeli',
      havalimaniTransfer: 'Havalimanı Transferi',
      bagajUcreti: 'Bagaj Ücreti',
      
      // Araba
      aracKiralama: 'Araç Kiralama',
      yakitGideri: 'Yakıt Gideri',
      otopark: 'Otopark Ücreti',
      
      // Yemek
      gunlukYemek: 'Günlük Yemek',
      ozelRestoranlar: 'Özel Restoranlar',
      atistirmaliklar: 'Atıştırmalıklar',
      
      // Aktiviteler
      muze: 'Müze/Tur Giriş',
      eglenceMerkezi: 'Eğlence Merkezi',
      sporAktiviteleri: 'Spor Aktiviteleri',
      
      // Alışveriş
      hediyelik: 'Hediyelik Eşya',
      kisiselAlisveris: 'Kişisel Alışveriş',
      digerAlisveris: 'Diğer Alışveriş',
      
      // Ulaşım
      taksi: 'Taksi',
      topluTasima: 'Toplu Taşıma',
      digerUlasim: 'Diğer Ulaşım',
      
      // Sağlık
      sigorta: 'Seyahat Sigortası',
      ilaclar: 'İlaçlar',
      digerSaglik: 'Diğer Sağlık',
      
      // Diğer
      harclik: 'Günlük Harçlık',
      planlanmamisGiderler: 'Planlanmamış Giderler',
      digerHarcamalar: 'Diğer Harcamalar',
    };
    
    return fieldTitles[field] || field;
  };

  const renderCategory = ({ item, index }) => {
    const isSelected = selectedCategory && selectedCategory.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          isSelected && { 
            backgroundColor: tema.karanlik 
              ? `rgba(${parseInt(item.color.slice(1,3), 16)}, ${parseInt(item.color.slice(3,5), 16)}, ${parseInt(item.color.slice(5,7), 16)}, 0.2)`
              : 'rgba(25, 118, 210, 0.1)'
          }
        ]}
        onPress={() => selectCategory(item)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={24} color="white" />
        </View>
        <Text style={[
          styles.categoryText,
          { color: tema.text },
          isSelected && { 
            fontWeight: 'bold', 
            color: tema.karanlik ? item.color : '#1976D2' 
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
  
  // Seçilen kategori için harcama alanları
  const renderExpenseFields = () => {
    if (!selectedCategory) return null;
    
    const categoryExpenses = expenses[selectedCategory.id] || {};
    
    return (
      <View style={[
        styles.expenseFieldsContainer,
        { 
          backgroundColor: tema.karanlik ? tema.cardBg : 'white',
          borderColor: tema.karanlik ? tema.border : 'transparent' 
        }
      ]}>
        <Text style={[
          styles.expenseTitle,
          { color: tema.text }
        ]}>{selectedCategory.title} Harcamaları</Text>
        
        {selectedCategory.fields.map((field) => (
          <View style={styles.expenseField} key={field}>
            <Text style={[
              styles.expenseFieldLabel,
              { color: tema.karanlik ? tema.textSecondary : '#555' }
            ]}>{getFieldTitle(field)}</Text>
            <View style={[
              styles.expenseInputContainer,
              { 
                borderColor: tema.karanlik ? tema.border : '#ddd',
                backgroundColor: tema.karanlik ? 'rgba(255, 255, 255, 0.05)' : '#f9f9f9'
              }
            ]}>
              <TextInput
                style={[
                  styles.expenseInput,
                  { color: tema.text }
                ]}
                value={categoryExpenses[field] || ''}
                onChangeText={(value) => updateExpense(selectedCategory.id, field, value)}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={tema.karanlik ? 'rgba(255, 255, 255, 0.3)' : '#aaa'}
              />
              <Text style={[
                styles.currencySymbol,
                { color: tema.karanlik ? tema.textSecondary : '#555' }
              ]}>₺</Text>
            </View>
          </View>
        ))}
        
        <View style={[
          styles.categoryTotalContainer,
          { borderTopColor: tema.karanlik ? tema.border : '#eee' }
        ]}>
          <Text style={[
            styles.categoryTotalLabel,
            { color: tema.text }
          ]}>Kategori Toplamı:</Text>
          <Text style={[
            styles.categoryTotalValue,
            { color: tema.karanlik ? selectedCategory.color : '#1976D2' }
          ]}>
            ₺{Object.values(categoryExpenses)
                .reduce((sum, value) => sum + (parseFloat(value) || 0), 0)
                .toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const saveTrip = () => {
    // Burada seyahat verileri kaydedilebilir
    // expenses, baslangicTarihi, bitisTarihi verileri kullanılabilir
    Alert.alert(
      "Seyahat Planı Kaydedildi",
      `Toplam bütçe: ₺${totalExpense.toFixed(2)}`,
      [{ text: "Tamam", onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={[
              styles.backButton,
              { backgroundColor: tema.karanlik ? 'rgba(255, 255, 255, 0.08)' : '#F0F8FF' }
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={tema.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tema.text }]}>Seyahat Planla</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tarih Seçimi */}
        <View style={styles.dateSection}>
          <View style={styles.dateContainer}>
            <Text style={[
              styles.dateLabel,
              { color: tema.karanlik ? tema.textSecondary : '#555' }
            ]}>Başlangıç Tarihi:</Text>
            <TouchableOpacity 
              style={[
                styles.dateButton,
                { 
                  backgroundColor: tema.karanlik ? tema.cardBg : 'white',
                  borderColor: tema.karanlik ? tema.border : '#ddd' 
                }
              ]}
              onPress={() => {
                setAktifTarihSecimi('baslangic');
                setTarihPickerVisible(true);
              }}
            >
              <Text style={[
                styles.dateButtonText,
                { color: tema.text }
              ]}>{tarihGoster(baslangicTarihi)}</Text>
              <Ionicons 
                name="calendar" 
                size={18} 
                color={tema.karanlik ? tema.textSecondary : '#666'} 
              />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dateContainer}>
            <Text style={[
              styles.dateLabel,
              { color: tema.karanlik ? tema.textSecondary : '#555' }
            ]}>Bitiş Tarihi:</Text>
            <TouchableOpacity 
              style={[
                styles.dateButton,
                { 
                  backgroundColor: tema.karanlik ? tema.cardBg : 'white',
                  borderColor: tema.karanlik ? tema.border : '#ddd' 
                }
              ]}
              onPress={() => {
                setAktifTarihSecimi('bitis');
                setTarihPickerVisible(true);
              }}
            >
              <Text style={[
                styles.dateButtonText,
                { color: tema.text }
              ]}>{tarihGoster(bitisTarihi)}</Text>
              <Ionicons 
                name="calendar" 
                size={18} 
                color={tema.karanlik ? tema.textSecondary : '#666'} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Toplam Maliyet Kartı */}
        <View style={[
          styles.totalCostCard,
          { 
            backgroundColor: tema.karanlik ? '#1565C0' : '#1976D2',
            shadowColor: tema.karanlik ? 'rgba(0, 0, 0, 0.5)' : '#000' 
          }
        ]}>
          <View style={styles.totalCostHeader}>
            <Ionicons name="calculator-outline" size={24} color="white" />
            <Text style={styles.totalCostTitle}>Toplam Maliyet</Text>
          </View>
          <Text style={styles.totalCostAmount}>₺{totalExpense.toFixed(2)}</Text>
          <Text style={styles.totalCostSubtitle}>
            {tarihGoster(baslangicTarihi)} - {tarihGoster(bitisTarihi)}
          </Text>
        </View>

        {/* Kategoriler Başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: tema.text }]}>Harcama Kategorileri</Text>
          <Text style={[
            styles.sectionSubtitle,
            { color: tema.karanlik ? tema.textSecondary : '#777' }
          ]}>Kategori seçerek harcamalarınızı girin</Text>
        </View>

        {/* Kategoriler - 3'lü grid olarak */}
        <View style={styles.categoriesContainer}>
          {renderCategoryGrid()}
        </View>

        {/* Seçilen Kategori için Harcama Alanları */}
        {renderExpenseFields()}

        {/* Kaydet Butonu */}
        <TouchableOpacity 
          style={[
            styles.saveButton,
            { backgroundColor: tema.karanlik ? '#357a38' : '#4CAF50' }
          ]}
          onPress={saveTrip}
        >
          <Ionicons name="save-outline" size={20} color="white" />
          <Text style={styles.saveButtonText}>Seyahat Planını Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>

      {tarihPickerVisible && (
        <DateTimePicker
          value={aktifTarihSecimi === 'baslangic' ? baslangicTarihi : bitisTarihi}
          mode="date"
          display="default"
          onChange={tarihSecildi}
        />
      )}
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
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: 14,
  },
  totalCostCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  totalCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalCostTitle: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  totalCostAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 8,
  },
  totalCostSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 12,
    textAlign: 'center',
  },
  expenseFieldsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
  },
  expenseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  expenseField: {
    marginBottom: 12,
  },
  expenseFieldLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  expenseInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  expenseInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  currencySymbol: {
    fontSize: 16,
    paddingRight: 10,
  },
  categoryTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  categoryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
}); 