'use client';

import { requireAuth } from '@/lib/auth-helpers';
import Link from 'next/link';
import { Button } from '@iarpg/ui';
import { apiClient } from '@/lib/api-client';
import { CharacterSheetClient } from './character-sheet-client';

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

async function getCharacter(id: string): Promise<Character | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/characters/${id}`,
      {
        credentials: 'include',
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    const character = await response.json();
    return character;
  } catch (error) {
    console.error('Error fetching character:', error);
    return null;
  }
}

export default async function CharacterPage({ params }: { params: { id: string } }) {
  const session = await requireAuth();
  const character = await getCharacter(params.id);

  if (!character) {
    return (
      <div className="text-center py-16">
        <h1 className="text-h1 mb-4">Character Not Found</h1>
        <p className="text-body text-gray-400 mb-6">
          This character doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
        <Link href="/characters">
          <Button>Back to Characters</Button>
        </Link>
      </div>
    );
  }

  return <CharacterSheetClient character={character} />;
}
