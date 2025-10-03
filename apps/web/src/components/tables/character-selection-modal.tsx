'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
  Card,
  CardContent,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@iarpg/ui';
import Link from 'next/link';
import { Plus } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  avatarUrl?: string | null;
}

interface Table {
  id: string;
  name: string;
  description: string;
  playStyle: string;
  playerCount: number;
  maxPlayers: number;
}

interface CharacterSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table;
}

export function CharacterSelectionModal({
  open,
  onOpenChange,
  table,
}: CharacterSelectionModalProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchCharacters();
    }
  }, [open]);

  const fetchCharacters = async () => {
    try {
      // TODO: Implement actual API call
      // const response = await apiClient.get('/characters');
      // setCharacters(response);

      // Mock empty for now
      setCharacters([]);
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    }
  };

  const handleJoin = async () => {
    if (!selectedCharacterId) return;

    setLoading(true);
    try {
      // TODO: Implement actual API call
      // await apiClient.post(`/tables/${table.id}/join`, { characterId: selectedCharacterId });

      // Redirect to table
      router.push(`/tables/${table.id}`);
    } catch (error) {
      console.error('Failed to join table:', error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select a Character</DialogTitle>
          <p className="text-small text-gray-400 mt-2">
            Choose which character you&apos;ll play in <span className="text-white">{table.name}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {characters.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
                <span className="text-3xl">🎭</span>
              </div>
              <p className="text-body text-gray-400 mb-6">
                You don&apos;t have any characters yet
              </p>
              <Link href={`/characters/new?returnTo=/tables/${table.id}`}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Character
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                {characters.map((character) => {
                  const initials = character.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  const isSelected = selectedCharacterId === character.id;

                  return (
                    <Card
                      key={character.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? 'border-green-neon bg-green-neon/10' : 'hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedCharacterId(character.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            {character.avatarUrl && <AvatarImage src={character.avatarUrl} alt={character.name} />}
                            <AvatarFallback className="bg-gray-800 text-green-neon">
                              {initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-small font-semibold truncate">{character.name}</h4>
                            <p className="text-xs text-gray-400">
                              Level {character.level} {character.race} {character.class}
                            </p>
                          </div>

                          {isSelected && (
                            <div className="w-6 h-6 rounded-full bg-green-neon flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <Link href={`/characters/new?returnTo=/tables/${table.id}`}>
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Character
                  </Button>
                </Link>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleJoin} disabled={!selectedCharacterId || loading}>
                    {loading ? 'Joining...' : 'Join Table'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
