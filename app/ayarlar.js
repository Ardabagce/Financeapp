import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Switch
} from 'react-native';
import { useAyarlar } from './context/AyarlarContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function Ayarlar() {
  const { 
    dil, 
    paraBirimi, 
    karanlikMod,
    dilSecenekleri, 
    paraBirimiSecenekleri,
    dilDegistir,
    paraBirimiDegistir,
    karanlikModDegistir,
    tema,
    t
  } = useAyarlar();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: tema.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tema.text }]}>
            {t('dilSecenekleri')}
          </Text>
          {dilSecenekleri.map((secenek) => (
            <TouchableOpacity
              key={secenek.id}
              style={[
                styles.option,
                { backgroundColor: tema.cardBackground },
                dil === secenek.id && { backgroundColor: tema.selectedBackground }
              ]}
              onPress={() => dilDegistir(secenek.id)}
            >
              <Text style={[styles.optionText, { color: tema.text }]}>
                {secenek.ad}
              </Text>
              {dil === secenek.id && (
                <Ionicons name="checkmark" size={24} color={tema.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: tema.text }]}>
            {t('paraBirimi')}
          </Text>
          {paraBirimiSecenekleri.map((secenek) => (
            <TouchableOpacity
              key={secenek.id}
              style={[
                styles.option,
                { backgroundColor: tema.cardBackground },
                paraBirimi === secenek.id && { backgroundColor: tema.selectedBackground }
              ]}
              onPress={() => paraBirimiDegistir(secenek.id)}
            >
              <View style={styles.currencyOption}>
                <Text style={[styles.currencySymbol, { color: tema.textSecondary }]}>
                  {secenek.sembol}
                </Text>
                <Text style={[styles.optionText, { color: tema.text }]}>
                  {t(secenek.ad)}
                </Text>
              </View>
              {paraBirimi === secenek.id && (
                <Ionicons name="checkmark" size={24} color={tema.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={[
          styles.option, 
          { 
            backgroundColor: tema.cardBackground,
            marginHorizontal: 16,
            marginBottom: 16
          }
        ]}>
          <Text style={[styles.optionText, { color: tema.text }]}>
            {t('karanlikMod')}
          </Text>
          <Switch
            value={karanlikMod}
            onValueChange={karanlikModDegistir}
            trackColor={{ 
              false: tema.border, 
              true: karanlikMod ? '#7B61FF80' : '#4CAF5080'
            }}
            thumbColor={karanlikMod ? tema.primary : '#f4f3f4'}
            ios_backgroundColor={tema.border}
          />
        </View>

        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: tema.textSecondary }]}>
            {t('versiyon')} {Constants.expoConfig.version}
          </Text>
          <Text style={[styles.copyrightText, { color: tema.textTertiary }]}>
            {t('copyright')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedOption: {
    backgroundColor: '#e8f5e9',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    color: '#666',
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1, // ScrollView'in tüm alanı kaplamasını sağlar
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 80, // Tab bar + 40px ekstra boşluk
    marginTop: 'auto', // En alta itecek
  },
  versionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  darkModeOption: {
    backgroundColor: '#fff',
    marginBottom: 0,
  },
}); 