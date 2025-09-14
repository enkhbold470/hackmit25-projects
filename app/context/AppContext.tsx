'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Product {
  id: string;
  externalId: string;
  name: string;
  quantity: number;
  price: number;
  unitPrice: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisineType?: string;
  merchantId?: number;
}

export interface Transaction {
  id: string;
  restaurant: string;
  restaurantInfo?: Restaurant;
  amount: number;
  date: Date;
  merchantId?: number;
  merchantName?: string;
  externalId?: string;
  status?: string;
  products?: Product[];
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
  loading: boolean;
  userId: string | null;
  teamId: string | null;
  addTransaction: (restaurant: string, amount: number) => void;
  updateCharacterStatus: (status: 'powered' | 'neutral' | 'weakened') => void;
  addMessage: (message: string, type: 'success' | 'warning' | 'info') => void;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Use the seeded user ID from our database (you might want to make this dynamic in a real app)
  const [userId] = useState<string>('85dba939-95c4-4139-abe1-6534a6c839da'); // From seeded data
  const [teamId] = useState<string>('6cf5ab2e-16e4-4f76-98b2-7234be97d076'); // From seeded data
  const [loading, setLoading] = useState(true);

  const [state, setState] = useState<AppState>({
    characterHealth: 85,
    characterStatus: 'neutral',
    questEndDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    streak: 3,
    transactions: [],
    teamMembers: [],
    messages: [],
    teamPower: 78
  });

  // Fetch all app data from backend APIs
  const refreshData = useCallback(async () => {
    if (!userId || !teamId) return;

    try {
      setLoading(true);

      // Fetch character data
      const characterRes = await fetch(`/api/character?userId=${userId}`);
      const characterData = await characterRes.json();

      // Fetch team data
      const teamRes = await fetch(`/api/team?teamId=${teamId}`);
      const teamData = await teamRes.json();

      // Fetch messages
      const messagesRes = await fetch(`/api/messages?userId=${userId}&limit=10`);
      const messagesData = await messagesRes.json();

      // Fetch quest data
      const questRes = await fetch(`/api/quest?teamId=${teamId}`);
      const questData = await questRes.json();

      // Fetch transactions
      const transactionsRes = await fetch(`/api/transactions?userId=${userId}&limit=20`);
      const transactionsData = await transactionsRes.json();

      setState({
        characterHealth: characterData.health,
        characterStatus: characterData.status,
        streak: characterData.streak,
        questEndDate: new Date(questData.endDate),
        teamMembers: teamData.members,
        teamPower: teamData.power,
        messages: messagesData.messages,
        transactions: transactionsData.transactions,
      });
    } catch (error) {
      console.error('Error fetching app data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, teamId]);

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, [userId, teamId, refreshData]);

  const addTransaction = async (restaurant: string, amount: number) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          restaurant,
          amount,
        }),
      });

      if (response.ok) {
        // Refresh data to get updated state
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const updateCharacterStatus = async (status: 'powered' | 'neutral' | 'weakened') => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/character?userId=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating character status:', error);
    }
  };

  const addMessage = async (message: string, type: 'success' | 'warning' | 'info') => {
    if (!userId) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message,
          type,
        }),
      });

      if (response.ok) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      state,
      loading,
      userId,
      teamId,
      addTransaction,
      updateCharacterStatus,
      addMessage,
      refreshData
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