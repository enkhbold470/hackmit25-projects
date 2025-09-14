'use client';

import { useApp, Transaction } from '../../context/AppContext';
import { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import KnotapiJS from 'knotapi-js';

interface KnotAPIConfig {
  sessionId: string;
  clientId: string;
  environment: 'development' | 'production' | 'sandbox';
  product: string;
  merchantIds: number[];
  entryPoint: string;
  useCategories: boolean;
  useSearch: boolean;
  onSuccess: (product: string, merchant: string) => void;
  onError: (product: string, errorCode: string, message: string) => void;
  onExit: () => void;
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">
            {transaction.restaurant}
          </h4>
          <p className="text-sm text-gray-500">
            {transaction.date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-foreground">
            ${transaction.amount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function TransactionsTab() {
  const { state, userId, refreshData } = useApp();
  const { transactions } = state;
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [knotapi, setKnotapi] = useState<KnotapiJS | null>(null);   
  const [knotapiConfig, setKnotapiConfig] = useState<KnotAPIConfig | null>(null);   

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

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
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Transactions</h2>
            <p className="text-gray-600 text-sm">
              Your food delivery orders during this quest
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => connectMerchant(19, 'DoorDash')}
              disabled={isConnecting !== null}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-gray-300 transition-colors shadow-sm"
              title="Connect DoorDash"
            >
              {isConnecting === 'DoorDash' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Truck className="w-6 h-6 text-white" />
              )}
            </button>
            <button
              onClick={() => connectMerchant(36, 'UberEats')}
              disabled={isConnecting !== null}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-black hover:bg-gray-800 disabled:bg-gray-300 transition-colors shadow-sm"
              title="Connect Uber Eats"
            >
              {isConnecting === 'UberEats' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="text-white font-bold text-lg">U</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="bg-primary/10 rounded-xl p-4 mb-6 border border-primary/20">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Spent This Quest</p>
            <p className="text-2xl font-bold text-primary">
              ${totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Transactions Yet!
            </h3>
            <p className="text-gray-600">
              You haven&apos;t ordered any food delivery during this quest. Keep it up!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}