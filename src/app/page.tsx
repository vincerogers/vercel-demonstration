import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { login } from '@/lib/actions';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSession();
  if (user) redirect(user.role === 'admin' ? '/admin' : '/dashboard');

  const { error } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center -mt-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">FinanceApp</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your account</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Demo Credentials
            </p>
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-gray-600">
                <span>alice@example.com</span><span className="text-gray-400">password123</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>bob@example.com</span><span className="text-gray-400">password123</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>carol@example.com</span><span className="text-gray-400">password123</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>dave@example.com</span><span className="text-gray-400">password123</span>
              </div>
              <div className="flex justify-between text-indigo-600 font-semibold pt-1 border-t border-gray-200">
                <span>admin@example.com</span><span>admin123</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Demonstration application — data resets on server restart
        </p>
      </div>
    </div>
  );
}
