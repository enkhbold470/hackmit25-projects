// localStorage utility functions for transaction management

export interface Transaction {
  id: string;
  restaurant: string;
  amount: number;
  date: string;
  status: string;
  externalId?: string;
}

const TRANSACTIONS_KEY = 'game_transactions';
const LAST_FETCH_KEY = 'transactions_last_fetch';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Check if we're running in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Get transactions from localStorage
 */
export function getTransactionsFromStorage(): Transaction[] {
  if (!isBrowser()) return [];
  
  try {
    const stored = localStorage.getItem(TRANSACTIONS_KEY);
    if (!stored) return [];
    
    const transactions = JSON.parse(stored);
    return Array.isArray(transactions) ? transactions : [];
  } catch (error) {
    console.warn('Error reading transactions from localStorage:', error);
    return [];
  }
}

/**
 * Save transactions to localStorage
 */
export function saveTransactionsToStorage(transactions: Transaction[]): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    localStorage.setItem(LAST_FETCH_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Error saving transactions to localStorage:', error);
  }
}

/**
 * Add a single transaction to localStorage
 */
export function addTransactionToStorage(transaction: Transaction): void {
  if (!isBrowser()) return;
  
  const existing = getTransactionsFromStorage();
  const updated = [transaction, ...existing];
  
  // Keep only the most recent 100 transactions to avoid storage bloat
  const trimmed = updated.slice(0, 100);
  
  saveTransactionsToStorage(trimmed);
}

/**
 * Check if cached data is still valid
 */
export function isCacheValid(): boolean {
  if (!isBrowser()) return false;
  
  try {
    const lastFetch = localStorage.getItem(LAST_FETCH_KEY);
    if (!lastFetch) return false;
    
    const lastFetchTime = parseInt(lastFetch);
    const now = Date.now();
    
    return (now - lastFetchTime) < CACHE_DURATION;
  } catch (error) {
    console.warn('Error checking cache validity:', error);
    return false;
  }
}

/**
 * Clear all transaction data from localStorage
 */
export function clearTransactionStorage(): void {
  if (!isBrowser()) return;
  
  try {
    localStorage.removeItem(TRANSACTIONS_KEY);
    localStorage.removeItem(LAST_FETCH_KEY);
  } catch (error) {
    console.warn('Error clearing transaction storage:', error);
  }
}

/**
 * Get sample/fallback transactions for when API is unavailable
 */
export function getFallbackTransactions(): Transaction[] {
  const sampleTransactions: Transaction[] = [
    {
      id: 'fallback_1',
      restaurant: 'McDonald\'s',
      amount: 12.50,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      externalId: 'fallback_1'
    },
    {
      id: 'fallback_2',
      restaurant: 'Starbucks',
      amount: 6.75,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      externalId: 'fallback_2'
    },
    {
      id: 'fallback_3',
      restaurant: 'Chipotle',
      amount: 14.25,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      externalId: 'fallback_3'
    },
    {
      id: 'fallback_4',
      restaurant: 'Pizza Hut',
      amount: 18.99,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      externalId: 'fallback_4'
    },
    {
      id: 'fallback_5',
      restaurant: 'Subway',
      amount: 8.99,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      externalId: 'fallback_5'
    }
  ];
  
  return sampleTransactions;
}

/**
 * Merge API transactions with localStorage transactions, removing duplicates
 */
export function mergeTransactions(apiTransactions: Transaction[], storageTransactions: Transaction[]): Transaction[] {
  const merged = [...apiTransactions];
  const apiIds = new Set(apiTransactions.map(t => t.id));
  
  // Add storage transactions that aren't already in API results
  for (const transaction of storageTransactions) {
    if (!apiIds.has(transaction.id)) {
      merged.push(transaction);
    }
  }
  
  // Sort by date (newest first)
  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return merged;
}

/**
 * Calculate total amount spent from transactions
 */
export function calculateTotalSpent(transactions: Transaction[]): number {
  return transactions.reduce((total, transaction) => {
    return total + (transaction.amount || 0);
  }, 0);
}