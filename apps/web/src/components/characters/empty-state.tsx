'use client';

import { Button } from '@iarpg/ui';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-6xl mb-4">🎲</div>
      <h2 className="text-2xl font-bold mb-2">No characters yet</h2>
      <p className="text-gray-400 mb-6 max-w-md">
        Create your first character to start your adventure in IA-RPG
      </p>
      <Button size="lg" asChild>
        <Link href="/characters/new">Create Character</Link>
      </Button>
    </div>
  );
}
