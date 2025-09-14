'use client';

import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MenuItemProps } from '../types';

/**
 * Reusable MenuItem component for consistent menu item styling
 * Used across different tabs for navigation and action items
 */
export function MenuItem({ icon, label, onClick, disabled = false }: MenuItemProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="ghost"
      className="w-full bg-card rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors h-auto"
    >
      <div className="flex items-center gap-3">
        <div className="text-primary flex-shrink-0">
          {icon}
        </div>
        <span className="font-medium text-foreground text-left">{label}</span>
      </div>
      <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
    </Button>
  );
}