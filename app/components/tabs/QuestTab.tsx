'use client';

import { useEffect, useState } from 'react';
import { useApp, TeamMember } from '../../context/AppContext';
import Image from 'next/image';
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
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        const newTimeLeft = {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
        setTimeLeft(newTimeLeft);
        
        // Make it urgent when less than 1 hour remaining
        const totalMinutes = newTimeLeft.days * 24 * 60 + newTimeLeft.hours * 60 + newTimeLeft.minutes;
        setIsUrgent(totalMinutes < 60);
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsUrgent(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="bg-gradient-to-b from-green-50 to-emerald-100 border-2 border-green-700 rounded-lg p-6 my-6 shadow-lg relative overflow-hidden">
      {/* Nature texture overlay */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-green-200 via-transparent to-emerald-300" />
      
      {/* Decorative corner flourishes */}
      <div className="absolute top-2 left-2 text-green-700 text-lg opacity-60">🍃</div>
      <div className="absolute top-2 right-2 text-green-700 text-lg opacity-60">🍃</div>
      <div className="absolute bottom-2 left-2 text-green-700 text-lg opacity-60">🍃</div>
      <div className="absolute bottom-2 right-2 text-green-700 text-lg opacity-60">🍃</div>
      
      {/* Title */}
      <div className="text-center mb-6 relative z-10">
        <h3 className="text-2xl font-serif font-bold text-green-900 mb-1">
          The Quest Awaits
        </h3>
        <div className="text-sm text-green-700 font-medium tracking-wide">
          Time Until Adventure
        </div>
        {isUrgent && (
          <div className="mt-2 text-red-700 font-bold text-sm animate-pulse">
            ⚠ The hour draws near! ⚠
          </div>
        )}
      </div>
      
      {/* Timer display */}
      <div className="grid grid-cols-4 gap-4 text-center relative z-10">
        {[
          { value: timeLeft.days, label: 'Days', unit: 'd' },
          { value: timeLeft.hours, label: 'Hours', unit: 'h' },
          { value: timeLeft.minutes, label: 'Minutes', unit: 'm' },
          { value: timeLeft.seconds, label: 'Seconds', unit: 's' }
        ].map((item, index) => (
          <div key={index} className="bg-white/90 border border-green-600 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow">
            <div className={`text-3xl font-bold mb-1 font-serif ${
              isUrgent && item.unit === 's' 
                ? 'text-red-800 animate-pulse' 
                : 'text-green-900'
            }`}>
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="text-xs font-medium text-green-700 uppercase tracking-wider">
              {item.label}
            </div>
          </div>
        ))}
      </div>
      
      {/* Bottom decorative element */}
      <div className="mt-6 text-center relative z-10">
        <div className="inline-flex items-center gap-2 text-green-700 opacity-70">
          <span className="text-sm">⚔</span>
          <div className="h-px bg-green-600 w-16"></div>
          <span className="text-lg">🐉</span>
          <div className="h-px bg-green-600 w-16"></div>
          <span className="text-sm">⚔</span>
        </div>
        {isUrgent && (
          <div className="mt-3 inline-block px-4 py-2 bg-red-100 border border-red-400 rounded-md">
            <span className="text-red-800 font-bold text-sm">Prepare for Battle!</span>
          </div>
        )}
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
        <div className="text-8xl mb-2 animate-pulse">
          <Image src="/boss-imgs/1.jpg" alt="Takeout Titan" className="mx-auto rounded-full" width={250} height={250} />

        </div>
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

     

      <BattleScene
        members={teamMembers}
        isQuestComplete={isQuestComplete}
        questResult={questResult}
      />

 {!isQuestComplete && (
        <CountdownTimer endDate={questEndDate} />
      )}
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