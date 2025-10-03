'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@iarpg/ui';
import Link from 'next/link';
import { Clock, Globe, Lock, Users, Zap } from 'lucide-react';

type PlayStyle = 'sync' | 'async' | 'solo';
type Privacy = 'private' | 'public' | 'spectator';

interface FormData {
  name: string;
  description: string;
  playStyle: PlayStyle;
  privacy: Privacy;
  maxPlayers: number;
  schedule: string;
  tags: string;
}

export function TableCreateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    playStyle: 'async',
    privacy: 'private',
    maxPlayers: 6,
    schedule: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual API call
      // const response = await apiClient.post('/tables', {
      //   ...formData,
      //   tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      // });

      // Mock response
      const response = {
        id: 'table-123',
        inviteCode: 'ABC123',
      };

      // Redirect to table page
      router.push(`/tables/${response.id}`);
    } catch (err) {
      setError('Failed to create table. Please try again.');
      setLoading(false);
    }
  };

  const playStyleOptions = [
    {
      value: 'sync' as PlayStyle,
      label: 'Live Sessions',
      description: 'Real-time text sessions with live chat',
      icon: Zap,
    },
    {
      value: 'async' as PlayStyle,
      label: 'Play-by-Post',
      description: 'Flexible timing, respond when you can',
      icon: Clock,
    },
    {
      value: 'solo' as PlayStyle,
      label: 'Solo Play',
      description: 'AI DM mode, single player adventure',
      icon: Users,
    },
  ];

  const privacyOptions = [
    {
      value: 'private' as Privacy,
      label: 'Private',
      description: 'Invite-only, hidden from discovery',
      icon: Lock,
    },
    {
      value: 'public' as Privacy,
      label: 'Public',
      description: 'Visible in browse, anyone can join',
      icon: Globe,
    },
    {
      value: 'spectator' as Privacy,
      label: 'Spectator Mode',
      description: 'Public + allows non-player viewers',
      icon: Users,
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="The Lost Mines of Phandelver"
                maxLength={50}
                required
              />
              <p className="text-xs text-gray-500">{formData.name.length}/50 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A classic D&D adventure for levels 1-5..."
                className="w-full min-h-[100px] bg-gray-900 border border-gray-700 rounded-md p-3 text-white text-small resize-y"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
            </div>
          </CardContent>
        </Card>

        {/* Play Style */}
        <Card>
          <CardHeader>
            <CardTitle>Play Style *</CardTitle>
            <p className="text-small text-gray-400 mt-2">
              Choose how you want to run your game
            </p>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.playStyle}
              onValueChange={(value) => setFormData({ ...formData, playStyle: value as PlayStyle })}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {playStyleOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.playStyle === option.value;

                return (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-green-neon bg-green-neon/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-green-neon' : 'text-gray-400'}`} />
                        <span className="font-semibold">{option.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings *</CardTitle>
            <p className="text-small text-gray-400 mt-2">
              Control who can find and join your table
            </p>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.privacy}
              onValueChange={(value) => setFormData({ ...formData, privacy: value as Privacy })}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {privacyOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.privacy === option.value;

                return (
                  <label
                    key={option.value}
                    className={`relative flex cursor-pointer rounded-lg border-2 p-4 transition-all ${
                      isSelected
                        ? 'border-green-neon bg-green-neon/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-green-neon' : 'text-gray-400'}`} />
                        <span className="font-semibold">{option.label}</span>
                      </div>
                      <p className="text-xs text-gray-400">{option.description}</p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPlayers">Max Players</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  min={2}
                  max={8}
                  value={formData.maxPlayers}
                  onChange={(e) => setFormData({ ...formData, maxPlayers: parseInt(e.target.value) || 6 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule (Optional)</Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="e.g., Tuesdays 8pm EST"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="homebrew, roleplay-heavy, combat (comma-separated)"
              />
              <p className="text-xs text-gray-500">Max 5 tags, 20 characters each</p>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red/10 border border-red rounded-lg text-small text-red">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button type="button" variant="outline" className="w-full" disabled={loading}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" className="flex-1" disabled={loading || formData.name.length < 3}>
            {loading ? 'Creating...' : 'Create Table'}
          </Button>
        </div>
      </div>
    </form>
  );
}
