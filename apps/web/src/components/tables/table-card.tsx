'use client';

import Link from 'next/link';
import { Button, Card, CardContent } from '@iarpg/ui';
import { Users, Clock, Zap } from 'lucide-react';

interface Table {
  id: string;
  name: string;
  description: string;
  playStyle: 'sync' | 'async' | 'solo';
  playerCount: number;
  maxPlayers: number;
  tags: string[];
  lastActivityAt: string;
}

interface TableCardProps {
  table: Table;
}

export function TableCard({ table }: TableCardProps) {
  const playStyleConfig = {
    sync: { label: 'Live', icon: Zap, color: 'text-yellow' },
    async: { label: 'Async', icon: Clock, color: 'text-blue' },
    solo: { label: 'Solo', icon: Users, color: 'text-purple' },
  };

  const config = playStyleConfig[table.playStyle];
  const Icon = config.icon;

  // Format last activity
  const formatLastActivity = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Active ${diffMins}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    return `Active ${diffDays}d ago`;
  };

  // Truncate description
  const truncatedDesc = table.description.length > 150
    ? table.description.slice(0, 147) + '...'
    : table.description;

  return (
    <Card className="hover:border-green-neon/50 transition-colors h-full flex flex-col">
      <CardContent className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-h3 flex-1">{table.name}</h3>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-gray-900 ${config.color} shrink-0`}>
              <Icon className="w-3 h-3" />
              <span className="text-xs font-medium">{config.label}</span>
            </div>
          </div>
          <p className="text-small text-gray-400 line-clamp-2">
            {truncatedDesc || 'No description provided'}
          </p>
        </div>

        {/* Tags */}
        {table.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {table.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-full bg-gray-900 text-xs text-gray-300"
              >
                {tag}
              </span>
            ))}
            {table.tags.length > 3 && (
              <span className="px-2 py-1 rounded-full bg-gray-900 text-xs text-gray-500">
                +{table.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-small text-gray-400 mb-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {table.playerCount}/{table.maxPlayers} players
            </span>
            <span>{formatLastActivity(table.lastActivityAt)}</span>
          </div>

          <div className="flex gap-2">
            <Link href={`/tables/${table.id}`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                View
              </Button>
            </Link>
            <Button className="flex-1" size="sm">
              Join Table
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
