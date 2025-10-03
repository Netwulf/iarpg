'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@iarpg/ui';
import { RACES, type Race } from '@/lib/character-data';

interface StepRaceProps {
  selectedRace: Race | null;
  onSelectRace: (race: Race) => void;
  onNext: () => void;
}

export function StepRace({ selectedRace, onSelectRace, onNext }: StepRaceProps) {
  const handleNext = () => {
    if (selectedRace) {
      onNext();
    }
  };

  const getAbilityBonusText = (race: Race): string => {
    const bonuses = Object.entries(race.abilityScoreIncrease)
      .filter(([_, value]) => value && value > 0)
      .map(([key, value]) => `${key.toUpperCase().slice(0, 3)} +${value}`)
      .join(', ');
    return bonuses;
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-h1 font-bold mb-2">
          Choose Your <span className="text-green-neon">Race</span>
        </h2>
        <p className="text-body text-gray-400">
          Your race determines ability score bonuses, size, and speed
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {RACES.map((race) => (
          <Card
            key={race.id}
            className={`cursor-pointer transition-all ${
              selectedRace?.id === race.id
                ? 'border-green-neon border-2'
                : 'hover:border-gray-700'
            }`}
            onClick={() => onSelectRace(race)}
          >
            <CardHeader>
              <CardTitle className="text-h3">{race.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-small text-gray-400 mb-4">
                {race.description}
              </p>
              <div className="space-y-2 text-xs text-gray-300">
                <div><strong>Size:</strong> {race.size}</div>
                <div><strong>Speed:</strong> {race.speed} ft.</div>
                <div><strong>Bonuses:</strong> {getAbilityBonusText(race)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedRace}
          size="lg"
        >
          Next: Choose Class →
        </Button>
      </div>
    </div>
  );
}
