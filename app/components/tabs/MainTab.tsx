'use client';

import { Flame, Users, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { useApp, MessageItem, TeamMember } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StatusCard } from './shared/StatusCard';
import { MessageType } from './types';

function DailyMessagesCard({ messages }: { messages: MessageItem[] }) {
  const getMessageBadgeVariant = (type: MessageType) => {
    switch (type) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Daily Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-muted-foreground text-sm">No messages today</p>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex items-start gap-2 text-sm">
                <Badge variant={getMessageBadgeVariant(message.type)} className="text-xs">
                  {message.type}
                </Badge>
                <span className="flex-1">{message.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function QuestProgressCard({ daysRemaining, streak, progress }: { daysRemaining: number; streak: number; progress: number }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Flame className="text-orange-500 h-5 w-5" />
          Quest Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{daysRemaining}</div>
            <div className="text-sm text-muted-foreground">Days Left</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{streak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}


function TeamStatusCard({ members, teamPower }: { members: TeamMember[]; teamPower: number }) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'powered': return 'default';
      case 'neutral': return 'secondary';
      case 'weakened': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="text-blue-500 h-5 w-5" />
          Team Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Team Power</span>
            <span className="text-sm font-medium">{teamPower}%</span>
          </div>
          <Progress value={teamPower} className="h-2" />
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={`https://pickeanu.com/500?random=${member.id}`} 
                    alt={member.name}
                  />
                  <AvatarFallback>{member.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{member.name}</span>
              </div>
              <Badge variant={getStatusBadgeVariant(member.status)} className="text-xs">
                {getStatusLabel(member.status)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MainTab() {
  const { state } = useApp();

  const daysRemaining = Math.ceil((state.questEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, Math.min(100, ((20 - daysRemaining) / 20) * 100)); // Assuming 20-day quest

  return (
    <div className="p-4 pb-20">
      <StatusCard characterState={state.characterStatus} health={state.characterHealth} />
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