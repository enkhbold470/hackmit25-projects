'use client';

import { useApp, Transaction } from '../../context/AppContext';
import { useState, useEffect, useCallback } from 'react';
import { Truck, CreditCard, TrendingUp, RefreshCw } from 'lucide-react';
import KnotapiJS from 'knotapi-js';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TransactionItem } from './shared/TransactionItem';
import { KnotAPIConfig } from './types';
import {
  getTransactionsFromStorage,
  saveTransactionsToStorage,        
  addTransactionToStorage,
  isCacheValid,
  getFallbackTransactions,
  mergeTransactions,
  calculateTotalSpent,
  Transaction as StorageTransaction
} from '@/lib/localStorage';

export default function TransactionsTab() {
  const { state, userId, refreshData } = useApp();
  const { transactions: contextTransactions } = state;
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [knotapi, setKnotapi] = useState<KnotapiJS | null>(null);   
  const [knotapiConfig, setKnotapiConfig] = useState<KnotAPIConfig | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  // Convert between context Transaction and storage Transaction types
  const convertToStorageTransaction = (t: Transaction): StorageTransaction => ({
    id: t.id,
    restaurant: t.restaurant,
    amount: t.amount,
    date: t.date instanceof Date ? t.date.toISOString() : t.date,
    status: 'completed',
    externalId: t.id
  });

  const convertFromStorageTransaction = (t: StorageTransaction): Transaction => ({
    id: t.id,
    restaurant: t.restaurant,
    amount: t.amount,
    date: new Date(t.date)
  });

  const totalAmount = calculateTotalSpent(transactions.map(convertToStorageTransaction));

  // Fetch transactions from API with localStorage fallback
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      // Check if we have valid cached data
      if (isCacheValid()) {
        const cachedTransactions = getTransactionsFromStorage();
        if (cachedTransactions.length > 0) {
          setTransactions(cachedTransactions.map(convertFromStorageTransaction));
          setLastFetchTime(new Date());
          setIsLoading(false);
          return;
        }
      }

      // Try to fetch from populate API first
      try {
        const populateResponse = await fetch(`/api/populate?count=15&userId=${userId}&daysBack=30`);
        if (populateResponse.ok) {
          const populateData = await populateResponse.json();
          if (populateData.success && populateData.transactions) {
            const apiTransactions = populateData.transactions;
            saveTransactionsToStorage(apiTransactions);
            setTransactions(apiTransactions.map(convertFromStorageTransaction));
            setLastFetchTime(new Date());
            setIsLoading(false);
            return;
          }
        }
      } catch (populateError) {
        console.warn('Populate API failed, trying transactions API:', populateError);
      }

      // Fallback to regular transactions API
      try {
        const transactionsResponse = await fetch(`/api/transactions?userId=${userId}&limit=20`);
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          if (transactionsData.transactions) {
            const apiTransactions = transactionsData.transactions.map((t: any) => ({
              id: t.id,
              restaurant: t.restaurant,
              amount: t.amount,
              date: t.date,
              status: t.status || 'completed',
              externalId: t.externalId || t.id
            }));
            
            // Merge with localStorage data
            const storageTransactions = getTransactionsFromStorage();
            const mergedTransactions = mergeTransactions(apiTransactions, storageTransactions);
            
            saveTransactionsToStorage(mergedTransactions);
            setTransactions(mergedTransactions.map(convertFromStorageTransaction));
            setLastFetchTime(new Date());
            setIsLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.warn('Transactions API failed:', apiError);
      }

      // Final fallback to localStorage or sample data
      const storageTransactions = getTransactionsFromStorage();
      if (storageTransactions.length > 0) {
        setTransactions(storageTransactions.map(convertFromStorageTransaction));
      } else {
        const fallbackTransactions = getFallbackTransactions();
        setTransactions(fallbackTransactions.map(convertFromStorageTransaction));
        saveTransactionsToStorage(fallbackTransactions);
      }
      setLastFetchTime(new Date());
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // Use fallback data
      const fallbackTransactions = getFallbackTransactions();
      setTransactions(fallbackTransactions.map(convertFromStorageTransaction));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
    }
  }, [userId, fetchTransactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('knotapi-js').then((KnotapiJS) => {
        const knotapiInstance = new KnotapiJS.default();
        setKnotapi(knotapiInstance);
      }).catch((error) => {
        console.error('Failed to load KnotAPI SDK:', error);
      });
    }
  }, []);

  const connectMerchant = async (merchantId: number, merchantName: string) => {
    if (!knotapi || !userId) return;

    setIsConnecting(merchantName);

    try {
      const sessionResponse = await fetch('/api/knot/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, userId })
      });

      if (!sessionResponse.ok) {
        const errorData = await sessionResponse.json();
        console.error('Session creation error:', errorData);
        throw new Error(`Failed to create session: ${errorData.error || 'Unknown error'}`);
      }

      const { sessionId } = await sessionResponse.json();

      const clientId = process.env.NEXT_PUBLIC_KNOT_CLIENT_ID || '';
      console.log('Frontend client ID:', clientId);

      if (!clientId) {
        throw new Error('NEXT_PUBLIC_KNOT_CLIENT_ID environment variable not set');
      }

      knotapi.open({
        sessionId,
        clientId,
        environment: 'development',
        product: 'transaction_link',
        merchantIds: [merchantId],
        entryPoint: 'transactions_tab',
        useCategories: false,
        useSearch: false,
        onSuccess: async (product: string, merchant: string) => {
          console.log('Authentication successful:', merchant);

          const syncResponse = await fetch('/api/knot/sync', {  
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId as string, product })   
          });

          if (syncResponse.ok) {
            await refreshData();
          }

          setIsConnecting(null);
        },
        onError: (_product: string, errorCode: string, message: string) => {
          console.error('KnotAPI Error:', errorCode, message);
          setIsConnecting(null);
        },
        onExit: () => {
          setIsConnecting(null);
        }
      });
    } catch (error) {
      console.error('Error connecting to merchant:', error);
      setIsConnecting(null);
    }
  };

  return (
    <div className="p-4 pb-20">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-500" />
                Transactions
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
              </CardTitle>
              <div className="text-muted-foreground text-sm mt-1 space-y-1">
                <p>Your food delivery orders during this quest</p>
                {lastFetchTime && (
                  <p className="text-xs">
                    Last updated: {lastFetchTime.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={fetchTransactions}
                disabled={isLoading || isConnecting !== null}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => connectMerchant(19, 'DoorDash')}
                disabled={isConnecting !== null || isLoading}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                {isConnecting === 'DoorDash' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'DoorDash'
                )}
              </Button>
              <Button
                onClick={() => connectMerchant(36, 'UberEats')}
                disabled={isConnecting !== null || isLoading}
                className="bg-black hover:bg-gray-800 text-white"
                size="sm"
              >
                {isConnecting === 'UberEats' ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'UberEats'
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {transactions.length > 0 && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <p className="text-sm text-muted-foreground">Total Spent This Quest</p>
              </div>
              <Badge variant="outline" className="text-2xl font-bold text-primary py-2 px-4">
                ${totalAmount.toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Transactions Yet!
              </h3>
              <p className="text-muted-foreground">
                You haven&apos;t ordered any food delivery during this quest. Keep it up!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}