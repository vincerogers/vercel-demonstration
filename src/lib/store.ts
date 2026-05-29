import type { User, Transaction } from './types';

function createInitialStore(): { users: User[]; transactions: Transaction[] } {
  const now = Date.now();

  const users: User[] = [
    { id: 'u1', name: 'Alice Johnson',  email: 'alice@example.com', password: 'password123', role: 'user',  balance: 5000 },
    { id: 'u2', name: 'Bob Smith',      email: 'bob@example.com',   password: 'password123', role: 'user',  balance: 2500 },
    { id: 'u3', name: 'Carol Davis',    email: 'carol@example.com', password: 'password123', role: 'user',  balance: 8200 },
    { id: 'u4', name: 'Dave Wilson',    email: 'dave@example.com',  password: 'password123', role: 'user',  balance: 1100 },
    { id: 'admin1', name: 'Admin',      email: 'admin@example.com', password: 'admin123',    role: 'admin', balance: 0    },
  ];

  const d = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString();

  const transactions: Transaction[] = [
    { id: 't1',  type: 'deposit',    fromUserId: 'u1',                     amount: 3000, timestamp: d(7), note: 'Initial deposit'  },
    { id: 't2',  type: 'deposit',    fromUserId: 'u1',                     amount: 2000, timestamp: d(5), note: 'Paycheck'          },
    { id: 't3',  type: 'deposit',    fromUserId: 'u2',                     amount: 2500, timestamp: d(6), note: 'Initial deposit'  },
    { id: 't4',  type: 'transfer',   fromUserId: 'u3', toUserId: 'u1',     amount: 500,  timestamp: d(4), note: 'Lunch split'       },
    { id: 't5',  type: 'withdrawal', fromUserId: 'u1',                     amount: 500,  timestamp: d(3), note: 'ATM withdrawal'    },
    { id: 't6',  type: 'deposit',    fromUserId: 'u3',                     amount: 8700, timestamp: d(8), note: 'Savings deposit'   },
    { id: 't7',  type: 'transfer',   fromUserId: 'u3', toUserId: 'u4',     amount: 300,  timestamp: d(2), note: 'Rent share'        },
    { id: 't8',  type: 'deposit',    fromUserId: 'u4',                     amount: 1400, timestamp: d(9), note: 'Initial deposit'  },
    { id: 't9',  type: 'withdrawal', fromUserId: 'u4',                     amount: 300,  timestamp: d(1), note: 'Groceries'         },
    { id: 't10', type: 'transfer',   fromUserId: 'u2', toUserId: 'u3',     amount: 200,  timestamp: d(1), note: 'Movie tickets'     },
    { id: 't11', type: 'transfer',   fromUserId: 'u1', toUserId: 'u2',     amount: 150,  timestamp: d(0), note: 'Coffee & snacks'   },
    { id: 't12', type: 'withdrawal', fromUserId: 'u3',                     amount: 400,  timestamp: d(0), note: 'Online shopping'   },
  ];

  return { users, transactions };
}

// Persist across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __financeStore: ReturnType<typeof createInitialStore> | undefined;
}

const store: ReturnType<typeof createInitialStore> =
  globalThis.__financeStore ?? (globalThis.__financeStore = createInitialStore());

// ── Queries ──────────────────────────────────────────────────────────────────

export function getUsers(): User[] {
  return store.users;
}

export function getUserById(id: string): User | undefined {
  return store.users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return store.users.find((u) => u.email === email.toLowerCase().trim());
}

export function getTransactions(): Transaction[] {
  return [...store.transactions].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getTransactionsByUserId(userId: string): Transaction[] {
  return store.transactions
    .filter((t) => t.fromUserId === userId || t.toUserId === userId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function addTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>): Transaction {
  const newTx: Transaction = {
    ...tx,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  store.transactions.push(newTx);
  return newTx;
}

export function updateUserBalance(userId: string, newBalance: number): void {
  const user = store.users.find((u) => u.id === userId);
  if (user) user.balance = newBalance;
}
