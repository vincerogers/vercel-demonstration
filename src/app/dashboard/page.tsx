import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getTransactionsByUserId, getUserById } from '@/lib/store';
import type { Transaction } from '@/lib/types';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TxRow({ tx, userId }: { tx: Transaction; userId: string }) {
  const isDeposit = tx.type === 'deposit';
  const isWithdrawal = tx.type === 'withdrawal';
  const isIncoming = tx.type === 'transfer' && tx.toUserId === userId;
  const isOutgoing = tx.type === 'transfer' && tx.fromUserId === userId;

  let label = '';
  let signed = '';
  let color = '';
  let badge = '';

  if (isDeposit) {
    label = 'Deposit';
    signed = `+${fmt(tx.amount)}`;
    color = 'text-green-600';
    badge = 'bg-green-100 text-green-700';
  } else if (isWithdrawal) {
    label = 'Withdrawal';
    signed = `-${fmt(tx.amount)}`;
    color = 'text-red-600';
    badge = 'bg-red-100 text-red-700';
  } else if (isIncoming) {
    const sender = getUserById(tx.fromUserId);
    label = `From ${sender?.name ?? 'Unknown'}`;
    signed = `+${fmt(tx.amount)}`;
    color = 'text-green-600';
    badge = 'bg-indigo-100 text-indigo-700';
  } else if (isOutgoing) {
    const recipient = getUserById(tx.toUserId!);
    label = `To ${recipient?.name ?? 'Unknown'}`;
    signed = `-${fmt(tx.amount)}`;
    color = 'text-red-600';
    badge = 'bg-indigo-100 text-indigo-700';
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${badge}`}>
            {tx.type}
          </span>
          <span className="text-sm text-gray-700">{label}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-400">{tx.note}</td>
      <td className={`px-6 py-4 text-sm font-semibold text-right ${color}`}>{signed}</td>
      <td className="px-6 py-4 text-sm text-gray-400 text-right whitespace-nowrap">{fmtDate(tx.timestamp)}</td>
    </tr>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect('/');
  if (user.role === 'admin') redirect('/admin');

  const { success } = await searchParams;
  const transactions = getTransactionsByUserId(user.id).slice(0, 25);

  return (
    <div className="space-y-6">
      {success && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Balance + quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-sm text-gray-500 mb-1">Available Balance</p>
          <p className="text-5xl font-bold tracking-tight text-gray-900">{fmt(user.balance)}</p>
          <p className="text-xs text-gray-400 mt-2">{user.email}</p>
        </div>

        <div className="bg-indigo-600 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between">
          <div>
            <p className="text-indigo-200 text-sm mb-0.5">Account holder</p>
            <p className="text-xl font-bold">{user.name}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <Link href="/deposit"  className="text-center bg-white/20 hover:bg-white/30 rounded-lg py-2 text-xs font-semibold transition-colors">Deposit</Link>
            <Link href="/withdraw" className="text-center bg-white/20 hover:bg-white/30 rounded-lg py-2 text-xs font-semibold transition-colors">Withdraw</Link>
            <Link href="/transfer" className="text-center bg-white/20 hover:bg-white/30 rounded-lg py-2 text-xs font-semibold transition-colors">Transfer</Link>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          <span className="text-sm text-gray-400">{transactions.length} shown</span>
        </div>

        {transactions.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400 text-sm">
            No transactions yet. Start by making a deposit.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx) => (
                  <TxRow key={tx.id} tx={tx} userId={user.id} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
