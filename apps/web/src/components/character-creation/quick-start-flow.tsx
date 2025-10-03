'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Dialog, DialogContent, DialogHeader, DialogTitle } from '@iarpg/ui';
import { PRE_MADE_CHARACTERS, calculateModifier, type PreMadeCharacter } from '@/lib/character-data';
import { apiClient } from '@/lib/api-client';

interface QuickStartFlowProps {
  onBack: () => void;
}

interface CharacterResponse {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

export function QuickStartFlow({ onBack }: QuickStartFlowProps) {
  const router = useRouter();
  const [selectedCharacter, setSelectedCharacter] = useState<PreMadeCharacter | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectCharacter = (character: PreMadeCharacter) => {
    setSelectedCharacter(character);
    setCharacterName(character.name);
  };

  const handleCreateCharacter = async () => {
    if (!selectedCharacter || !characterName.trim()) {
      setError('Please enter a character name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post<CharacterResponse>('/characters', {
        name: characterName,
        race: selectedCharacter.race,
        class: selectedCharacter.class,
        level: selectedCharacter.level,
        abilityScores: selectedCharacter.abilityScores,
        equipment: selectedCharacter.equipment,
      });

      router.push(`/characters/${response.id}`);
    } catch (err) {
      setError('Failed to create character. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Selection
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">
            <span className="text-green-neon glow-green">Quick Start</span> Characters
          </h1>
          <p className="text-body text-gray-400">
            Choose a pre-made character and customize the name
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRE_MADE_CHARACTERS.map((character) => (
            <Card
              key={character.id}
              className={`cursor-pointer transition-all ${
                selectedCharacter?.id === character.id
                  ? 'border-green-neon border-2'
                  : 'hover:border-gray-700'
              }`}
              onClick={() => handleSelectCharacter(character)}
            >
              <CardHeader>
                <CardTitle className="text-h3">
                  {character.class}
                </CardTitle>
                <p className="text-small text-gray-400">
                  {character.race} • Level {character.level}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-small text-gray-300 mb-4">
                  {character.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="text-xs text-gray-400 font-mono">
                    <div className="grid grid-cols-3 gap-2">
                      <div>STR {character.abilityScores.strength} ({calculateModifier(character.abilityScores.strength) >= 0 ? '+' : ''}{calculateModifier(character.abilityScores.strength)})</div>
                      <div>DEX {character.abilityScores.dexterity} ({calculateModifier(character.abilityScores.dexterity) >= 0 ? '+' : ''}{calculateModifier(character.abilityScores.dexterity)})</div>
                      <div>CON {character.abilityScores.constitution} ({calculateModifier(character.abilityScores.constitution) >= 0 ? '+' : ''}{calculateModifier(character.abilityScores.constitution)})</div>
                      <div>INT {character.abilityScores.intelligence} ({calculateModifier(character.abilityScores.intelligence) >= 0 ? '+' : ''}{calculateModifier(character.abilityScores.intelligence)})</div>
                      <div>WIS {character.abilityScores.wisdom} ({calculateModifier(character.abilityScores.wisdom) >= 0 ? '+' : ''}{calculateModifier(character.abilityScores.wisdom)})</div>
                      <div>CHA {character.abilityScores.charisma} ({calculateModifier(character.abilityScores.charisma) >= 0 ? '+' : ''}{calculateModifier(character.abilityScores.charisma)})</div>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <strong>Equipment:</strong> {character.equipment.slice(0, 2).join(', ')}
                  {character.equipment.length > 2 && '...'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedCharacter && (
          <Dialog open={!!selectedCharacter} onOpenChange={() => setSelectedCharacter(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Name Your {selectedCharacter.class}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Character Name</Label>
                  <Input
                    id="name"
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    placeholder="Enter character name"
                    className="mt-2"
                  />
                </div>

                {error && (
                  <div className="text-small text-red bg-red/10 border border-red rounded-md p-3">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCharacter(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCharacter}
                    disabled={loading || !characterName.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Creating...' : 'Create Character'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
