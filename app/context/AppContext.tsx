'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Transaction {
  id: string;
  restaurant: string;
  amount: number;
  date: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: 'powered' | 'neutral' | 'weakened';
}

export interface MessageItem {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info';
  timestamp: Date;
}

interface AppState {
  characterHealth: number;
  characterStatus: 'powered' | 'neutral' | 'weakened';
  questEndDate: Date;
  streak: number;
  transactions: Transaction[];
  teamMembers: TeamMember[];
  messages: MessageItem[];
  teamPower: number;
}

interface AppContextType {
  state: AppState;
  addTransaction: (restaurant: string, amount: number) => void;
  updateCharacterStatus: (status: 'powered' | 'neutral' | 'weakened') => void;
  addMessage: (message: string, type: 'success' | 'warning' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    characterHealth: 85,
    characterStatus: 'neutral',
    questEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
    streak: 3,
    transactions: [
      {
        id: '1',
        restaurant: 'Pizza Palace',
        amount: 24.99,
        date: new Date('2024-01-15')
      },
      {
        id: '2',
        restaurant: 'Burger Junction',
        amount: 18.50,
        date: new Date('2024-01-12')
      },
      {
        id: '3',
        restaurant: 'Sushi Express',
        amount: 32.75,
        date: new Date('2024-01-10')
      },
      {
        id: '4',
        restaurant: 'Taco Time',
        amount: 15.25,
        date: new Date('2024-01-08')
      },
      {
        id: '5',
        restaurant: 'Chinese Garden',
        amount: 28.90,
        date: new Date('2024-01-05')
      }
    ],
    teamMembers: [
      { id: '1', name: 'You', avatar: '😊', status: 'neutral' },
      { id: '2', name: 'Dave', avatar: '😵‍💫', status: 'weakened' },
      { id: '3', name: 'Sarah', avatar: '💪', status: 'powered' },
      { id: '4', name: 'Mike', avatar: '😊', status: 'neutral' }
    ],
    messages: [
      {
        id: '1',
        message: 'Congrats on your 3-day streak! 🔥',
        type: 'success',
        timestamp: new Date()
      },
      {
        id: '2',
        message: 'Dave ordered from Pizza Palace. His character is weakened!',
        type: 'warning',
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: '3',
        message: 'No orders from the team yesterday. Great job!',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 86400000)
      }
    ],
    teamPower: 78
  });

  const addTransaction = (restaurant: string, amount: number) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      restaurant,
      amount,
      date: new Date()
    };

    setState(prev => ({
      ...prev,
      transactions: [newTransaction, ...prev.transactions],
      characterHealth: Math.max(prev.characterHealth - 10, 0),
      characterStatus: 'weakened' as const,
      teamPower: Math.max(prev.teamPower - 5, 0),
      streak: 0
    }));

    addMessage(`You ordered from ${restaurant}. Your character is weakened!`, 'warning');
  };

  const updateCharacterStatus = (status: 'powered' | 'neutral' | 'weakened') => {
    setState(prev => ({
      ...prev,
      characterStatus: status,
      characterHealth: status === 'powered' ? 100 : status === 'weakened' ? Math.max(prev.characterHealth - 10, 30) : prev.characterHealth
    }));
  };

  const addMessage = (message: string, type: 'success' | 'warning' | 'info') => {
    const newMessage: MessageItem = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date()
    };

    setState(prev => ({
      ...prev,
      messages: [newMessage, ...prev.messages.slice(0, 9)] // Keep only last 10 messages
    }));
  };

  return (
    <AppContext.Provider value={{
      state,
      addTransaction,
      updateCharacterStatus,
      addMessage
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}