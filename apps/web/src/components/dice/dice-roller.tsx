'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@iarpg/ui';

interface DiceRollerProps {
  tableId: string;
  onRoll?: (result: any) => void;
}

export function DiceRoller({ tableId, onRoll }: DiceRollerProps) {
  const [notation, setNotation] = useState('1d20');
  const [reason, setReason] = useState('');
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = async () => {
    try {
      setIsRolling(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/roll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          notation,
          reason: reason || undefined,
          advantage,
          disadvantage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to roll dice');
      }

      const result = await response.json();
      onRoll?.(result);
    } catch (error) {
      console.error('Error rolling dice:', error);
    } finally {
      setIsRolling(false);
    }
  };

  const handleAdvantageToggle = () => {
    setAdvantage(!advantage);
    if (!advantage) setDisadvantage(false);
  };

  const handleDisadvantageToggle = () => {
    setDisadvantage(!disadvantage);
    if (!disadvantage) setAdvantage(false);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Dice Notation</label>
          <Input
            type="text"
            value={notation}
            onChange={(e) => setNotation(e.target.value)}
            placeholder="1d20+5"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Reason (optional)</label>
          <Input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Attack roll"
            className="w-full"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={advantage ? 'default' : 'outline'}
            size="sm"
            onClick={handleAdvantageToggle}
            className="flex-1"
          >
            Advantage
          </Button>
          <Button
            variant={disadvantage ? 'default' : 'outline'}
            size="sm"
            onClick={handleDisadvantageToggle}
            className="flex-1"
          >
            Disadvantage
          </Button>
        </div>

        <Button onClick={handleRoll} disabled={isRolling} className="w-full">
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </div>
    </Card>
  );
}
