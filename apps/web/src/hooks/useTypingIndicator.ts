'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface UseTypingIndicatorParams {
  onTypingStart: () => void;
  onTypingStop: () => void;
}

interface TypingUser {
  userId: string;
  username: string;
}

export function useTypingIndicator({ onTypingStart, onTypingStop }: UseTypingIndicatorParams) {
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle user typing in chat input
  const handleTyping = useCallback(() => {
    // Throttle: emit at most once every 500ms
    if (!throttleTimeoutRef.current) {
      if (!isTyping) {
        setIsTyping(true);
        onTypingStart();
      }

      throttleTimeoutRef.current = setTimeout(() => {
        throttleTimeoutRef.current = null;
      }, 500);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 3s
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 3000);
  }, [isTyping, onTypingStart, onTypingStop]);

  // Handle stop typing (e.g., when message is sent)
  const handleStopTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    if (throttleTimeoutRef.current) {
      clearTimeout(throttleTimeoutRef.current);
      throttleTimeoutRef.current = null;
    }
    setIsTyping(false);
    onTypingStop();
  }, [onTypingStop]);

  // Handle incoming typing:start events
  const handleTypingStartEvent = useCallback((data: { userId: string; username: string }) => {
    setTypingUsers((prev) => {
      const updated = new Map(prev);
      updated.set(data.userId, data);
      return updated;
    });

    // Auto-remove after 3s in case typing:stop is missed
    setTimeout(() => {
      setTypingUsers((prev) => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    }, 3500);
  }, []);

  // Handle incoming typing:stop events
  const handleTypingStopEvent = useCallback((data: { userId: string }) => {
    setTypingUsers((prev) => {
      const updated = new Map(prev);
      updated.delete(data.userId);
      return updated;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleTyping,
    handleStopTyping,
    typingUsers: Array.from(typingUsers.values()),
    handleTypingStartEvent,
    handleTypingStopEvent,
  };
}
