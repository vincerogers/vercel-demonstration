import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { logout } from '@/lib/actions';

export default async function NavBar() {
  const user = await getSession();
  if (!user) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + nav links */}
          <div className="flex items-center gap-8">
            <Link
              href={user.role === 'admin' ? '/admin' : '/dashboard'}
              className="text-xl font-bold text-indigo-600 tracking-tight"
            >
              FinanceApp
            </Link>

            {user.role === 'user' && (
              <div className="hidden sm:flex items-center gap-6">
                <Link href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/deposit" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                  Deposit
                </Link>
                <Link href="/withdraw" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                  Withdraw
                </Link>
                <Link href="/transfer" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                  Transfer
                </Link>
              </div>
            )}

            {user.role === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* User info + logout */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user.name}</p>
              {user.role === 'admin' && (
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Admin</p>
              )}
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
