'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CountdownTimerProps, TimeLeft } from '../types';

/**
 * Reusable CountdownTimer component for displaying time remaining
 * Updates in real-time and handles countdown logic
 */
export function CountdownTimer({ endDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        return {
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Set up interval for updates
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const timeUnits = [
    { value: timeLeft.days, label: 'DAYS' },
    { value: timeLeft.hours, label: 'HRS' },
    { value: timeLeft.minutes, label: 'MIN' },
    { value: timeLeft.seconds, label: 'SEC' }
  ];

  return (
    <div className="bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-2xl p-6 mb-6 border border-primary/30">
      <h3 className="text-center text-lg font-semibold text-foreground mb-4">
        Time Until Boss Fight
      </h3>
      <div className="grid grid-cols-4 gap-2 text-center">
        {timeUnits.map((unit, index) => (
          <Card key={index} className="bg-card">
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-primary">{unit.value}</div>
              <div className="text-xs text-muted-foreground">{unit.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}