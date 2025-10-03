'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, CardContent, Avatar, AvatarFallback, AvatarImage } from '@iarpg/ui';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { DeleteCharacterDialog } from '@/components/characters/delete-character-dialog';

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
  createdAt: string;
}

interface CharactersListClientProps {
  characters: Character[];
}

export function CharactersListClient({ characters: initialCharacters }: CharactersListClientProps) {
  const [characters, setCharacters] = useState(initialCharacters);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  const handleDeleteClick = (character: Character) => {
    setCharacterToDelete(character);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!characterToDelete) return;

    try {
      // TODO: Implement actual API call
      // await apiClient.delete(`/characters/${characterToDelete.id}`);

      // Optimistic update: remove from list
      setCharacters(characters.filter(c => c.id !== characterToDelete.id));
      setDeleteDialogOpen(false);
      setCharacterToDelete(null);

      // TODO: Show success toast
    } catch (error) {
      // TODO: Show error toast
      console.error('Failed to delete character:', error);
    }
  };

  if (characters.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1>My Characters</h1>
            <p className="text-body text-gray-400 mt-2">
              Create and manage your D&D 5e characters
            </p>
          </div>
        </div>

        <div className="text-center py-16">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
              <span className="text-4xl">🎲</span>
            </div>
            <h2 className="text-h2 mb-2">No Characters Yet</h2>
            <p className="text-body text-gray-400 mb-6">
              Create your first character to start playing D&D 5e
            </p>
          </div>
          <Link href="/characters/new">
            <Button size="lg">Create Your First Character</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1>My Characters</h1>
          <p className="text-body text-gray-400 mt-2">
            {characters.length} {characters.length === 1 ? 'character' : 'characters'}
          </p>
        </div>
        <Link href="/characters/new">
          <Button>Create Character</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => {
          const initials = character.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <Card key={character.id} className="hover:border-green-neon/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-16 w-16">
                    {character.avatarUrl && <AvatarImage src={character.avatarUrl} alt={character.name} />}
                    <AvatarFallback className="text-xl bg-gray-800 text-green-neon">
                      {initials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-h3 truncate mb-1">{character.name}</h3>
                    <p className="text-small text-gray-400">
                      Level {character.level} {character.race} {character.class}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-small">
                      <span className="text-red">
                        HP: {character.hp}/{character.maxHp}
                      </span>
                      <span className="text-blue">
                        AC: {character.ac}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link href={`/characters/${character.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <Link href={`/characters/${character.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(character)}
                    className="text-red hover:text-red hover:bg-red/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DeleteCharacterDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        characterName={characterToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
