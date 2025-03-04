import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  Switch,
  Alert
} from 'react-native';
import { useAyarlar } from './context/AyarlarContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

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

        <View style={[styles.versionContainer, { marginTop: 20 }]}>
          <Text style={[styles.versionText, { color: tema.textSecondary }]}>
            {t('versiyon')} {Constants.expoConfig.version}
          </Text>
          <Text style={[styles.copyrightText, { color: tema.textSecondary }]}>
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
  },
  scrollContent: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 16,
    marginRight: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
  },
}); 