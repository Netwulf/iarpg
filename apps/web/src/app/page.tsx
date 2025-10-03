'use client';

import Link from 'next/link';
import { Button } from '@iarpg/ui';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-24">
      <div className="text-center max-w-4xl">
        <h1 className="text-display font-bold mb-6">
          <span className="text-green-neon glow-green">IA</span>
          <span className="text-white">-RPG</span>
        </h1>
        <p className="text-h2 text-gray-300 mb-8">
          AI-Powered D&D 5e Platform
        </p>
        <p className="text-body text-gray-400 mb-12 max-w-2xl mx-auto">
          Experience Dungeons & Dragons like never before with AI-powered game master assistance,
          real-time collaboration, and immersive storytelling. Create characters, join tables,
          and embark on epic adventures.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="text-h4">
              Get Started
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="text-h4">
              Login
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="text-h3 font-semibold text-green-neon mb-2">AI Game Master</h3>
            <p className="text-small text-gray-400">
              Let our AI assist with rules, encounters, and narrative generation for seamless gameplay.
            </p>
          </div>
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="text-h3 font-semibold text-green-neon mb-2">Real-time Play</h3>
            <p className="text-small text-gray-400">
              Synchronous sessions with live dice rolling, combat tracking, and instant updates.
            </p>
          </div>
          <div className="border border-gray-800 rounded-lg p-6 bg-gray-900/50">
            <h3 className="text-h3 font-semibold text-green-neon mb-2">Character Builder</h3>
            <p className="text-small text-gray-400">
              Create detailed D&D 5e characters with guided workflows and AI-powered backstories.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
