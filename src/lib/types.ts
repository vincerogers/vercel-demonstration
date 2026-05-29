export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  balance: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  fromUserId: string;
  toUserId?: string;
  amount: number;
  timestamp: string;
  note: string;
}
