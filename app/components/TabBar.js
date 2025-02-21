import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAyarlar } from '../context/AyarlarContext';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, tema } = useAyarlar();

  return (
    <View style={[styles.tabBar, {
      backgroundColor: tema.tabBar,
      borderTopColor: tema.tabBarBorder,
      borderTopWidth: 0
    }]}>
      {/* Ana Sayfa */}
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => router.push('/')}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name={pathname === '/' ? "home" : "home-outline"} 
            size={24} 
            color={pathname === '/' ? tema.primary : tema.tabBarInactive} 
          />
          <Text style={[
            styles.tabText,
            { color: pathname === '/' ? tema.primary : tema.tabBarInactive }
          ]}>
            {t('anaSayfa')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Gelir */}
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => router.push('/gelir')}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name={pathname === '/gelir' ? "arrow-up-circle" : "arrow-up-circle-outline"} 
            size={24} 
            color={pathname === '/gelir' ? tema.primary : tema.tabBarInactive} 
          />
          <Text style={[
            styles.tabText,
            { color: pathname === '/gelir' ? tema.primary : tema.tabBarInactive }
          ]}>
            {t('gelir')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Gider */}
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => router.push('/gider')}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name={pathname === '/gider' ? "arrow-down-circle" : "arrow-down-circle-outline"} 
            size={24} 
            color={pathname === '/gider' ? tema.primary : tema.tabBarInactive} 
          />
          <Text style={[
            styles.tabText,
            { color: pathname === '/gider' ? tema.primary : tema.tabBarInactive }
          ]}>
            {t('gider')}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Ayarlar */}
      <TouchableOpacity 
        style={styles.tabItem}
        onPress={() => router.push('/ayarlar')}
      >
        <View style={styles.tabContent}>
          <Ionicons 
            name={pathname === '/ayarlar' ? "settings" : "settings-outline"} 
            size={24} 
            color={pathname === '/ayarlar' ? tema.primary : tema.tabBarInactive} 
          />
          <Text style={[
            styles.tabText,
            { color: pathname === '/ayarlar' ? tema.primary : tema.tabBarInactive }
          ]}>
            {t('ayarlar')}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabContent: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 6,
  },
  tabText: {
    fontSize: 12,
    marginTop: 2,
  }
}); 