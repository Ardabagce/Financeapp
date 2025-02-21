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

export default function GiderEkle() {
  const [miktar, setMiktar] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kategori, setKategori] = useState('');
  const [yaklasan, setYaklasan] = useState(false);
  const router = useRouter();
  const { giderEkle, giderGuncelle, giderSil, giderler, yaklasanGiderEkle, GIDER_KATEGORILERI } = useFinans();
  const params = useLocalSearchParams();
  const { t, getParaBirimiSembol, tema } = useAyarlar();
  const paraBirimiSembol = getParaBirimiSembol();

  const kategoriler = [
    { id: GIDER_KATEGORILERI.MARKET, ad: t(GIDER_KATEGORILERI.MARKET) },
    { id: GIDER_KATEGORILERI.FATURA, ad: t(GIDER_KATEGORILERI.FATURA) },
    { id: GIDER_KATEGORILERI.KIRA, ad: t(GIDER_KATEGORILERI.KIRA) },
    { id: GIDER_KATEGORILERI.ULASIM, ad: t(GIDER_KATEGORILERI.ULASIM) },
    { id: GIDER_KATEGORILERI.SAGLIK, ad: t(GIDER_KATEGORILERI.SAGLIK) },
    { id: GIDER_KATEGORILERI.EGLENCE, ad: t(GIDER_KATEGORILERI.EGLENCE) },
    { id: GIDER_KATEGORILERI.DIGER, ad: t(GIDER_KATEGORILERI.DIGER) }
  ];

  useEffect(() => {
    if (!kategori) {
      setKategori(GIDER_KATEGORILERI.DIGER);
    }
    
    if (params.duzenle === 'true') {
      setMiktar(params.miktar || '');
      setAciklama(params.aciklama || '');
      setKategori(params.kategori || GIDER_KATEGORILERI.DIGER);
      setYaklasan(params.yaklasan === 'true');
    }
  }, [GIDER_KATEGORILERI]);

  const giderKaydet = async () => {
    const temizMiktar = miktar.replace(',', '.');
    
    if (!temizMiktar || isNaN(parseFloat(temizMiktar))) {
      Alert.alert(t('hata'), t('gecerliMiktarGirin'));
      return;
    }

    if (!aciklama) {
      Alert.alert(t('hata'), t('aciklamaGirin'));
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
        if (yaklasan) {
          await yaklasanGiderEkle({
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
      }
      router.back();
    } catch (error) {
      Alert.alert(t('hata'), t('birHataOlustu'));
    }
  };

  const gideriSil = () => {
    Alert.alert(
      t('gideriSil'),
      t('gideriSilOnay'),
      [
        { text: t('iptal'), style: 'cancel' },
        { 
          text: t('sil'), 
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
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView>
          <View style={[styles.header, { 
            backgroundColor: tema.cardBackground,
            borderBottomColor: tema.border 
          }]}>
            <Text style={[styles.title, { color: tema.text }]}>
              {params?.duzenle ? t('giderDuzenle') : t('yeniGider')}
            </Text>
            <Text style={[styles.subtitle, { color: tema.textSecondary }]}>
              {params?.duzenle ? t('giderBilgileriGuncelle') : t('yeniGiderKaydi')}
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
                onChangeText={setMiktar}
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
                placeholder={t('giderAciklamasi')}
                multiline={true}
                value={aciklama}
                onChangeText={setAciklama}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: tema.text }]}>
                {t('kategori')}
              </Text>
              <View style={styles.kategoriler}>
                {kategoriler.map((kategori) => (
                  <TouchableOpacity
                    key={kategori.id}
                    style={[
                      styles.kategoriButon,
                      { 
                        backgroundColor: tema.cardBackground,
                        borderColor: tema.border
                      },
                      kategori.id === kategori && { 
                        backgroundColor: tema.selectedBackground,
                        borderColor: tema.danger
                      }
                    ]}
                    onPress={() => setKategori(kategori.id)}
                  >
                    <Text style={[
                      styles.kategoriText,
                      { color: tema.text },
                      kategori.id === kategori && { color: tema.danger }
                    ]}>
                      {kategori.ad}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.switchContainer, { backgroundColor: tema.cardBackground }]}>
              <View style={styles.switchInfo}>
                <Text style={[styles.switchLabel, { color: tema.danger }]}>
                  {t('yaklasanGider')}
                </Text>
                <Text style={[styles.switchDescription, { color: tema.textSecondary }]}>
                  {t('yaklasanAciklama')}
                </Text>
              </View>
              <Switch
                value={yaklasan}
                onValueChange={setYaklasan}
                trackColor={{ false: tema.border, true: tema.danger }}
                thumbColor={yaklasan ? tema.danger : tema.cardBackground}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: tema.danger }]}
              onPress={giderKaydet}
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
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
    margin: 5,
  },
  kategoriText: {
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
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
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