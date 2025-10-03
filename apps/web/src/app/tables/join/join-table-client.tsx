'use client';

import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Label } from '@iarpg/ui';
import { Ticket } from 'lucide-react';
import { CharacterSelectionModal } from '@/components/tables/character-selection-modal';

interface Table {
  id: string;
  name: string;
  description: string;
  playStyle: string;
  privacy: string;
  playerCount: number;
  maxPlayers: number;
}

export function JoinTableClient() {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [table, setTable] = useState<Table | null>(null);

  const handleInviteCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setInviteCode(value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (inviteCode.length !== 6) {
      setError('Invite code must be 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual API call
      // const response = await apiClient.get(`/tables/by-code/${inviteCode}`);
      // setTable(response);

      // Mock error for now
      throw new Error('Table not found');
    } catch (err: any) {
      setError(err.message || 'Invalid invite code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-900 flex items-center justify-center">
          <Ticket className="w-10 h-10 text-green-neon" />
        </div>
        <h1>Join a Table</h1>
        <p className="text-body text-gray-400 mt-2">
          Enter your 6-character invite code to join a game
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Code</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">6-Character Code</Label>
              <Input
                id="inviteCode"
                value={inviteCode}
                onChange={handleInviteCodeChange}
                placeholder="ABC123"
                className="text-center text-2xl font-mono tracking-wider uppercase"
                maxLength={6}
                required
              />
              <p className="text-xs text-gray-500 text-center">
                Enter the code shared by the table owner
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red/10 border border-red rounded-lg text-small text-red">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || inviteCode.length !== 6}
            >
              {loading ? 'Validating...' : 'Find Table'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-small text-gray-400 mb-4">
              Don&apos;t have an invite code?
            </p>
            <a href="/tables/browse" className="text-small text-green-neon hover:underline">
              Browse Public Tables →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Character Selection Modal */}
      {table && (
        <CharacterSelectionModal
          open={!!table}
          onOpenChange={() => setTable(null)}
          table={table}
        />
      )}
    </div>
  );
}
