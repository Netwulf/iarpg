'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardContent } from '@iarpg/ui';
import Link from 'next/link';

export function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    characters: 0,
    activeTables: 0,
    totalTables: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch characters and tables in parallel
      const [charactersRes, tablesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/characters`, {
          credentials: 'include',
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables`, {
          credentials: 'include',
        }),
      ]);

      if (!charactersRes.ok || !tablesRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const characters = await charactersRes.json();
      const tablesData = await tablesRes.json();

      // Calculate stats
      const characterCount = Array.isArray(characters) ? characters.length : 0;
      const tables = tablesData.tables || [];
      const activeTables = tables.filter((t: any) => t.state === 'active').length;
      const totalTables = tables.length;

      setStats({
        characters: characterCount,
        activeTables,
        totalTables,
      });
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
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

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded text-red-400">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-1">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDashboardData}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-h4 font-semibold">Characters</h2>
            <p className="text-display font-bold text-green-neon mt-2">{stats.characters}</p>
            <p className="text-small text-gray-400 mt-1">
              {stats.characters === 0 ? 'Create your first character' : 'Total characters'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-h4 font-semibold">Active Tables</h2>
            <p className="text-display font-bold text-green-neon mt-2">{stats.activeTables}</p>
            <p className="text-small text-gray-400 mt-1">
              {stats.activeTables === 0 ? 'Join or create a table' : 'Currently active'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-h4 font-semibold">Campaigns</h2>
            <p className="text-display font-bold text-green-neon mt-2">{stats.totalTables}</p>
            <p className="text-small text-gray-400 mt-1">
              {stats.totalTables === 0 ? 'Start your adventure' : 'Total tables'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-h4 font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Link href="/characters/new">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-start">
                <div className="font-medium">Create Character</div>
                <div className="text-small text-gray-400">Build your D&D 5e character</div>
              </Button>
            </Link>
            <Link href="/tables/browse">
              <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-start">
                <div className="font-medium">Browse Tables</div>
                <div className="text-small text-gray-400">Find an active game to join</div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
