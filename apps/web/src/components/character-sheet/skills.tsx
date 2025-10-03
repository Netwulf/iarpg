'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@iarpg/ui';
import { DND_SKILLS, calculateModifier, formatModifier, type AbilityName } from '@/lib/dnd-data';
import { Dices } from 'lucide-react';

interface SkillsProps {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  proficiencies: string[];
  proficiencyBonus: number;
}

export function Skills({
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  proficiencies,
  proficiencyBonus,
}: SkillsProps) {
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
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {DND_SKILLS.map((skill) => {
          const abilityScore = abilityScores[skill.ability as AbilityName];
          const modifier = calculateModifier(abilityScore);
          const isProficient = proficiencies.includes(skill.name);
          const totalModifier = isProficient ? modifier + proficiencyBonus : modifier;
          const modifierText = formatModifier(totalModifier);

          return (
            <div
              key={skill.name}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-900 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isProficient ? 'bg-green-neon border-green-neon' : 'border-gray-600'
                  }`}
                />
                <div>
                  <span className="text-small font-medium">{skill.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({skill.ability.slice(0, 3).toUpperCase()})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-small font-mono ${totalModifier >= 0 ? 'text-green-neon' : 'text-red'}`}>
                  {modifierText}
                </span>
                <Dices className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
