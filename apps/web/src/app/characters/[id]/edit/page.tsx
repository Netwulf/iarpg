'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label, Textarea, Card } from '@iarpg/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  background: string;
  notes: string | null;
}

export default function EditCharacterPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [name, setName] = useState('');
  const [background, setBackground] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCharacter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/characters/${params.id}`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch character');
      }

      const data = await response.json();
      setCharacter(data);
      setName(data.name);
      setBackground(data.background || '');
      setNotes(data.notes || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load character');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Name is required');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/characters/${params.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            name: name.trim(),
            background: background.trim(),
            notes: notes.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update character');
      }

      router.push(`/characters/${params.id}`);
    } catch (err: any) {
      alert('Failed to save changes: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Loading character...</p>
      </div>
    );
  }

  if (error || !character) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-400">{error || 'Character not found'}</p>
          <Button asChild className="mt-4">
            <Link href="/characters">Back to Characters</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/characters/${params.id}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Character
        </Link>
      </Button>

      <h1 className="text-4xl font-bold mb-8">Edit Character</h1>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Character name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background</Label>
            <Input
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="e.g., Soldier, Noble, Folk Hero"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your character..."
              rows={6}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/characters/${params.id}`)}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
