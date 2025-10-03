'use client';

import { Card } from '@iarpg/ui';

interface AbilityScoreProps {
  name: string;
  score: number;
  onRoll?: () => void;
}

export function AbilityScore({ name, score, onRoll }: AbilityScoreProps) {
  const modifier = Math.floor((score - 10) / 2);
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;
  const modifierColor =
    modifier > 0 ? 'text-green-500' : modifier < 0 ? 'text-red-500' : 'text-gray-400';

  return (
    <Card className="p-4 text-center hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={onRoll}>
      <div className="text-xs text-gray-400 uppercase font-medium mb-1">{name}</div>
      <div className="text-3xl font-bold mb-1">{score}</div>
      <div className={`text-lg font-semibold ${modifierColor}`}>{modifierText}</div>
    </Card>
  );
}
