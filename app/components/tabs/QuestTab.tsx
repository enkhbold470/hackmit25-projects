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
    <div className="bg-primary/10 border border-primary rounded-2xl p-6 my-6 shadow-sm">
      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-primary mb-4">
          The Quest Awaits
        </h3>
      </div>

      {/* Timer display - seamless */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 text-4xl font-bold text-primary">
          <span>{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-primary/60">:</span>
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-primary/60">:</span>
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-primary/60">:</span>
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
        <div className="flex justify-center gap-8 mt-2 text-sm text-primary/70">
          <span>DAYS</span>
          <span>HOURS</span>
          <span>MINUTES</span>
          <span>SECONDS</span>
        </div>
      </div>

      {/* Centered Prepare for Battle button */}
      {isUrgent && (
        <div className="text-center">
          <div className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-bold">
            Prepare for Battle!
          </div>
        </div>
      )}
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
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
          <div className={`text-4xl font-bold text-white`}>
            {questResult === 'victory' ? '✓' : '✗'}
          </div>
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
          <Image src="/boss-imgs/1.png" alt="Takeout Titan" className="mx-auto rounded-full" width={250} height={250} />

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
      </div>

      {/* Battle effects */}
      <div className="text-center mt-6">
        <div className="h-px bg-primary/20 w-24 mx-auto"></div>
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
        <CountdownTimer endDate={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)} />
      )}
      {!isQuestComplete && (
        <div className="mt-6 bg-primary/10 rounded-xl p-4 border border-primary/20">
          <div className="text-center">
            <p className="text-sm text-primary font-medium mb-2">
              Quest Tip
            </p>
            <p className="text-xs text-primary/80">
              Every delivery order weakens your team. Work together to avoid ordering and defeat the boss!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}