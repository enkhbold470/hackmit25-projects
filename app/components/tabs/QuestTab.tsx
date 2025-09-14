'use client';

import { Sword, Shield, Zap, Users, Target, Clock } from 'lucide-react';
import Image from 'next/image';
import { useApp, TeamMember } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CountdownTimer } from './shared/CountdownTimer';

function QuestProgressCard() {
  const progress = 65; // Example progress
  const timeLeft = "2h 15m";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-500" />
            Daily Quest Progress
          </CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeLeft} left
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Resist Food Delivery</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-green-600">8</div>
            <div className="text-xs text-muted-foreground">Meals Resisted</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-xs text-muted-foreground">Hours Strong</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-xs text-muted-foreground">Streak Days</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BattleScene({ members, isQuestComplete, questResult }: { members: TeamMember[]; isQuestComplete: boolean; questResult?: 'victory' | 'defeat' }) {
  const getCharacterClass = (status: string) => {
    switch (status) {
      case 'powered': return 'scale-110 brightness-110';
      case 'weakened': return 'scale-90 opacity-60 grayscale';
      default: return '';
    }
  };

  if (isQuestComplete) {
    return (
      <div className="bg-card rounded-2xl p-8 text-center shadow-sm">
        <div className="text-8xl mb-4">
          {questResult === 'victory' ? '🏆' : '💀'}
        </div>
        <h2 className={`text-3xl font-bold mb-4 ${
          questResult === 'victory' ? 'text-primary' : 'text-secondary'
        }`}>
          {questResult === 'victory' ? 'VICTORY!' : 'DEFEAT!'}
        </h2>
        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
          <p className="text-lg font-semibold text-foreground mb-2">
            Quest Summary
          </p>
          <p className="text-primary text-xl font-bold">
            Your team saved an estimated $245 this quest!
          </p>
        </div>
      </div>
    );
  }

  const getBattleStatusColor = (status: string) => {
    switch (status) {
      case 'powered': return 'border-green-500 bg-green-100';
      case 'weakened': return 'border-red-500 bg-red-100';
      default: return 'border-yellow-500 bg-yellow-100';
    }
  };

  return (
    <Card className="bg-gradient-to-b from-red-900/10 to-orange-900/10 border-red-500/30">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Sword className="h-6 w-6 text-red-500" />
          {isQuestComplete ? 'Battle Complete!' : 'Preparing for Battle'}
        </CardTitle>
        {questResult && (
          <Badge 
            variant={questResult === 'victory' ? 'default' : 'destructive'}
            className="text-lg py-1 px-3"
          >
            {questResult === 'victory' ? '🎉 Victory!' : '💀 Defeat!'}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {/* Boss Image */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Image
              src="/boss-imgs/1.jpg"
              alt="Boss Enemy"
              width={200}
              height={200}
              className="rounded-xl shadow-lg"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
              💀
            </Badge>
          </div>
        </div>

        {/* Team vs Boss */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Team Side */}
          <div className="text-center">
            <h4 className="font-semibold mb-3 text-blue-600 flex items-center justify-center gap-1">
              <Users className="h-4 w-4" />
              Your Team
            </h4>
            <div className="flex justify-center gap-2 flex-wrap">
              {members.map((member) => (
                <Avatar key={member.id} className={`h-12 w-12 border-2 ${getBattleStatusColor(member.status)}`}>
                  <AvatarImage 
                    src={`https://pickeanu.com/500?random=${member.id}`} 
                    alt={member.name}
                  />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>

          {/* VS */}
          <div className="text-center">
            <Badge variant="outline" className="text-2xl font-bold text-red-600 py-2 px-4">
              VS
            </Badge>
          </div>

          {/* Boss Side */}
          <div className="text-center">
            <h4 className="font-semibold mb-3 text-red-600 flex items-center justify-center gap-1">
              <Shield className="h-4 w-4" />
              Food Boss
            </h4>
            <div className="text-4xl">🍔</div>
          </div>
        </div>

        {isQuestComplete && (
          <Card className="mt-6">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Battle Results
              </h4>
              <p className="text-sm text-muted-foreground">
                {questResult === 'victory' 
                  ? 'Your team successfully resisted the temptation of food delivery! Everyone gains power.' 
                  : 'The food boss was too strong this time. Regroup and try again!'}
              </p>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

export default function QuestTab() {
  const { state } = useApp();
  const { questEndDate, teamMembers } = state;

  const isQuestComplete = questEndDate.getTime() <= Date.now();
  const questResult: 'victory' | 'defeat' = 'victory';

  return (
    <div className="p-4 pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          The Quest
        </h2>
        <p className="text-gray-600 text-sm text-center">
          Face the Takeout Titan with your team
        </p>
      </div>

      {!isQuestComplete && (
        <CountdownTimer endDate={questEndDate} />
      )}

      <div className="mb-6">
        <QuestProgressCard />
      </div>

      <BattleScene
        members={teamMembers}
        isQuestComplete={isQuestComplete}
        questResult={questResult}
      />

      {!isQuestComplete && (
        <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div className="text-center">
            <p className="text-sm text-blue-800 font-medium mb-2">
              💡 Quest Tip
            </p>
            <p className="text-xs text-blue-700">
              Every delivery order weakens your team. Work together to avoid ordering and defeat the boss!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}