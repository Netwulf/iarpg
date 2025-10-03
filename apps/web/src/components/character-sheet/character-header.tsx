'use client';

import { Button, Card, CardContent, Avatar, AvatarFallback, AvatarImage } from '@iarpg/ui';
import Link from 'next/link';

interface CharacterHeaderProps {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  avatarUrl?: string | null;
  createdAt: string;
}

export function CharacterHeader({
  id,
  name,
  race,
  class: className,
  level,
  avatarUrl,
  createdAt,
}: CharacterHeaderProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const createdDate = new Date(createdAt).toLocaleDateString();

  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-6">
        <Avatar className="h-20 w-20">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={name} />}
          <AvatarFallback className="text-2xl bg-gray-800 text-green-neon">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-h1 mb-2">{name}</h1>
          <p className="text-body text-gray-400">
            Level {level} {race} {className}
          </p>
          <p className="text-small text-gray-500 mt-1">
            Created {createdDate}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href={`/characters/${id}/edit`}>
            <Button variant="outline">Edit Character</Button>
          </Link>
          <Link href="/characters">
            <Button variant="ghost">Back to Characters</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
