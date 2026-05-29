import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { transfer } from '@/lib/actions';
import { getUsers } from '@/lib/store';

function fmt(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default async function TransferPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSession();
  if (!user) redirect('/');
  if (user.role === 'admin') redirect('/admin');

  const { error } = await searchParams;
  const recipients = getUsers().filter((u) => u.id !== user.id && u.role === 'user');

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transfer Funds</h1>
        <p className="text-gray-500 text-sm mt-1">Send money to another account holder</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-gray-900">{fmt(user.balance)}</p>
        </div>

        <form action={transfer} className="space-y-4">
          <div>
            <label htmlFor="toUserId" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient
            </label>
            <select
              id="toUserId"
              name="toUserId"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">Select a recipient…</option>
              {recipients.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">$</span>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Note <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="note"
              name="note"
              type="text"
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Rent, split bill"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
          >
            Send Transfer
          </button>
        </form>
      </div>
    </div>
  );
}
