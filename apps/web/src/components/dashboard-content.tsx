'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button, Card, CardContent } from '@iarpg/ui';

export function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <div className="mb-8">
        <h1>Dashboard</h1>
        <p className="text-body text-gray-400 mt-2">
          Welcome back, {(session.user as any)?.name || session.user?.email}!
        </p>
        <p className="text-small text-gray-500 mt-1">
          Tier: <span className="capitalize text-green-neon">{(session.user as any)?.tier || 'free'}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-h4 font-semibold">Characters</h2>
            <p className="text-display font-bold text-green-neon mt-2">0</p>
            <p className="text-small text-gray-400 mt-1">Create your first character</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-h4 font-semibold">Active Tables</h2>
            <p className="text-display font-bold text-green-neon mt-2">0</p>
            <p className="text-small text-gray-400 mt-1">Join or create a table</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-h4 font-semibold">Campaigns</h2>
            <p className="text-display font-bold text-green-neon mt-2">0</p>
            <p className="text-small text-gray-400 mt-1">Start your adventure</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-h4 font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start">
              <div className="font-medium">Create Character</div>
              <div className="text-small text-gray-400">Build your D&D 5e character</div>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-start">
              <div className="font-medium">Browse Tables</div>
              <div className="text-small text-gray-400">Find an active game to join</div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
