interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  category: string;
  date: Date;
  month: string; // Format: "2024-03" şeklinde
} 