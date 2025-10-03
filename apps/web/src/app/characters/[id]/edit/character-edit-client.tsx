'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@iarpg/ui';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  background: string;
  notes?: string;
  avatarUrl?: string | null;
}

interface CharacterEditClientProps {
  character: Character;
}

export function CharacterEditClient({ character }: CharacterEditClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: character.name,
    background: character.background,
    notes: character.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual API call
      // await apiClient.patch(`/characters/${character.id}`, formData);

      // Redirect to character sheet
      router.push(`/characters/${character.id}`);
    } catch (err) {
      setError('Failed to update character. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href={`/characters/${character.id}`}>
          <Button variant="ghost">← Back to Character Sheet</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Character</CardTitle>
          <p className="text-small text-gray-400 mt-2">
            Level {character.level} {character.race} {character.class}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Character Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Character Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter character name"
                required
              />
            </div>

            {/* Background */}
            <div className="space-y-2">
              <Label htmlFor="background">Background</Label>
              <Input
                id="background"
                value={formData.background}
                onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                placeholder="e.g., Soldier, Sage, Folk Hero"
              />
              <p className="text-xs text-gray-500">
                Your character&apos;s background story or profession
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes about your character's personality, goals, or other details..."
                className="w-full min-h-[120px] bg-gray-900 border border-gray-700 rounded-md p-3 text-white text-small resize-y"
              />
            </div>

            {/* Avatar Upload Placeholder */}
            <div className="space-y-2">
              <Label>Character Avatar</Label>
              <div className="border-2 border-dashed border-gray-700 rounded-md p-6 text-center">
                <p className="text-small text-gray-400 mb-2">Avatar upload coming soon</p>
                <p className="text-xs text-gray-500">This feature will be implemented in a future update</p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red/10 border border-red rounded-lg text-small text-red">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <Link href={`/characters/${character.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={loading || !formData.name.trim()}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
