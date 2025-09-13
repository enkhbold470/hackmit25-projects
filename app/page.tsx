'use client';

import { useState } from 'react';
import BottomNavigation from './components/BottomNavigation';
import MainTab from './components/tabs/MainTab';
import TransactionsTab from './components/tabs/TransactionsTab';
import QuestTab from './components/tabs/QuestTab';
import UserTab from './components/tabs/UserTab';

export default function Home() {
  const [activeTab, setActiveTab] = useState('main');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'main':
        return <MainTab />;
      case 'transactions':
        return <TransactionsTab />;
      case 'quest':
        return <QuestTab />;
      case 'user':
        return <UserTab />;
      default:
        return <MainTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-md mx-auto min-h-screen">
        {renderActiveTab()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
