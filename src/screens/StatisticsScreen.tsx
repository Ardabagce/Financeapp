import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getMonthlyTransactions } from '../utils/dateUtils';
import { formatMonthYear } from '../utils/dateUtils';
import { styles } from '../styles/styles';

const StatisticsScreen = () => {
  const monthlyData = getMonthlyTransactions(transactions);
  
  return (
    <View style={styles.container}>
      {/* Aylık Grafik */}
      <View style={styles.chart}>
        {Object.entries(monthlyData).map(([month, data]) => (
          <View key={month} style={styles.monthBar}>
            <Text>{formatMonthYear(month)}</Text>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { height: data.income / 100 }]} />
              <View style={[styles.bar, { height: data.expense / 100 }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Aylık Kategori Dağılımı */}
      <View style={styles.categories}>
        {/* Kategori bazlı dağılım gösterimi */}
      </View>
    </View>
  );
};

export default StatisticsScreen; 