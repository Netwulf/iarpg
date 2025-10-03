'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@iarpg/ui';
import { SAVING_THROWS, calculateModifier, formatModifier, type AbilityName } from '@/lib/dnd-data';

interface SavingThrowsProps {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: string[];
  proficiencyBonus: number;
}

export function SavingThrows({
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  proficiencies,
  proficiencyBonus,
}: SavingThrowsProps) {
  const abilityScores: Record<AbilityName, number> = {
    strength,
    dexterity,
    constitution,
    intelligence,
    wisdom,
    charisma,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saving Throws</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {SAVING_THROWS.map((save) => {
          const abilityScore = abilityScores[save.ability as AbilityName];
          const modifier = calculateModifier(abilityScore);
          const isProficient = proficiencies.includes(save.name);
          const totalModifier = isProficient ? modifier + proficiencyBonus : modifier;
          const modifierText = formatModifier(totalModifier);

          return (
            <div
              key={save.name}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-900 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isProficient ? 'bg-green-neon border-green-neon' : 'border-gray-600'
                  }`}
                />
                <span className="text-small font-medium">{save.name}</span>
              </div>
              <span className={`text-small font-mono ${totalModifier >= 0 ? 'text-green-neon' : 'text-red'}`}>
                {modifierText}
              </span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
