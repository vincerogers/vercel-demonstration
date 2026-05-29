'use server';

import { redirect, unstable_rethrow } from 'next/navigation';
import { getUserByEmail, getUserById, updateUserBalance, addTransaction } from './store';
import { getSession, setSession, clearSession } from './auth';

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function login(formData: FormData) {
  const email = (formData.get('email') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';

  const user = getUserByEmail(email);
  if (!user || user.password !== password) {
    redirect(`/?error=${encodeURIComponent('Invalid email or password')}`);
  }

  await setSession(user.id);
  redirect(user.role === 'admin' ? '/admin' : '/dashboard');
}

export async function logout() {
  await clearSession();
  redirect('/');
}

// ── Transactions ───────────────────────────────────────────────────────────────

export async function deposit(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/');

  const amount = parseFloat((formData.get('amount') as string) ?? '');
  const note = ((formData.get('note') as string) ?? '').trim() || 'Deposit';

  let error: string | null = null;

  try {
    if (isNaN(amount) || amount <= 0) {
      error = 'Please enter a valid amount greater than zero.';
    } else if (amount > 1_000_000) {
      error = 'Amount exceeds the single-transaction limit of $1,000,000.';
    } else {
      updateUserBalance(session.id, session.balance + amount);
      addTransaction({ type: 'deposit', fromUserId: session.id, amount, note });
    }
  } catch (e) {
    unstable_rethrow(e);
    error = 'An unexpected error occurred. Please try again.';
  }

  if (error) redirect(`/deposit?error=${encodeURIComponent(error)}`);
  redirect('/dashboard?success=' + encodeURIComponent('Deposit successful'));
}

export async function withdrawal(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/');

  const amount = parseFloat((formData.get('amount') as string) ?? '');
  const note = ((formData.get('note') as string) ?? '').trim() || 'Withdrawal';

  let error: string | null = null;

  try {
    if (isNaN(amount) || amount <= 0) {
      error = 'Please enter a valid amount greater than zero.';
    } else if (amount > session.balance) {
      error = 'Insufficient funds.';
    } else {
      updateUserBalance(session.id, session.balance - amount);
      addTransaction({ type: 'withdrawal', fromUserId: session.id, amount, note });
    }
  } catch (e) {
    unstable_rethrow(e);
    error = 'An unexpected error occurred. Please try again.';
  }

  if (error) redirect(`/withdraw?error=${encodeURIComponent(error)}`);
  redirect('/dashboard?success=' + encodeURIComponent('Withdrawal successful'));
}

export async function transfer(formData: FormData) {
  const session = await getSession();
  if (!session) redirect('/');

  const toUserId = (formData.get('toUserId') as string) ?? '';
  const amount = parseFloat((formData.get('amount') as string) ?? '');
  const note = ((formData.get('note') as string) ?? '').trim() || 'Transfer';

  let error: string | null = null;

  try {
    const recipient = getUserById(toUserId);
    if (!recipient || recipient.role === 'admin') {
      error = 'Recipient not found.';
    } else if (toUserId === session.id) {
      error = 'You cannot transfer funds to yourself.';
    } else if (isNaN(amount) || amount <= 0) {
      error = 'Please enter a valid amount greater than zero.';
    } else if (amount > session.balance) {
      error = 'Insufficient funds.';
    } else {
      updateUserBalance(session.id, session.balance - amount);
      updateUserBalance(toUserId, recipient.balance + amount);
      addTransaction({ type: 'transfer', fromUserId: session.id, toUserId, amount, note });
    }
  } catch (e) {
    unstable_rethrow(e);
    error = 'An unexpected error occurred. Please try again.';
  }

  if (error) redirect(`/transfer?error=${encodeURIComponent(error)}`);
  redirect('/dashboard?success=' + encodeURIComponent('Transfer successful'));
}
