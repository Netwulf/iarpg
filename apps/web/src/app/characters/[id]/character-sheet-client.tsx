'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, CardHeader, CardTitle, CardContent } from '@iarpg/ui';
import { CharacterHeader, CoreStats, AbilityScores, SavingThrows, Skills } from '@/components/character-sheet';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  hp: number;
  maxHp: number;
  ac: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
  proficiencies: string[];
  equipment: string[];
  background: string;
  notes?: string;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CharacterSheetClientProps {
  character: Character;
}

export function CharacterSheetClient({ character }: CharacterSheetClientProps) {
  const [activeTab, setActiveTab] = useState('stats');

  return (
    <div className="space-y-6">
      {/* Character Header */}
      <CharacterHeader
        id={character.id}
        name={character.name}
        race={character.race}
        class={character.class}
        level={character.level}
        avatarUrl={character.avatarUrl}
        createdAt={character.createdAt}
      />

      {/* Core Stats */}
      <CoreStats
        currentHP={character.hp}
        maxHP={character.maxHp}
        ac={character.ac}
        initiative={character.initiative}
        speed={character.speed}
        proficiencyBonus={character.proficiencyBonus}
      />

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="combat">Combat</TabsTrigger>
          <TabsTrigger value="spells">Spells</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6 mt-6">
          {/* Ability Scores */}
          <div>
            <h2 className="text-h2 mb-4">Ability Scores</h2>
            <AbilityScores
              strength={character.strength}
              dexterity={character.dexterity}
              constitution={character.constitution}
              intelligence={character.intelligence}
              wisdom={character.wisdom}
              charisma={character.charisma}
            />
          </div>

          {/* Saving Throws and Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SavingThrows
              strength={character.strength}
              dexterity={character.dexterity}
              constitution={character.constitution}
              intelligence={character.intelligence}
              wisdom={character.wisdom}
              charisma={character.charisma}
              proficiencies={character.proficiencies}
              proficiencyBonus={character.proficiencyBonus}
            />
            <Skills
              strength={character.strength}
              dexterity={character.dexterity}
              constitution={character.constitution}
              intelligence={character.intelligence}
              wisdom={character.wisdom}
              charisma={character.charisma}
              proficiencies={character.proficiencies}
              proficiencyBonus={character.proficiencyBonus}
            />
          </div>
        </TabsContent>

        {/* Combat Tab */}
        <TabsContent value="combat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Combat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center py-8">
                Combat features will be implemented in Story 5.3
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spells Tab */}
        <TabsContent value="spells" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Spells</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center py-8">
                {['Wizard', 'Sorcerer', 'Warlock', 'Cleric', 'Druid', 'Bard', 'Paladin', 'Ranger'].includes(
                  character.class
                )
                  ? 'Spellcasting will be implemented in a future story'
                  : `${character.class}s don't use spells`}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipment & Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h3 className="text-h3 mb-3">Starting Equipment</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {character.equipment.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 p-2 rounded bg-gray-900">
                      <span className="text-green-neon">•</span>
                      <span className="text-small">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Character Background & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-h3 mb-2">Background</h3>
                <p className="text-small text-gray-300">
                  {character.background || 'No background provided'}
                </p>
              </div>
              <div>
                <h3 className="text-h3 mb-2">Notes</h3>
                <p className="text-small text-gray-300">
                  {character.notes || 'No notes yet'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Racial & Class Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 text-center py-8">
                Features will be implemented in a future story
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
