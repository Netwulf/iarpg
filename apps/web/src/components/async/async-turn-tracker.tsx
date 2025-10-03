'use client';

import { useEffect, useState } from 'react';
import { Button } from '@iarpg/ui';
import { useSocketContext } from '@/contexts/SocketContext';

interface AsyncTurn {
  id: string;
  tableId: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  deadline: string;
  skipped: boolean;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface AsyncTurnTrackerProps {
  tableId: string;
  isDM: boolean;
  currentUserId: string;
}

export function AsyncTurnTracker({
  tableId,
  isDM,
  currentUserId,
}: AsyncTurnTrackerProps) {
  const { socket } = useSocketContext();
  const [currentTurn, setCurrentTurn] = useState<AsyncTurn | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    fetchCurrentTurn();

    if (!socket) return;

    socket.on('async:turn-started', ({ turn }: { turn: AsyncTurn }) => {
      setCurrentTurn(turn);
    });

    socket.on('async:turn-changed', ({ newTurn }: { newTurn: AsyncTurn }) => {
      setCurrentTurn(newTurn);
    });

    return () => {
      socket.off('async:turn-started');
      socket.off('async:turn-changed');
    };
  }, [socket, tableId]);

  useEffect(() => {
    if (!currentTurn) return;

    const updateTimeRemaining = () => {
      const deadline = new Date(currentTurn.deadline);
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Deadline passed');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    // Update immediately
    updateTimeRemaining();

    // Update every minute
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [currentTurn]);

  const fetchCurrentTurn = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/async/turn`,
        {
          credentials: 'include',
        }
      );

      if (response.ok) {
        const { turn } = await response.json();
        setCurrentTurn(turn);
      }
    } catch (error) {
      console.error('Failed to fetch current turn:', error);
    }
  };

  const handleEndTurn = async () => {
    if (!currentTurn) return;

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/async/turns/${currentTurn.id}/end`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
    } catch (error) {
      console.error('Failed to end turn:', error);
      alert('Failed to end turn');
    }
  };

  if (!currentTurn) {
    return (
      <div className="p-4 border-b border-gray-800">
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg">
          <p className="text-sm text-gray-400">No active turn</p>
        </div>
      </div>
    );
  }

  const isYourTurn = currentTurn.userId === currentUserId;

  return (
    <div className="p-4 border-b border-gray-800">
      {isYourTurn ? (
        <div className="bg-green-500/20 border border-green-500 p-3 rounded-lg">
          <p className="font-bold text-green-400">🎯 Your Turn!</p>
          <p className="text-sm text-gray-400">Deadline: {timeRemaining}</p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 p-3 rounded-lg">
          <p className="text-sm text-gray-400">
            Waiting for:{' '}
            <span className="font-medium text-white">
              {currentTurn.user.username}
            </span>
          </p>
          <p className="text-xs text-gray-400">Deadline: {timeRemaining}</p>
        </div>
      )}

      {isDM && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEndTurn}
          className="mt-2 w-full"
        >
          End Turn & Advance
        </Button>
      )}
    </div>
  );
}
