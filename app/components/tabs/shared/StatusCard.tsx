'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CharacterStatusCardProps, CharacterStatus } from '../types';

/**
 * Reusable StatusCard component for displaying character status
 * Handles different character states with appropriate images and health display
 */
export function StatusCard({ characterState, health }: CharacterStatusCardProps) {
  const getCharacterImageSrc = (state: CharacterStatus): string => {
    const validStates: CharacterStatus[] = ['powered', 'neutral', 'weakened'];
    if (validStates.includes(state)) {
      return `/imgs/01-${state}.png`;
    }
    return '/imgs/01-neutral.png'; // fallback
  };

  const getHealthColor = (healthValue: number): string => {
    if (healthValue > 80) return 'bg-primary';
    if (healthValue > 50) return 'bg-yellow-500';
    return 'bg-destructive';
  };

  const getCharacterStateLabel = (state: CharacterStatus): string => {
    return state.charAt(0).toUpperCase() + state.slice(1);
  };

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="mb-2 flex justify-center">
            <Image
              src={getCharacterImageSrc(characterState)}
              alt={`${getCharacterStateLabel(characterState)} Character`}
              width={150}
              height={150}
              className="rounded-lg"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
          <h3 className="font-semibold text-lg text-foreground">Your Character</h3>
          <p className="text-sm text-muted-foreground">{getCharacterStateLabel(characterState)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Character Health</span>
            <span className="font-medium">{health}%</span>
          </div>
          <Progress value={health} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}