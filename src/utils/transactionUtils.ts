interface MonthlyBalance {
  month: string; // "2024-03" formatında
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

export const calculateMonthlyBalances = (transactions: Transaction[]): Record<string, MonthlyBalance> => {
  // Her ay için ayrı hesaplama
  const monthlyBalances = transactions.reduce((acc, transaction) => {
    const monthKey = getMonthKey(new Date(transaction.date));
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        income: 0,
        expense: 0,
        balance: 0,
        transactions: []
      };
    }
    
    if (transaction.type === 'income') {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].expense += transaction.amount;
    }
    
    acc[monthKey].balance = acc[monthKey].income - acc[monthKey].expense;
    acc[monthKey].transactions.push(transaction);
    
    return acc;
  }, {} as Record<string, MonthlyBalance>);

  return monthlyBalances;
};

// Yeni ay kontrolü
export const checkAndInitializeNewMonth = (currentBalances: Record<string, MonthlyBalance>) => {
  const currentMonthKey = getMonthKey(new Date());
  
  if (!currentBalances[currentMonthKey]) {
    currentBalances[currentMonthKey] = {
      month: currentMonthKey,
      income: 0,
      expense: 0,
      balance: 0,
      transactions: []
    };
  }
  
  return currentBalances;
}; 