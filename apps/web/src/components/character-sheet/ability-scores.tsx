'use client';

import { Card, CardContent } from '@iarpg/ui';
import { calculateModifier, formatModifier, getModifierColor } from '@/lib/dnd-data';

interface AbilityScoresProps {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export function AbilityScores({
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
}: AbilityScoresProps) {
  const abilities = [
    { name: 'STR', fullName: 'Strength', score: strength },
    { name: 'DEX', fullName: 'Dexterity', score: dexterity },
    { name: 'CON', fullName: 'Constitution', score: constitution },
    { name: 'INT', fullName: 'Intelligence', score: intelligence },
    { name: 'WIS', fullName: 'Wisdom', score: wisdom },
    { name: 'CHA', fullName: 'Charisma', score: charisma },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {abilities.map((ability) => {
        const modifier = calculateModifier(ability.score);
        const modifierText = formatModifier(modifier);
        const modifierColor = getModifierColor(modifier);

        return (
          <Card key={ability.name} className="hover:border-green-neon/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className="text-xs text-gray-400 uppercase mb-1" title={ability.fullName}>
                {ability.name}
              </div>
              <div className="text-3xl font-bold mb-1">{ability.score}</div>
              <div className={`text-lg ${modifierColor}`}>{modifierText}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
