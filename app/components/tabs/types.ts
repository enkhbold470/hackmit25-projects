/**
 * Shared TypeScript interfaces and types for tab components
 * Centralizes type definitions for better maintainability
 */

export type CharacterStatus = 'powered' | 'neutral' | 'weakened';
export type MessageType = 'success' | 'warning' | 'info';
export type QuestResult = 'victory' | 'defeat';

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
  status: CharacterStatus;
}

export interface MessageItem {
  id: string;
  message: string;
  type: MessageType;
  timestamp: Date;
}

export interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface CharacterStatusCardProps {
  characterState: CharacterStatus;
  health: number;
}

export interface QuestProgressCardProps {
  daysRemaining: number;
  streak: number;
  progress: number;
}

export interface TeamStatusCardProps {
  members: TeamMember[];
  teamPower: number;
}

export interface CountdownTimerProps {
  endDate: Date;
}

export interface BattleSceneProps {
  members: TeamMember[];
  isQuestComplete: boolean;
  questResult?: QuestResult;
}

export interface TransactionItemProps {
  transaction: Transaction;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface KnotAPIConfig {
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