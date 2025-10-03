'use client';

import { Card, Button } from '@iarpg/ui';
import { Swords, Play, Square, SkipForward } from 'lucide-react';
import { CombatEncounter } from '@iarpg/shared';
import { CombatantCard } from './combatant-card';

interface CombatTrackerProps {
  encounter: CombatEncounter | null;
  isDM: boolean;
  onStartCombat: () => void;
  onEndCombat: () => void;
  onNextTurn: () => void;
  onUpdateHP: (combatantId: string, newHP: number) => void;
}

export function CombatTracker({
  encounter,
  isDM,
  onStartCombat,
  onEndCombat,
  onNextTurn,
  onUpdateHP,
}: CombatTrackerProps) {
  if (!encounter) {
    return (
      <Card className="p-4">
        <div className="text-center">
          <Swords className="w-12 h-12 mx-auto mb-3 text-gray-600" />
          <h3 className="text-lg font-semibold mb-2">No Active Combat</h3>
          <p className="text-sm text-gray-400 mb-4">
            {isDM
              ? 'Start a combat encounter to track initiative and HP'
              : 'Wait for the DM to start combat'}
          </p>
          {isDM && (
            <Button onClick={onStartCombat} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Combat
            </Button>
          )}
        </div>
      </Card>
    );
  }

  const currentCombatant = encounter.combatants[encounter.currentTurn];

  return (
    <div className="space-y-3">
      {/* Combat Header */}
      <Card className="p-4 border-2 border-green-neon">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-green-neon" />
            <h3 className="text-lg font-bold">{encounter.name}</h3>
          </div>
          <span className="text-xs px-2 py-1 rounded border border-green-neon text-green-neon">
            {encounter.state.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            Round <span className="font-semibold text-white">{encounter.round}</span>
          </span>
          <span className="text-gray-400">
            Turn{' '}
            <span className="font-semibold text-white">
              {encounter.currentTurn + 1}/{encounter.combatants.length}
            </span>
          </span>
        </div>

        {currentCombatant && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-400 mb-1">Current Turn:</p>
            <p className="font-semibold text-green-neon">{currentCombatant.name}</p>
          </div>
        )}

        {/* DM Controls */}
        {isDM && (
          <div className="flex gap-2 mt-3">
            <Button onClick={onNextTurn} className="flex-1" size="sm">
              <SkipForward className="w-4 h-4 mr-1" />
              Next Turn
            </Button>
            <Button
              onClick={onEndCombat}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
              size="sm"
            >
              <Square className="w-4 h-4 mr-1" />
              End Combat
            </Button>
          </div>
        )}
      </Card>

      {/* Combatants List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-400">Initiative Order</h4>
        {encounter.combatants.map((combatant, index) => (
          <CombatantCard
            key={combatant.id}
            combatant={combatant}
            isActive={index === encounter.currentTurn}
            isDM={isDM}
            onUpdateHP={onUpdateHP}
          />
        ))}
      </div>
    </div>
  );
}
