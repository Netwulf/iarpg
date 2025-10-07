'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from '@iarpg/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <span className="text-green-neon glow-green">IA</span>-RPG Login
          </CardTitle>
          <p className="text-small text-gray-400 mt-2">
            Play D&D 5e with AI-powered assistance
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-red/10 border border-red px-3 py-2">
                <p className="text-small text-red">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              className="w-full"
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              onClick={() => signIn('discord', { callbackUrl: '/dashboard' })}
              className="w-full"
            >
              Continue with Discord
            </Button>
          </div>

          <p className="text-center text-small text-gray-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-green-neon hover:text-green-dim">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
