import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { getMonthKey, calculateMonthlyBalances, checkAndInitializeNewMonth } from '../utils/transactionUtils';
import { loadTransactions } from '../services/transactionService';
import { formatMonthYear } from '../utils/dateUtils';
import MonthSelector from '../components/MonthSelector';
import MonthSummary from '../components/MonthSummary';
import TransactionList from '../components/TransactionList';

const HomeScreen = () => {
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const [monthlyBalances, setMonthlyBalances] = useState<Record<string, MonthlyBalance>>({});

  useEffect(() => {
    // Mevcut ayın verilerini yükle ve yeni ay kontrolü yap
    const loadMonthlyData = async () => {
      const transactions = await loadTransactions(); // Verileri storage'dan yükle
      let balances = calculateMonthlyBalances(transactions);
      balances = checkAndInitializeNewMonth(balances);
      setMonthlyBalances(balances);
    };

    loadMonthlyData();
  }, []);

  const currentMonthData = monthlyBalances[selectedMonth] || {
    income: 0,
    expense: 0,
    balance: 0,
    transactions: []
  };

  return (
    <View style={styles.container}>
      {/* Ay Seçici */}
      <MonthSelector
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={Object.keys(monthlyBalances)}
      />

      {/* Aylık Özet */}
      <MonthSummary data={currentMonthData} />

      {/* İşlem Listesi */}
      <TransactionList 
        transactions={currentMonthData.transactions}
        month={selectedMonth}
      />
    </View>
  );
};

// Ay seçici komponenti
const MonthSelector = ({ selectedMonth, onMonthChange, availableMonths }) => {
  return (
    <View style={styles.monthSelector}>
      <TouchableOpacity 
        onPress={() => {
          const currentIndex = availableMonths.indexOf(selectedMonth);
          if (currentIndex > 0) {
            onMonthChange(availableMonths[currentIndex - 1]);
          }
        }}
      >
        <Text>←</Text>
      </TouchableOpacity>
      
      <Text>{formatMonthYear(selectedMonth)}</Text>
      
      <TouchableOpacity 
        onPress={() => {
          const currentIndex = availableMonths.indexOf(selectedMonth);
          if (currentIndex < availableMonths.length - 1) {
            onMonthChange(availableMonths[currentIndex + 1]);
          }
        }}
      >
        <Text>→</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};

export default HomeScreen; 