'use client';

import { Home, FileText, Sword, User } from 'lucide-react';

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ icon, label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center py-2 px-3 min-h-[60px] transition-colors ${
        isActive
          ? 'text-primary'
          : 'text-gray-500 hover:text-foreground'
      }`}
    >
      <div className="mb-1">
        {icon}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-gray-200 px-2">
      <div className="flex justify-around max-w-md mx-auto">
        <TabButton
          icon={<Home size={24} />}
          label="Main"
          isActive={activeTab === 'main'}
          onClick={() => onTabChange('main')}
        />
        <TabButton
          icon={<FileText size={24} />}
          label="Transactions"
          isActive={activeTab === 'transactions'}
          onClick={() => onTabChange('transactions')}
        />
        <TabButton
          icon={<Sword size={24} />}
          label="Quest"
          isActive={activeTab === 'quest'}
          onClick={() => onTabChange('quest')}
        />
        <TabButton
          icon={<User size={24} />}
          label="User"
          isActive={activeTab === 'user'}
          onClick={() => onTabChange('user')}
        />
      </div>
    </nav>
  );
}