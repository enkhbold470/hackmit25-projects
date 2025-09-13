'use client';

import { useApp, Transaction } from '../../context/AppContext';

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
  const { state } = useApp();
  const { transactions } = state;

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Transactions</h2>
        <p className="text-gray-600 text-sm">
          Your food delivery orders during this quest
        </p>
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