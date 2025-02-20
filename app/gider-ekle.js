import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFinans } from './context/FinansContext';

export default function GiderEkle() {
  const [miktar, setMiktar] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kategori, setKategori] = useState('Diğer');
  const router = useRouter();
  const { giderEkle, giderGuncelle, giderSil, giderler } = useFinans();
  const params = useLocalSearchParams();

  const kategoriler = ['Market', 'Fatura', 'Kira', 'Ulaşım', 'Sağlık', 'Eğlence', 'Diğer'];

  useEffect(() => {
    if (params.duzenle === 'true') {
      setMiktar(params.miktar || '');
      setAciklama(params.aciklama || '');
      setKategori(params.kategori || 'Diğer');
    }
  }, [params]);

  const giderKaydet = async () => {
    const temizMiktar = miktar.replace(',', '.');
    
    if (!temizMiktar || isNaN(parseFloat(temizMiktar))) {
      Alert.alert('Hata', 'Lütfen geçerli bir miktar girin');
      return;
    }

    if (!aciklama) {
      Alert.alert('Hata', 'Lütfen bir açıklama girin');
      return;
    }

    try {
      if (params.duzenle === 'true') {
        await giderGuncelle(Number(params.id), {
          miktar: parseFloat(temizMiktar),
          aciklama,
          kategori,
          tarih: new Date(),
        });
      } else {
        await giderEkle({
          miktar: parseFloat(temizMiktar),
          aciklama,
          kategori,
          tarih: new Date(),
        });
      }
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const gideriSil = () => {
    Alert.alert(
      'Gideri Sil',
      'Bu gideri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            await giderSil(Number(params.id));
            router.back();
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.baslik}>
            {params.duzenle ? 'Gider Düzenle' : 'Yeni Gider Ekle'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Miktar (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="Miktar"
              value={miktar}
              onChangeText={setMiktar}
              keyboardType="decimal-pad"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Açıklama</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Gider açıklaması..."
              multiline
              value={aciklama}
              onChangeText={setAciklama}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kategori</Text>
            <View style={styles.kategoriler}>
              {kategoriler.map((kat) => (
                <TouchableOpacity
                  key={kat}
                  style={[
                    styles.kategoriButon,
                    kategori === kat && styles.seciliKategori
                  ]}
                  onPress={() => setKategori(kat)}
                >
                  <Text style={[
                    styles.kategoriText,
                    kategori === kat && styles.seciliKategoriText
                  ]}>
                    {kat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.butonContainer}>
        {params.duzenle && (
          <TouchableOpacity 
            style={styles.silButon}
            onPress={gideriSil}
          >
            <Text style={styles.silButonText}>Sil</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.kaydetButon}
          onPress={giderKaydet}
        >
          <Text style={styles.kaydetButonText}>
            {params.duzenle ? 'Güncelle' : 'Kaydet'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  baslik: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#c62828',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  kategoriler: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  kategoriButon: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    margin: 5,
  },
  seciliKategori: {
    backgroundColor: '#f44336',
  },
  kategoriText: {
    color: '#666',
  },
  seciliKategoriText: {
    color: 'white',
  },
  butonContainer: {
    padding: 20,
    flexDirection: 'row',
  },
  kaydetButon: {
    flex: 1,
    backgroundColor: '#f44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  kaydetButonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  silButon: {
    backgroundColor: '#757575',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  silButonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 