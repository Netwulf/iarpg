'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@iarpg/ui';

interface TableMember {
  userId: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface TurnOrderSidebarProps {
  tableId: string;
  turnOrder: string[];
  currentTurnIndex: number;
  members: TableMember[];
}

export function TurnOrderSidebar({
  tableId,
  turnOrder,
  currentTurnIndex,
  members,
}: TurnOrderSidebarProps) {
  return (
    <div className="w-64 border-r border-gray-800 p-4 bg-gray-950">
      <h3 className="text-lg font-bold mb-4 text-white">Turn Order</h3>

      <div className="space-y-2">
        {turnOrder.map((userId, index) => {
          const member = members.find((m) => m.userId === userId);
          if (!member) return null;

          const isCurrent = index === currentTurnIndex;
          const isNext = index === (currentTurnIndex + 1) % turnOrder.length;

          return (
            <div
              key={userId}
              className={`p-2 rounded flex items-center gap-2 transition-colors ${
                isCurrent
                  ? 'bg-green-500/20 border border-green-500'
                  : isNext
                  ? 'bg-blue-500/10 border border-blue-500/30'
                  : 'bg-gray-900 border border-gray-800'
              }`}
            >
              {isCurrent && <span className="text-green-400">►</span>}
              {isNext && <span className="text-blue-400">○</span>}
              {!isCurrent && !isNext && <span className="text-gray-600">○</span>}

              <Avatar className="h-8 w-8">
                <AvatarImage src={member.user.avatar || undefined} />
                <AvatarFallback>
                  {member.user.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <p className="font-medium text-sm text-white">
                  {member.user.username}
                </p>
                {isCurrent && (
                  <p className="text-xs text-green-400">Current Turn</p>
                )}
                {isNext && <p className="text-xs text-blue-400">Next Up</p>}
              </div>
            </div>
          );
        })}
      </div>

      {turnOrder.length === 0 && (
        <div className="text-sm text-gray-400 mt-4">
          <p>No turn order set.</p>
          <p className="text-xs mt-1">DM needs to set the turn order.</p>
        </div>
      )}
    </div>
  );
}
