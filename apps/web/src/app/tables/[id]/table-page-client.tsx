'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Textarea, Avatar, AvatarFallback, AvatarImage, Tabs, TabsList, TabsTrigger, TabsContent } from '@iarpg/ui';
import { Users, Copy, Check } from 'lucide-react';
import { useTableSocket } from '@/hooks/useTableSocket';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { TypingIndicator } from '@/components/TypingIndicator';
import { DiceRoller } from '@/components/dice/dice-roller';
import { DiceResult } from '@/components/dice/dice-result';
import { CombatTracker } from '@/components/combat/combat-tracker';
import { StartCombatModal } from '@/components/combat/start-combat-modal';
import { AIAssistant } from '@/components/ai/ai-assistant';
import { CombatEncounter } from '@iarpg/shared';
import { AsyncTurnTracker } from '@/components/async/async-turn-tracker';
import { TurnOrderSidebar } from '@/components/async/turn-order-sidebar';

interface Message {
  id: string;
  tableId: string;
  userId: string;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
}

interface TableMember {
  id: string;
  userId: string;
  characterId: string | null;
  role: string;
  user: {
    id: string;
    username: string;
    avatar: string | null;
  };
  character: {
    id: string;
    name: string;
    race: string;
    class: string;
    level: number;
  } | null;
}

interface Table {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  playStyle: string;
  privacy: string;
  inviteCode: string;
  maxPlayers: number;
  tags: string[];
  lastActivityAt: string;
  members: TableMember[];
  turnDeadlineHours?: number;
  currentTurnIndex: number;
  turnOrder: string[];
}

interface TablePageClientProps {
  tableId: string;
}

export function TablePageClient({ tableId }: TablePageClientProps) {
  const [table, setTable] = useState<Table | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [error, setError] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [diceRolls, setDiceRolls] = useState<any[]>([]);
  const [combatEncounter, setCombatEncounter] = useState<CombatEncounter | null>(null);
  const [showStartCombatModal, setShowStartCombatModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [currentTurn, setCurrentTurn] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle incoming Socket.io messages
  const handleMessageReceived = useCallback((message: Message) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  // Handle incoming dice rolls
  const handleDiceRoll = useCallback((roll: any) => {
    setDiceRolls((prev) => [roll, ...prev].slice(0, 20)); // Keep last 20 rolls
  }, []);

  // Handle combat events
  const handleCombatStarted = useCallback((data: { encounter: CombatEncounter }) => {
    setCombatEncounter(data.encounter);
  }, []);

  const handleCombatTurnChanged = useCallback((data: { encounter: CombatEncounter }) => {
    setCombatEncounter(data.encounter);
  }, []);

  const handleCombatHPUpdated = useCallback((data: { encounter: CombatEncounter }) => {
    setCombatEncounter(data.encounter);
  }, []);

  const handleCombatEnded = useCallback(() => {
    setCombatEncounter(null);
  }, []);

  // Handle async turn events
  const handleAsyncTurnStarted = useCallback((data: { turn: any }) => {
    setCurrentTurn(data.turn);
  }, []);

  const handleAsyncTurnChanged = useCallback((data: { newTurn: any }) => {
    setCurrentTurn(data.newTurn);
  }, []);

  // Typing indicator state
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; username: string }>>([]);

  const handleTypingStartEvent = useCallback((data: { userId: string; username: string }) => {
    setTypingUsers((prev) => {
      if (prev.find((u) => u.userId === data.userId)) {
        return prev;
      }
      return [...prev, data];
    });

    // Auto-remove after 3.5s
    setTimeout(() => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    }, 3500);
  }, []);

  const handleTypingStopEvent = useCallback((data: { userId: string }) => {
    setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
  }, []);

  // Socket.io connection
  const { connected, sendTyping } = useTableSocket({
    tableId,
    onMessageReceived: handleMessageReceived,
    onTypingStart: handleTypingStartEvent,
    onTypingStop: handleTypingStopEvent,
    onDiceRoll: handleDiceRoll,
    onCombatStarted: handleCombatStarted,
    onCombatTurnChanged: handleCombatTurnChanged,
    onCombatHPUpdated: handleCombatHPUpdated,
    onCombatEnded: handleCombatEnded,
    onAsyncTurnStarted: handleAsyncTurnStarted,
    onAsyncTurnChanged: handleAsyncTurnChanged,
  });

  // Typing indicator hook
  const {
    handleTyping,
    handleStopTyping,
  } = useTypingIndicator({
    onTypingStart: () => {
      sendTyping(true);
    },
    onTypingStop: () => {
      sendTyping(false);
    },
  });

  useEffect(() => {
    fetchTable();
    fetchMessages();
    fetchCombat();
    fetchCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`/api/auth/me`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.user?.id || '');
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchTable = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tables/${tableId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch table');
      }

      const data = await response.json();
      setTable(data.table);
    } catch (err: any) {
      setError(err.message || 'Failed to load table');
    } finally {
      setLoading(false);
    }
  };

  const fetchCombat = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/combat`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCombatEncounter(data.encounter || null);
      }
    } catch (err) {
      console.error('Failed to load combat:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/messages?limit=50`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
      setHasMoreMessages(data.hasMore || false);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadMoreMessages = async () => {
    if (loadingMessages || !hasMoreMessages || messages.length === 0) return;

    try {
      setLoadingMessages(true);
      const oldestMessage = messages[0];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/messages?limit=50&before=${oldestMessage.createdAt}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to load more messages');
      }

      const data = await response.json();
      setMessages((prev) => [...data.messages, ...prev]);
      setHasMoreMessages(data.hasMore || false);
    } catch (err: any) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || sending) return;

    // Stop typing indicator
    handleStopTyping();

    setSending(true);

    try {
      const response = await fetch(`/api/tables/${tableId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: messageInput.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const { message } = await response.json();
      setMessages([...messages, message]);
      setMessageInput('');
    } catch (err: any) {
      alert('Failed to send message: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const copyInviteCode = () => {
    if (!table) return;
    navigator.clipboard.writeText(table.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Combat handlers
  const handleStartCombat = async (combatants: any[]) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/combat/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ combatants }),
      });

      if (!response.ok) {
        throw new Error('Failed to start combat');
      }

      const data = await response.json();
      setCombatEncounter(data.encounter);
    } catch (err: any) {
      alert('Failed to start combat: ' + err.message);
    }
  };

  const handleEndCombat = async () => {
    if (!combatEncounter) return;

    if (!confirm('Are you sure you want to end combat?')) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/combat/${combatEncounter.id}/end`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to end combat');
      }

      setCombatEncounter(null);
    } catch (err: any) {
      alert('Failed to end combat: ' + err.message);
    }
  };

  const handleNextTurn = async () => {
    if (!combatEncounter) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/combat/${combatEncounter.id}/next-turn`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to advance turn');
      }

      const data = await response.json();
      setCombatEncounter(data.encounter);
    } catch (err: any) {
      alert('Failed to advance turn: ' + err.message);
    }
  };

  const handleUpdateHP = async (combatantId: string, newHP: number) => {
    if (!combatEncounter) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/combat/${combatEncounter.id}/hp`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ combatantId, newHP }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update HP');
      }

      const data = await response.json();
      setCombatEncounter(data.encounter);
    } catch (err: any) {
      alert('Failed to update HP: ' + err.message);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-body text-gray-400">Loading table...</p>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-h1 mb-4">Table Not Found</h1>
          <p className="text-body text-gray-400">{error || 'This table does not exist'}</p>
        </div>
      </div>
    );
  }

  const playStyleConfig = {
    sync: { label: 'Live', color: 'text-yellow' },
    async: { label: 'Async', color: 'text-blue' },
    solo: { label: 'Solo', color: 'text-purple' },
  };

  const playStyleInfo = playStyleConfig[table.playStyle as keyof typeof playStyleConfig] || playStyleConfig.async;
  const isDM = table.ownerId === table.members.find((m) => m.role === 'dm')?.userId;

  // For async mode: check if it's current user's turn
  const isAsyncMode = table.playStyle === 'async';
  const isYourTurn = isAsyncMode && currentTurn?.userId === currentUserId;
  const canSendMessage = !isAsyncMode || isYourTurn || isDM; // DM can always send messages

  // Desktop layout (3 columns)
  return (
    <>
      {/* Desktop: 3-column layout */}
      <div className="hidden lg:flex h-screen">
        {/* Left Sidebar - Turn Order (async) or Members (sync) */}
        {isAsyncMode ? (
          <TurnOrderSidebar
            tableId={tableId}
            turnOrder={table.turnOrder}
            currentTurnIndex={table.currentTurnIndex}
            members={table.members}
          />
        ) : (
          <aside className="w-80 border-r border-gray-800 p-4 overflow-y-auto">
            <h2 className="text-h4 font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members ({table.members.length}/{table.maxPlayers})
            </h2>

          <div className="space-y-3">
            {table.members.map((member) => {
              const isDM = member.userId === table.ownerId;
              const initials = member.user.username.substring(0, 2).toUpperCase();

              return (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 p-2 rounded ${
                    isDM ? 'border border-green-neon/30 bg-green-neon/5' : 'bg-gray-900/50'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      {member.user.avatar && <AvatarImage src={member.user.avatar} />}
                      <AvatarFallback className="bg-gray-800 text-green-neon">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-black bg-green-neon" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {isDM && <span className="text-sm">=Q</span>}
                      <p className="font-medium truncate">{member.user.username}</p>
                    </div>
                    <p className="text-small text-gray-400 truncate">
                      {member.character ? (
                        <>
                          {member.character.name} • {member.character.class} Lvl {member.character.level}
                        </>
                      ) : (
                        <span className="italic">{member.role}</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
        )}

        {/* Center - Chat */}
        <main className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex items-center gap-3">
              <h1 className="text-h2 font-bold">{table.name}</h1>
              {isAsyncMode && (
                <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  📝 Play-by-Post Mode
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-small ${playStyleInfo.color}`}>{playStyleInfo.label}</span>
              <span className="text-small text-gray-400">•</span>
              <span className="text-small text-gray-400">{table.privacy}</span>
            </div>
          </div>

          {/* Async Turn Tracker */}
          {isAsyncMode && (
            <AsyncTurnTracker
              tableId={tableId}
              isDM={isDM}
              currentUserId={currentUserId}
            />
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Load More Button */}
            {hasMoreMessages && !loadingMessages && messages.length > 0 && (
              <div className="text-center py-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMoreMessages}
                  className="text-xs"
                >
                  Load older messages
                </Button>
              </div>
            )}
            {loadingMessages && messages.length > 0 && (
              <div className="text-center py-2 text-gray-400 text-xs">
                Loading messages...
              </div>
            )}

            {messages.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-body">No messages yet. Start the conversation</p>
              </div>
            ) : (
              messages.map((message) => {
                const isSystem = message.type === 'system';
                const initials = message.user.username.substring(0, 2).toUpperCase();

                return (
                  <div key={message.id} className={`flex gap-3 ${isSystem ? 'justify-center' : ''}`}>
                    {!isSystem && (
                      <Avatar className="h-8 w-8 mt-1">
                        {message.user.avatar && <AvatarImage src={message.user.avatar} />}
                        <AvatarFallback className="bg-gray-800 text-green-neon">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="flex-1 max-w-2xl">
                      {!isSystem && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-small font-medium">{message.user.username}</span>
                          <span className="text-xs text-gray-400">
                            {formatTimestamp(message.createdAt)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-lg ${
                          isSystem
                            ? 'bg-gray-800 text-gray-400 text-small italic inline-block'
                            : 'bg-gray-900'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
            {!canSendMessage && (
              <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                ⏳ Wait for your turn to send messages
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  handleTyping();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder={canSendMessage ? "Type a message..." : "Wait for your turn..."}
                className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                maxLength={1000}
                disabled={sending || !canSendMessage}
              />
              <Button type="submit" disabled={!messageInput.trim() || sending || !canSendMessage}>
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {messageInput.length}/1000 • Press Enter to send, Shift+Enter for new line
            </p>
          </form>
        </main>

        {/* Right Panel - Dice, Combat & AI */}
        <aside className="w-96 border-l border-gray-800 p-4 overflow-y-auto">
          <Tabs defaultValue="dice" className="mb-6">
            <TabsList className={`grid w-full ${isDM ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="dice">Dice</TabsTrigger>
              <TabsTrigger value="combat">Combat</TabsTrigger>
              {isDM && <TabsTrigger value="ai">AI</TabsTrigger>}
            </TabsList>

            <TabsContent value="dice" className="space-y-4 mt-4">
              <DiceRoller tableId={tableId} onRoll={handleDiceRoll} />

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-400">Recent Rolls</h3>
                {diceRolls.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No rolls yet</p>
                ) : (
                  diceRolls.map((roll) => (
                    <DiceResult key={roll.id} roll={roll} />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="combat" className="mt-4">
              <CombatTracker
                encounter={combatEncounter}
                isDM={isDM}
                onStartCombat={() => setShowStartCombatModal(true)}
                onEndCombat={handleEndCombat}
                onNextTurn={handleNextTurn}
                onUpdateHP={handleUpdateHP}
              />
            </TabsContent>

            {isDM && (
              <TabsContent value="ai" className="mt-4">
                <AIAssistant tableId={tableId} />
              </TabsContent>
            )}
          </Tabs>
        </aside>
      </div>

      {/* Mobile: Tabbed layout */}
      <div className="lg:hidden h-screen flex flex-col">
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-h2 font-bold">{table.name}</h1>
            {isAsyncMode && (
              <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                📝 PbP
              </span>
            )}
          </div>
        </div>

        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 border-b border-gray-800 rounded-none bg-transparent">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            {/* Async Turn Tracker */}
            {isAsyncMode && (
              <AsyncTurnTracker
                tableId={tableId}
                isDM={isDM}
                currentUserId={currentUserId}
              />
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-body">No messages yet. Start the conversation</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isSystem = message.type === 'system';
                  const initials = message.user.username.substring(0, 2).toUpperCase();

                  return (
                    <div key={message.id} className={`flex gap-3 ${isSystem ? 'justify-center' : ''}`}>
                      {!isSystem && (
                        <Avatar className="h-8 w-8 mt-1">
                          {message.user.avatar && <AvatarImage src={message.user.avatar} />}
                          <AvatarFallback className="bg-gray-800 text-green-neon">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      <div className="flex-1">
                        {!isSystem && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-small font-medium">{message.user.username}</span>
                            <span className="text-xs text-gray-400">
                              {formatTimestamp(message.createdAt)}
                            </span>
                          </div>
                        )}

                        <div
                          className={`p-3 rounded-lg ${
                            isSystem
                              ? 'bg-gray-800 text-gray-400 text-small italic inline-block'
                              : 'bg-gray-900'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && <TypingIndicator typingUsers={typingUsers} />}

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
              {!canSendMessage && (
                <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
                  ⏳ Wait for your turn
                </div>
              )}
              <div className="flex gap-2">
                <Textarea
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder={canSendMessage ? "Type a message..." : "Wait for your turn..."}
                  className="flex-1 min-h-[60px] resize-none"
                  maxLength={1000}
                  disabled={sending || !canSendMessage}
                />
                <Button type="submit" disabled={!messageInput.trim() || sending || !canSendMessage} size="sm">
                  Send
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="members" className="flex-1 overflow-y-auto p-4">
            <h2 className="text-h4 font-bold mb-4">Members ({table.members.length}/{table.maxPlayers})</h2>
            <div className="space-y-3">
              {table.members.map((member) => {
                const isDM = member.userId === table.ownerId;
                const initials = member.user.username.substring(0, 2).toUpperCase();

                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-3 p-3 rounded ${
                      isDM ? 'border border-green-neon/30 bg-green-neon/5' : 'bg-gray-900/50'
                    }`}
                  >
                    <Avatar className="h-10 w-10">
                      {member.user.avatar && <AvatarImage src={member.user.avatar} />}
                      <AvatarFallback className="bg-gray-800 text-green-neon">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        {isDM && <span className="text-sm">=Q</span>}
                        <p className="font-medium">{member.user.username}</p>
                      </div>
                      <p className="text-small text-gray-400">
                        {member.character ? (
                          <>
                            {member.character.name} • {member.character.class} Lvl {member.character.level}
                          </>
                        ) : (
                          <span className="italic">{member.role}</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="info" className="flex-1 overflow-y-auto p-4">
            <h2 className="text-h2 font-bold mb-2">{table.name}</h2>
            <p className="text-body text-gray-400 mb-6">{table.description}</p>

            <div className="space-y-4">
              <div>
                <p className="text-small text-gray-400 mb-1">Play Style</p>
                <span className={`inline-block px-2 py-1 rounded bg-gray-900 text-small ${playStyleInfo.color}`}>
                  {playStyleInfo.label}
                </span>
              </div>

              {table.tags.length > 0 && (
                <div>
                  <p className="text-small text-gray-400 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {table.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-gray-900 text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-small text-gray-400 mb-2">Invite Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-h3 font-mono font-bold tracking-widest text-green-neon">
                    {table.inviteCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyInviteCode}
                  >
                    {copiedCode ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Start Combat Modal */}
      <StartCombatModal
        open={showStartCombatModal}
        onClose={() => setShowStartCombatModal(false)}
        onStart={handleStartCombat}
        tableMembers={table.members}
      />
    </>
  );
}
