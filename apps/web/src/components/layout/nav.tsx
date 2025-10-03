'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@iarpg/ui';
import { cn } from '@iarpg/ui';

interface NavItem {
  href: string;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/tables', label: 'Tables' },
  { href: '/characters', label: 'Characters' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-h3 font-bold">
              <span className="text-green-neon glow-green">IA</span>
              <span>-RPG</span>
            </Link>

            <div className="hidden md:flex gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'text-body transition-colors hover:text-green-neon',
                    pathname === item.href ? 'text-green-neon' : 'text-gray-400'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profile
              </Button>
            </Link>
            <form action="/api/auth/signout" method="POST">
              <Button variant="outline" size="sm" type="submit">
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
