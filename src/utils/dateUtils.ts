export const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export const getMonthlyTransactions = (transactions: Transaction[]) => {
  return transactions.reduce((acc, transaction) => {
    const monthKey = getMonthKey(new Date(transaction.date));
    if (!acc[monthKey]) {
      acc[monthKey] = {
        income: 0,
        expense: 0,
        transactions: []
      };
    }
    
    if (transaction.type === 'income') {
      acc[monthKey].income += transaction.amount;
    } else {
      acc[monthKey].expense += transaction.amount;
    }
    
    acc[monthKey].transactions.push(transaction);
    return acc;
  }, {} as Record<string, {
    income: number;
    expense: number;
    transactions: Transaction[];
  }>);
} 