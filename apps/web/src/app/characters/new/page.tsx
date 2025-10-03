'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@iarpg/ui';
import { QuickStartFlow } from '@/components/character-creation/quick-start-flow';
import { GuidedCreationFlow } from '@/components/character-creation/guided-creation-flow';

type CreationMode = 'select' | 'quick-start' | 'guided';

export default function CharacterCreationPage() {
  const router = useRouter();
  const [mode, setMode] = useState<CreationMode>('select');

  if (mode === 'quick-start') {
    return <QuickStartFlow onBack={() => setMode('select')} />;
  }

  if (mode === 'guided') {
    return <GuidedCreationFlow onBack={() => setMode('select')} />;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-display font-bold mb-4">
            Create Your <span className="text-green-neon glow-green">Character</span>
          </h1>
          <p className="text-body text-gray-400">
            Choose your creation method to begin your adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:border-green-neon transition-colors">
            <CardHeader>
              <CardTitle className="text-h2">Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-gray-400 mb-6">
                Choose from 6 pre-made characters and jump right into the game.
                Perfect for new players or quick sessions.
              </p>
              <ul className="space-y-2 mb-6 text-small text-gray-300">
                <li>• Fighter, Wizard, Rogue, Cleric, Ranger, Paladin</li>
                <li>• Pre-optimized ability scores</li>
                <li>• Starting equipment included</li>
                <li>• Ready to play in seconds</li>
              </ul>
              <Button
                onClick={() => setMode('quick-start')}
                className="w-full"
              >
                Quick Start
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-green-neon transition-colors">
            <CardHeader>
              <CardTitle className="text-h2">Guided Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-gray-400 mb-6">
                Build your character step-by-step with full customization.
                Choose your race, class, abilities, and equipment.
              </p>
              <ul className="space-y-2 mb-6 text-small text-gray-300">
                <li>• 9 races and 12 classes</li>
                <li>• Point Buy or Standard Array</li>
                <li>• Full equipment selection</li>
                <li>• Complete character customization</li>
              </ul>
              <Button
                onClick={() => setMode('guided')}
                variant="outline"
                className="w-full"
              >
                Guided Creation
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/characters')}
          >
            ← Back to Characters
          </Button>
        </div>
      </div>
    </div>
  );
}
