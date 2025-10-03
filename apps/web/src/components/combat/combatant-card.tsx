'use client';

import { Card, Avatar, AvatarFallback, AvatarImage, Button, Input } from '@iarpg/ui';
import { Heart, Skull, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Combatant } from '@iarpg/shared';

interface CombatantCardProps {
  combatant: Combatant;
  isActive: boolean;
  isDM: boolean;
  onUpdateHP: (combatantId: string, newHP: number) => void;
}

export function CombatantCard({ combatant, isActive, isDM, onUpdateHP }: CombatantCardProps) {
  const [hpAdjustment, setHpAdjustment] = useState('');
  const [showHPInput, setShowHPInput] = useState(false);

  const initials = combatant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const hpPercentage = (combatant.hp / combatant.maxHp) * 100;
  const isDead = combatant.hp <= 0;

  const getHPBarColor = () => {
    if (isDead) return 'bg-gray-600';
    if (hpPercentage > 50) return 'bg-green-neon';
    if (hpPercentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleHPAdjust = (delta: number) => {
    const newHP = Math.max(0, Math.min(combatant.maxHp, combatant.hp + delta));
    onUpdateHP(combatant.id, newHP);
  };

  const handleHPInputSubmit = () => {
    const value = parseInt(hpAdjustment);
    if (isNaN(value)) return;

    const newHP = Math.max(0, Math.min(combatant.maxHp, combatant.hp + value));
    onUpdateHP(combatant.id, newHP);
    setHpAdjustment('');
    setShowHPInput(false);
  };

  return (
    <Card
      className={`p-3 transition-all ${
        isActive
          ? 'border-2 border-green-neon bg-green-neon/10'
          : isDead
            ? 'border border-gray-700 opacity-50'
            : 'border border-gray-800'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="relative">
          <Avatar className="h-10 w-10">
            {combatant.character?.avatarUrl && (
              <AvatarImage src={combatant.character.avatarUrl} />
            )}
            <AvatarFallback
              className={`text-sm ${
                combatant.isNPC ? 'bg-red-900 text-red-200' : 'bg-gray-800 text-green-neon'
              }`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
          {isDead && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
              <Skull className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{combatant.name}</p>
            {combatant.isNPC && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-900">
                NPC
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Initiative: {combatant.initiative}</p>
        </div>
      </div>

      {/* HP Bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            HP
          </span>
          <span className="text-xs font-mono font-semibold">
            {combatant.hp}/{combatant.maxHp}
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${getHPBarColor()}`}
            style={{ width: `${Math.max(0, hpPercentage)}%` }}
          />
        </div>
      </div>

      {/* DM HP Controls */}
      {isDM && !showHPInput && (
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleHPAdjust(-5)}
            className="flex-1 h-7 text-xs"
          >
            -5
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleHPAdjust(-1)}
            className="flex-1 h-7 text-xs"
          >
            -1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHPInput(true)}
            className="flex-1 h-7 text-xs"
          >
            Custom
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleHPAdjust(1)}
            className="flex-1 h-7 text-xs"
          >
            +1
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleHPAdjust(5)}
            className="flex-1 h-7 text-xs"
          >
            +5
          </Button>
        </div>
      )}

      {/* Custom HP Input */}
      {isDM && showHPInput && (
        <div className="flex gap-1">
          <Input
            type="number"
            placeholder="+/-"
            value={hpAdjustment}
            onChange={(e) => setHpAdjustment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleHPInputSubmit();
              } else if (e.key === 'Escape') {
                setShowHPInput(false);
                setHpAdjustment('');
              }
            }}
            className="flex-1 h-7 text-xs"
            autoFocus
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleHPInputSubmit}
            className="h-7 text-xs"
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowHPInput(false);
              setHpAdjustment('');
            }}
            className="h-7 text-xs"
          >
            Cancel
          </Button>
        </div>
      )}
    </Card>
  );
}
