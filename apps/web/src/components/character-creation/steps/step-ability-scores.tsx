'use client';

import { useState, useEffect } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@iarpg/ui';
import {
  STANDARD_ARRAY,
  POINT_BUY_COSTS,
  calculateModifier,
  type AbilityScores,
  type Race
} from '@/lib/character-data';

interface StepAbilityScoresProps {
  race: Race | null;
  abilityScores: AbilityScores | null;
  onSetAbilityScores: (scores: AbilityScores) => void;
  onNext: () => void;
  onPrevious: () => void;
}

type AbilityName = keyof AbilityScores;
type Method = 'standard-array' | 'point-buy';

const ABILITY_NAMES: { key: AbilityName; label: string }[] = [
  { key: 'strength', label: 'Strength' },
  { key: 'dexterity', label: 'Dexterity' },
  { key: 'constitution', label: 'Constitution' },
  { key: 'intelligence', label: 'Intelligence' },
  { key: 'wisdom', label: 'Wisdom' },
  { key: 'charisma', label: 'Charisma' },
];

export function StepAbilityScores({
  race,
  abilityScores,
  onSetAbilityScores,
  onNext,
  onPrevious
}: StepAbilityScoresProps) {
  const [method, setMethod] = useState<Method>('standard-array');
  const [baseScores, setBaseScores] = useState<AbilityScores>({
    strength: 8,
    dexterity: 8,
    constitution: 8,
    intelligence: 8,
    wisdom: 8,
    charisma: 8,
  });
  const [standardArrayValues, setStandardArrayValues] = useState<number[]>(STANDARD_ARRAY);
  const [pointsRemaining, setPointsRemaining] = useState(27);

  useEffect(() => {
    const finalScores = { ...baseScores };
    if (race?.abilityScoreIncrease) {
      Object.entries(race.abilityScoreIncrease).forEach(([ability, bonus]) => {
        if (bonus) {
          finalScores[ability as AbilityName] += bonus;
        }
      });
    }
    onSetAbilityScores(finalScores);
  }, [baseScores, race, onSetAbilityScores]);

  const handleStandardArrayAssign = (ability: AbilityName, value: number) => {
    const currentValue = baseScores[ability];

    // Remove current value back to pool
    if (currentValue !== 8) {
      setStandardArrayValues(prev => [...prev, currentValue].sort((a, b) => b - a));
    }

    // Assign new value
    setStandardArrayValues(prev => prev.filter((v, i) => i !== prev.indexOf(value)));
    setBaseScores(prev => ({ ...prev, [ability]: value }));
  };

  const handlePointBuyChange = (ability: AbilityName, newValue: number) => {
    const oldValue = baseScores[ability];
    const oldCost = POINT_BUY_COSTS[oldValue];
    const newCost = POINT_BUY_COSTS[newValue];

    if (newCost === undefined || newValue < 8 || newValue > 15) return;

    const pointDiff = newCost - oldCost;
    if (pointsRemaining - pointDiff < 0) return;

    setPointsRemaining(prev => prev - pointDiff);
    setBaseScores(prev => ({ ...prev, [ability]: newValue }));
  };

  const getFinalScore = (ability: AbilityName): number => {
    const baseScore = baseScores[ability];
    const racialBonus = race?.abilityScoreIncrease[ability] || 0;
    return baseScore + racialBonus;
  };

  const isComplete = Object.values(baseScores).every(score => score >= 8);

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-h1 font-bold mb-2">
          Set <span className="text-green-neon">Ability Scores</span>
        </h2>
        <p className="text-body text-gray-400">
          Choose your method and assign your ability scores
        </p>
      </div>

      {/* Method Selection */}
      <div className="flex gap-4 mb-8 justify-center">
        <Button
          variant={method === 'standard-array' ? 'default' : 'outline'}
          onClick={() => {
            setMethod('standard-array');
            setBaseScores({
              strength: 8,
              dexterity: 8,
              constitution: 8,
              intelligence: 8,
              wisdom: 8,
              charisma: 8,
            });
            setStandardArrayValues(STANDARD_ARRAY);
          }}
        >
          Standard Array
        </Button>
        <Button
          variant={method === 'point-buy' ? 'default' : 'outline'}
          onClick={() => {
            setMethod('point-buy');
            setBaseScores({
              strength: 8,
              dexterity: 8,
              constitution: 8,
              intelligence: 8,
              wisdom: 8,
              charisma: 8,
            });
            setPointsRemaining(27);
          }}
        >
          Point Buy
        </Button>
      </div>

      {method === 'point-buy' && (
        <div className="text-center mb-6">
          <div className="text-h3 text-green-neon">
            {pointsRemaining} Points Remaining
          </div>
          <p className="text-xs text-gray-500 mt-1">27 points total</p>
        </div>
      )}

      {method === 'standard-array' && standardArrayValues.length > 0 && (
        <div className="text-center mb-6">
          <div className="text-small text-gray-400">
            Available Values: {standardArrayValues.join(', ')}
          </div>
        </div>
      )}

      {/* Ability Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {ABILITY_NAMES.map(({ key, label }) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-h4">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {method === 'standard-array' ? (
                <div className="space-y-2">
                  <select
                    value={baseScores[key]}
                    onChange={(e) => handleStandardArrayAssign(key, Number(e.target.value))}
                    className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white"
                  >
                    <option value={8}>8</option>
                    {standardArrayValues.map((value, index) => (
                      <option key={`${value}-${index}`} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePointBuyChange(key, baseScores[key] - 1)}
                    disabled={baseScores[key] <= 8}
                  >
                    -
                  </Button>
                  <div className="text-h3 min-w-[3rem] text-center">
                    {baseScores[key]}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePointBuyChange(key, baseScores[key] + 1)}
                    disabled={baseScores[key] >= 15 || !POINT_BUY_COSTS[baseScores[key] + 1]}
                  >
                    +
                  </Button>
                </div>
              )}

              <div className="mt-4 space-y-1 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Base:</span>
                  <span>{baseScores[key]}</span>
                </div>
                {race && race.abilityScoreIncrease[key] && (
                  <div className="flex justify-between text-green-neon">
                    <span>Racial:</span>
                    <span>+{race.abilityScoreIncrease[key]}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold pt-1 border-t border-gray-700">
                  <span>Final:</span>
                  <span>{getFinalScore(key)} ({calculateModifier(getFinalScore(key)) >= 0 ? '+' : ''}{calculateModifier(getFinalScore(key))})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button
          onClick={onNext}
          disabled={!isComplete}
          size="lg"
        >
          Next: Equipment →
        </Button>
      </div>
    </div>
  );
}
