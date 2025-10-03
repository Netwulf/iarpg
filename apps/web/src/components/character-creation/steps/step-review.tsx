'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@iarpg/ui';
import { calculateModifier, calculateHP, calculateAC } from '@/lib/character-data';
import type { CharacterFormData } from '../guided-creation-flow';

interface StepReviewProps {
  formData: CharacterFormData;
  onUpdateFormData: (data: Partial<CharacterFormData>) => void;
  onPrevious: () => void;
  onCreateCharacter: () => void;
  loading: boolean;
  error: string;
}

export function StepReview({
  formData,
  onUpdateFormData,
  onPrevious,
  onCreateCharacter,
  loading,
  error
}: StepReviewProps) {
  const { race, class: classData, abilityScores, equipment, name, background } = formData;

  if (!race || !classData || !abilityScores) {
    return null;
  }

  const hp = calculateHP(classData, abilityScores.constitution);
  const ac = calculateAC(abilityScores.dexterity);
  const initiative = calculateModifier(abilityScores.dexterity);
  const proficiencyBonus = 2; // Level 1

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-h1 font-bold mb-2">
          <span className="text-green-neon">Review</span> Your Character
        </h2>
        <p className="text-body text-gray-400">
          Confirm your choices and name your character
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Character Details */}
        <Card>
          <CardHeader>
            <CardTitle>Character Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Character Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => onUpdateFormData({ name: e.target.value })}
                placeholder="Enter character name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Background (Optional)</Label>
              <textarea
                id="background"
                value={background}
                onChange={(e) => onUpdateFormData({ background: e.target.value })}
                placeholder="A brief description of your character's background..."
                className="w-full min-h-[100px] bg-gray-900 border border-gray-700 rounded-md p-3 text-white text-small"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800 text-small">
              <div>
                <div className="text-gray-400">Race</div>
                <div className="text-white font-semibold">{race.name}</div>
              </div>
              <div>
                <div className="text-gray-400">Class</div>
                <div className="text-white font-semibold">{classData.name}</div>
              </div>
              <div>
                <div className="text-gray-400">Level</div>
                <div className="text-white font-semibold">1</div>
              </div>
              <div>
                <div className="text-gray-400">Proficiency</div>
                <div className="text-white font-semibold">+{proficiencyBonus}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Combat Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Combat Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-xs uppercase mb-1">Hit Points</div>
                <div className="text-h1 text-green-neon">{hp}</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-xs uppercase mb-1">Armor Class</div>
                <div className="text-h1 text-green-neon">{ac}</div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-xs uppercase mb-1">Initiative</div>
                <div className="text-h1 text-green-neon">
                  {initiative >= 0 ? '+' : ''}{initiative}
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-4 text-center">
                <div className="text-gray-400 text-xs uppercase mb-1">Speed</div>
                <div className="text-h1 text-green-neon">{race.speed} ft</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ability Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Ability Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(abilityScores).map(([ability, score]) => (
                <div key={ability} className="bg-gray-900 rounded-lg p-3 text-center">
                  <div className="text-gray-400 text-xs uppercase mb-1">
                    {ability.slice(0, 3)}
                  </div>
                  <div className="text-h2 text-white">{score}</div>
                  <div className="text-xs text-green-neon">
                    {calculateModifier(score) >= 0 ? '+' : ''}{calculateModifier(score)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Starting Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {equipment.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-small">
                  <span className="text-green-neon">•</span>
                  <span className="text-gray-300">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red/10 border border-red rounded-lg text-small text-red">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious} disabled={loading}>
          ← Previous
        </Button>
        <Button
          onClick={onCreateCharacter}
          disabled={loading || !name.trim()}
          size="lg"
        >
          {loading ? 'Creating Character...' : 'Create Character'}
        </Button>
      </div>
    </div>
  );
}
