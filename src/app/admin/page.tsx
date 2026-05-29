import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUsers, getTransactions, getUserById } from '@/lib/store';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect('/');
  if (user.role !== 'admin') redirect('/dashboard');

  const regularUsers = getUsers().filter((u) => u.role === 'user');
  const allTx = getTransactions();

  const totalBalance     = regularUsers.reduce((s, u) => s + u.balance, 0);
  const totalDeposits    = allTx.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = allTx.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
  const totalTransfers   = allTx.filter((t) => t.type === 'transfer').reduce((s, t) => s + t.amount, 0);

  const txBadge = (type: string) => {
    if (type === 'deposit')    return 'bg-green-100 text-green-700';
    if (type === 'withdrawal') return 'bg-red-100 text-red-700';
    return 'bg-indigo-100 text-indigo-700';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">System-wide overview and transaction reports</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Assets Under Mgmt</p>
          <p className="text-2xl font-bold text-gray-900">{fmt(totalBalance)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Deposited</p>
          <p className="text-2xl font-bold text-green-600">{fmt(totalDeposits)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Withdrawn</p>
          <p className="text-2xl font-bold text-red-600">{fmt(totalWithdrawals)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total Transferred</p>
          <p className="text-2xl font-bold text-indigo-600">{fmt(totalTransfers)}</p>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">All Accounts</h2>
          <span className="text-sm text-gray-400">{regularUsers.length} users</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Transactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {regularUsers.map((u) => {
                const txCount = allTx.filter((t) => t.fromUserId === u.id || t.toUserId === u.id).length;
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-right text-gray-900">{fmt(u.balance)}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">{txCount}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* All transactions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">All Transactions</h2>
          <span className="text-sm text-gray-400">{allTx.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">From</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">To</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allTx.map((tx) => {
                const from = getUserById(tx.fromUserId);
                const to   = tx.toUserId ? getUserById(tx.toUserId) : null;
                return (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${txBadge(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-700">{from?.name ?? '—'}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-700">{to?.name ?? '—'}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-400">{tx.note}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-right text-gray-900">{fmt(tx.amount)}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-400 text-right whitespace-nowrap">{fmtDate(tx.timestamp)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
