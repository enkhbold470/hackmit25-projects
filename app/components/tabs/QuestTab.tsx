'use client';

import { useEffect, useState } from 'react';
import { useApp, TeamMember } from '../../context/AppContext';

interface CountdownTimerProps {
  endDate: Date;
}

function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl p-6 mb-6 border border-primary/30">
      <h3 className="text-center text-lg font-semibold text-foreground mb-4">
        Time Until Boss Fight
      </h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-card rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.days}</div>
          <div className="text-xs text-gray-600">DAYS</div>
        </div>
        <div className="bg-card rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.hours}</div>
          <div className="text-xs text-gray-600">HRS</div>
        </div>
        <div className="bg-card rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.minutes}</div>
          <div className="text-xs text-gray-600">MIN</div>
        </div>
        <div className="bg-card rounded-lg p-3">
          <div className="text-2xl font-bold text-primary">{timeLeft.seconds}</div>
          <div className="text-xs text-gray-600">SEC</div>
        </div>
      </div>
    </div>
  );
}


interface BattleSceneProps {
  members: TeamMember[];
  isQuestComplete: boolean;
  questResult?: 'victory' | 'defeat';
}

function BattleScene({ members, isQuestComplete, questResult }: BattleSceneProps) {
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

  return (
    <div className="bg-gradient-to-b from-red-900/20 to-gray-900/20 rounded-2xl p-6 shadow-sm">
      {/* Boss at the top */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-2 animate-pulse">👹</div>
        <h3 className="text-xl font-bold text-red-600 mb-1">Takeout Titan</h3>
        <p className="text-sm text-gray-600">The Final Boss</p>
      </div>

      {/* Battle ground separator */}
      <div className="border-t-2 border-dashed border-gray-400 mb-8 opacity-50"></div>

      {/* Team at the bottom */}
      <div className="text-center">
        <h4 className="text-lg font-semibold text-foreground mb-4">Your Team</h4>
        <div className="flex justify-center gap-4 flex-wrap">
          {members.map((member) => (
            <div key={member.id} className="text-center">
              <div className={`text-4xl mb-2 transition-all ${getCharacterClass(member.status)}`}>
                {member.avatar}
              </div>
              <p className="text-xs text-gray-600 font-medium">{member.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Battle effects */}
      <div className="text-center mt-6">
        <div className="text-2xl">⚔️ ⚡ 🛡️</div>
      </div>
    </div>
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