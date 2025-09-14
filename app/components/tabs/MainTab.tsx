'use client';

import { Flame, Users } from 'lucide-react';
import { useApp, MessageItem, TeamMember } from '../../context/AppContext';
import Image from 'next/image';

interface CharacterStatusCardProps {
  characterState: 'powered' | 'neutral' | 'weakened';
  health: number;
}

function CharacterStatusCard({ characterState, health }: CharacterStatusCardProps) {
  const getCharacterEmoji = () => {
    const validStates = ['powered', 'neutral', 'weakened'];
    if (validStates.includes(characterState)) {
      return (
        <img
          src={`/imgs/01-${characterState}.png`}
          alt={`${characterState.charAt(0).toUpperCase() + characterState.slice(1)} Character`}
          className="mx-auto"
          width={150}
          height={150}
        />
      );
    }
    // fallback
    return <img src="/imgs/01-neutral.png" alt="Neutral Character" className="mx-auto" width={150} height={150} />;
  };

  const getHealthColor = () => {
    if (health > 80) return 'bg-primary';
    if (health > 50) return 'bg-yellow-500';
    return 'bg-secondary';
  };

  return (
    <div className="bg-card rounded-2xl p-6 mb-4 shadow-sm">
      <div className="text-center mb-4">
        <div className="text-6xl mb-2">{getCharacterEmoji()}</div>
        <h3 className="font-semibold text-lg">Your Character</h3>
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Character Health</span>
          <span>{health}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${getHealthColor()}`}
            style={{ width: `${health}%` }}
          />
        </div>
      </div>
    </div>
  );
}


function DailyMessagesCard({ messages }: { messages: MessageItem[] }) {
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success': return '🎉';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 mb-4 shadow-sm">
      <h3 className="font-semibold text-lg mb-3">Daily Messages</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto">
        {messages?.map((message) => (
          <div key={message.id} className="flex items-start gap-3 p-2 rounded-lg bg-gray-50">
            <span className="text-lg">{getMessageIcon(message.type)}</span>
            <div className="flex-1">
              <p className="text-sm text-foreground">{message.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(message.timestamp).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface QuestProgressCardProps {
  daysRemaining: number;
  streak: number;
  progress: number;
}

function QuestProgressCard({ daysRemaining, streak, progress }: QuestProgressCardProps) {
  return (
    <div className="bg-card rounded-2xl p-4 mb-4 shadow-sm">
      <h3 className="font-semibold text-lg mb-3">Quest Progress</h3>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Progress to Boss</span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{daysRemaining}</div>
          <div className="text-sm text-gray-600">Days Remaining</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="text-orange-500" size={20} />
            <span className="text-2xl font-bold text-secondary">{streak}</span>
          </div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
      </div>
    </div>
  );
}


interface TeamStatusCardProps {
  members: TeamMember[];
  teamPower: number;
}

function TeamStatusCard({ members, teamPower }: TeamStatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'powered': return 'border-primary bg-primary/10';
      case 'weakened': return 'border-secondary bg-secondary/10';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2); // Take only first 2 initials
  };

  const getCircleBackground = (status: string) => {
    switch (status) {
      case 'powered': return 'bg-primary';
      case 'weakened': return 'bg-secondary';
      default: return 'bg-gray-400';
    }
  };

  const getCharacterClass = (status: string) => {
    switch (status) {
      case 'powered': return 'scale-110 brightness-110';
      case 'weakened': return 'scale-90 opacity-60 grayscale';
      default: return '';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Users size={20} className="text-primary" />
        <h3 className="font-semibold text-lg">Team Status</h3>
      </div>

      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        {members?.map((member) => (
          <div key={member.id} className="text-center">
            <div className={`mb-2 transition-all ${getCharacterClass(member.status)}`}>
              <Image
                src={`/imgs/01-${member.status}.png`}
                alt={`${member.name} - ${member.status}`}
                width={60}
                height={60}
                className="rounded-full mx-auto"
              />
            </div>
            <p className="text-xs text-gray-600 font-medium">{member.name}</p>
          </div>
        ))}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Team Power</span>
          <span>{teamPower}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all"
            style={{ width: `${teamPower}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function MainTab() {
  const { state } = useApp();

  const daysRemaining = (state.questEndDate && !isNaN(state.questEndDate.getTime()))
    ? Math.ceil((state.questEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;
  const progress = Math.max(0, Math.min(100, ((20 - daysRemaining) / 20) * 100)); // Assuming 20-day quest

  return (
    <div className="p-4 pb-20">
      <CharacterStatusCard characterState={state.characterStatus} health={state.characterHealth} />
      <DailyMessagesCard messages={state.messages} />
      <QuestProgressCard
        daysRemaining={daysRemaining}
        streak={state.streak}
        progress={progress}
      />
      <TeamStatusCard members={state.teamMembers} teamPower={state.teamPower} />
    </div>
  );
}