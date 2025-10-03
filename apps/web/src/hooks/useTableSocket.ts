'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';

interface Message {
  id: string;
  tableId: string;
  userId: string;
  content: string;
  type: 'text' | 'system' | 'roll';
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface UseTableSocketParams {
  tableId: string;
  onMessageReceived: (message: Message) => void;
  onMemberJoined?: (data: { username: string }) => void;
  onMemberLeft?: (data: { username: string }) => void;
  onTypingStart?: (data: { userId: string; username: string }) => void;
  onTypingStop?: (data: { userId: string }) => void;
  onPresenceUpdate?: (data: { userId: string; status: string }) => void;
  onDiceRoll?: (roll: any) => void;
  onCombatStarted?: (data: { encounter: any }) => void;
  onCombatTurnChanged?: (data: { encounter: any }) => void;
  onCombatHPUpdated?: (data: { encounter: any }) => void;
  onCombatEnded?: (data: { encounterId: string }) => void;
  onAsyncTurnStarted?: (data: { turn: any }) => void;
  onAsyncTurnChanged?: (data: { newTurn: any }) => void;
}

export function useTableSocket({
  tableId,
  onMessageReceived,
  onMemberJoined,
  onMemberLeft,
  onTypingStart,
  onTypingStop,
  onPresenceUpdate,
  onDiceRoll,
  onCombatStarted,
  onCombatTurnChanged,
  onCombatHPUpdated,
  onCombatEnded,
  onAsyncTurnStarted,
  onAsyncTurnChanged,
}: UseTableSocketParams) {
  const { socket, connected } = useSocket();

  // Join table room and emit user:online
  useEffect(() => {
    if (!socket || !connected) return;

    console.log(`Joining table room: ${tableId}`);
    socket.emit('table:join', { tableId });
    socket.emit('user:online');

    return () => {
      console.log(`Leaving table room: ${tableId}`);
      socket.emit('table:leave', { tableId });
    };
  }, [socket, connected, tableId]);

  // Set up event listeners
  useEffect(() => {
    if (!socket || !connected) return;

    // Message events
    socket.on('message:new', onMessageReceived);

    // Member events
    if (onMemberJoined) {
      socket.on('table:member-joined', onMemberJoined);
    }
    if (onMemberLeft) {
      socket.on('table:member-left', onMemberLeft);
    }

    // Typing events
    if (onTypingStart) {
      socket.on('typing:start', onTypingStart);
    }
    if (onTypingStop) {
      socket.on('typing:stop', onTypingStop);
    }

    // Presence events
    if (onPresenceUpdate) {
      socket.on('presence:update', onPresenceUpdate);
    }

    // Dice roll events
    if (onDiceRoll) {
      socket.on('roll:new', onDiceRoll);
    }

    // Combat events
    if (onCombatStarted) {
      socket.on('combat:started', onCombatStarted);
    }
    if (onCombatTurnChanged) {
      socket.on('combat:turn-changed', onCombatTurnChanged);
    }
    if (onCombatHPUpdated) {
      socket.on('combat:hp-updated', onCombatHPUpdated);
    }
    if (onCombatEnded) {
      socket.on('combat:ended', onCombatEnded);
    }

    // Async turn events
    if (onAsyncTurnStarted) {
      socket.on('async:turn-started', onAsyncTurnStarted);
    }
    if (onAsyncTurnChanged) {
      socket.on('async:turn-changed', onAsyncTurnChanged);
    }

    // Cleanup listeners
    return () => {
      socket.off('message:new', onMessageReceived);
      socket.off('table:member-joined');
      socket.off('table:member-left');
      socket.off('typing:start');
      socket.off('typing:stop');
      socket.off('presence:update');
      socket.off('roll:new');
      socket.off('combat:started');
      socket.off('combat:turn-changed');
      socket.off('combat:hp-updated');
      socket.off('combat:ended');
      socket.off('async:turn-started');
      socket.off('async:turn-changed');
    };
  }, [socket, connected, onMessageReceived, onMemberJoined, onMemberLeft, onTypingStart, onTypingStop, onPresenceUpdate, onDiceRoll, onCombatStarted, onCombatTurnChanged, onCombatHPUpdated, onCombatEnded, onAsyncTurnStarted, onAsyncTurnChanged]);

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !connected) return;

      const event = isTyping ? 'typing:start' : 'typing:stop';
      socket.emit(event, { tableId });
    },
    [socket, connected, tableId]
  );

  return {
    connected,
    sendTyping,
  };
}
