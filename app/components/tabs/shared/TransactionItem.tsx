'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TransactionItemProps } from '../types';

/**
 * Reusable TransactionItem component for displaying transaction information
 * Provides consistent formatting for transaction data
 */
export function TransactionItem({ transaction }: TransactionItemProps) {
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground mb-1 truncate">
              {transaction.restaurant}
            </h4>
            <p className="text-sm text-muted-foreground">
              {formatDate(transaction.date)}
            </p>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <span className="text-lg font-semibold text-foreground">
              {formatAmount(transaction.amount)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}