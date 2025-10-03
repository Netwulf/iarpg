'use client';

import { Card, Avatar, AvatarFallback, AvatarImage, Button } from '@iarpg/ui';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  avatarUrl?: string | null;
}

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
}

export function CharacterCard({ character, onDelete }: CharacterCardProps) {
  const initials = character.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="p-4 hover:border-green-neon transition-colors">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          {character.avatarUrl && <AvatarImage src={character.avatarUrl} />}
          <AvatarFallback className="bg-gray-800 text-green-neon text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold truncate">{character.name}</h3>
          <p className="text-sm text-gray-400">
            Level {character.level} {character.race} {character.class}
          </p>
          <div className="flex gap-3 mt-1">
            <span className="text-xs text-gray-400">
              HP: <span className="text-green-neon font-semibold">{character.hp}/{character.maxHp}</span>
            </span>
            <span className="text-xs text-gray-400">
              AC: <span className="text-blue-400 font-semibold">{character.ac}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button variant="ghost" size="sm" asChild className="flex-1">
          <Link href={`/characters/${character.id}`}>
            <Eye className="w-4 h-4 mr-1" />
            View
          </Link>
        </Button>
        <Button variant="ghost" size="sm" asChild className="flex-1">
          <Link href={`/characters/${character.id}/edit`}>
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(character.id)}
          className="flex-1 text-red-400 hover:text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
