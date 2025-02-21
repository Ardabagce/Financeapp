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
  Alert,
  Switch,
  Keyboard,
  SafeAreaView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFinans } from './context/FinansContext';
import { useAyarlar } from './context/AyarlarContext';

export default function GelirEkle() {
  const [miktar, setMiktar] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kategori, setKategori] = useState('');
  const [yaklasan, setYaklasan] = useState(false);
  const router = useRouter();
  const { gelirEkle, gelirGuncelle, gelirSil, gelirler, yaklasanGelirEkle, GELIR_KATEGORILERI } = useFinans();
  const params = useLocalSearchParams();
  const { t, getParaBirimiSembol, tema } = useAyarlar();
  const paraBirimiSembol = getParaBirimiSembol();

  const kategoriler = [
    { id: GELIR_KATEGORILERI.MAAS, ad: t(GELIR_KATEGORILERI.MAAS) },
    { id: GELIR_KATEGORILERI.EK_GELIR, ad: t(GELIR_KATEGORILERI.EK_GELIR) },
    { id: GELIR_KATEGORILERI.YATIRIM, ad: t(GELIR_KATEGORILERI.YATIRIM) },
    { id: GELIR_KATEGORILERI.HEDIYE, ad: t(GELIR_KATEGORILERI.HEDIYE) },
    { id: GELIR_KATEGORILERI.DIGER, ad: t(GELIR_KATEGORILERI.DIGER) }
  ];

  useEffect(() => {
    if (!kategori) {
      setKategori(GELIR_KATEGORILERI.DIGER);
    }
    
    if (params.duzenle === 'true') {
      setMiktar(params.miktar || '');
      setAciklama(params.aciklama || '');
      setKategori(params.kategori || GELIR_KATEGORILERI.DIGER);
      setYaklasan(params.yaklasan === 'true');
    }
  }, [GELIR_KATEGORILERI]);

  const gelirKaydet = async () => {
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
        await gelirGuncelle(Number(params.id), {
          miktar: parseFloat(temizMiktar),
          aciklama,
          kategori,
          tarih: new Date(),
        });
      } else {
        if (yaklasan) {
          await yaklasanGelirEkle({
            miktar: parseFloat(temizMiktar),
            aciklama,
            kategori,
            tarih: new Date(),
          });
        } else {
          await gelirEkle({
            miktar: parseFloat(temizMiktar),
            aciklama,
            kategori,
            tarih: new Date(),
          });
        }
      }
      router.back();
    } catch (error) {
      Alert.alert('Hata', 'Bir hata oluştu');
    }
  };

  const geliriSil = () => {
    Alert.alert(
      'Geliri Sil',
      'Bu geliri silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: async () => {
            await gelirSil(Number(params.id));
            router.back();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView>
          <View style={[styles.header, { backgroundColor: tema.cardBackground }]}>
            <Text style={[styles.title, { color: tema.text }]}>
              {params?.duzenle ? t('gelirDuzenle') : t('yeniGelir')}
            </Text>
            <Text style={[styles.subtitle, { color: tema.textSecondary }]}>
              {params?.duzenle ? t('gelirBilgileriGuncelle') : t('yeniGelirKaydi')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: tema.text }]}>
                {t('miktar')} ({paraBirimiSembol})
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: tema.cardBackground,
                  color: tema.text,
                  borderColor: tema.border
                }]}
                placeholderTextColor={tema.textTertiary}
                placeholder={t('miktar')}
                keyboardType="decimal-pad"
                value={miktar}
                onChangeText={(text) => setMiktar(text)}
                returnKeyType="done"
                blurOnSubmit={true}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: tema.text }]}>
                {t('aciklama')}
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: tema.cardBackground,
                  color: tema.text,
                  borderColor: tema.border
                }]}
                placeholderTextColor={tema.textTertiary}
                placeholder={t('gelirAciklamasi')}
                multiline={true}
                value={aciklama}
                onChangeText={(text) => setAciklama(text)}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: tema.text }]}>
                {t('kategori')}
              </Text>
              <View style={styles.kategoriler}>
                {kategoriler.map((kat) => (
                  <TouchableOpacity
                    key={kat.id}
                    style={[
                      styles.kategoriButon,
                      { 
                        backgroundColor: tema.cardBackground,
                        borderColor: tema.border,
                        borderWidth: 1,
                      },
                      kategori === kat.id && { 
                        backgroundColor: tema.successLight,
                        borderColor: tema.success,
                        borderWidth: 2,
                      }
                    ]}
                    onPress={() => setKategori(kat.id)}
                  >
                    <Text style={[
                      styles.kategoriText,
                      { color: tema.text },
                      kategori === kat.id && { 
                        color: tema.success,
                        fontWeight: '600'
                      }
                    ]}>
                      {t(kat.id.toLowerCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.switchContainer, { backgroundColor: tema.cardBackground }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: tema.success }]}>
                  {t('yaklasanGelir')}
                </Text>
                <Text style={[styles.switchDescription, { color: tema.textSecondary }]}>
                  {t('yaklasanAciklama')}
                </Text>
              </View>
              <Switch
                value={yaklasan}
                onValueChange={setYaklasan}
                trackColor={{ false: tema.border, true: tema.success }}
                thumbColor={yaklasan ? tema.success : tema.cardBackground}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: tema.success }]}
              onPress={gelirKaydet}
            >
              <Text style={styles.submitButtonText}>
                {params?.duzenle ? t('guncelle') : t('kaydet')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Karanlık mod için siyah
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    padding: 20,
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
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
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
    borderWidth: 2,
    margin: 5,
  },
  kategoriText: {
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 10,
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  submitButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 