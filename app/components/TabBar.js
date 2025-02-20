import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.newTabBar}>
      <TouchableOpacity 
        style={[styles.tabItem, pathname === '/' && styles.activeTab]}
        onPress={() => router.push('/')}
      >
        <Ionicons 
          name={pathname === '/' ? "home" : "home-outline"} 
          size={24} 
          color={pathname === '/' ? "#7B61FF" : "#666"} 
        />
        <Text style={[styles.tabText, pathname === '/' && styles.activeTabText]}>
          Ana Sayfa
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tabItem, pathname === '/gelir' && styles.activeTab]}
        onPress={() => router.push('/gelir')}
      >
        <Ionicons 
          name={pathname === '/gelir' ? "arrow-up-circle" : "arrow-up-circle-outline"} 
          size={24} 
          color={pathname === '/gelir' ? "#4CAF50" : "#666"} 
        />
        <Text style={[styles.tabText, pathname === '/gelir' && styles.activeTabText]}>
          Gelir
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.tabItem, pathname === '/gider' && styles.activeTab]}
        onPress={() => router.push('/gider')}
      >
        <Ionicons 
          name={pathname === '/gider' ? "arrow-down-circle" : "arrow-down-circle-outline"} 
          size={24} 
          color={pathname === '/gider' ? "#f44336" : "#666"} 
        />
        <Text style={[styles.tabText, pathname === '/gider' && styles.activeTabText]}>
          Gider
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  newTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  activeTab: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 25,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    fontWeight: '500',
  },
}); 