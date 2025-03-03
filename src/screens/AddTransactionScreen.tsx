import React, { useState } from 'react';
import { View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import { getMonthKey } from '../utils/dateUtils';

const AddTransactionScreen = () => {
  const [date, setDate] = useState(new Date());
  
  const handleSubmit = () => {
    const newTransaction = {
      // ... diğer alanlar
      date: date,
      month: getMonthKey(date)
    };
    // İşlemi kaydet
  };

  return (
    <View style={styles.container}>
      {/* Tarih seçici */}
      <DatePicker
        value={date}
        onChange={setDate}
      />
      {/* Diğer form alanları */}
    </View>
  );
};

export default AddTransactionScreen; 