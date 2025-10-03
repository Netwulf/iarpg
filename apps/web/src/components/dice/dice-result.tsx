'use client';

import { Card } from '@iarpg/ui';
import { DiceRoll } from '@iarpg/shared';
import { motion } from 'framer-motion';

interface DiceResultProps {
  roll: DiceRoll & {
    id: string;
    username: string;
    reason?: string;
    createdAt: string;
  };
}

export function DiceResult({ roll }: DiceResultProps) {
  const isCriticalSuccess = roll.notation.includes('d20') && roll.rolls.some((r) => r === 20);
  const isCriticalFailure = roll.notation.includes('d20') && roll.rolls.some((r) => r === 1);
  const isAdvantage = roll.type === 'advantage';
  const isDisadvantage = roll.type === 'disadvantage';

  const typeColor = isCriticalSuccess
    ? 'text-yellow-500'
    : isCriticalFailure
      ? 'text-red-500'
      : isAdvantage
        ? 'text-green-neon'
        : isDisadvantage
          ? 'text-red-400'
          : 'text-blue-400';

  const bgColor = isCriticalSuccess
    ? 'bg-gradient-to-br from-yellow-500/20 to-transparent border-yellow-500'
    : isCriticalFailure
      ? 'bg-red-500/10 border-red-500'
      : isAdvantage
        ? 'bg-green-neon/10 border-green-neon/30'
        : isDisadvantage
          ? 'bg-red-500/10 border-red-500/30'
          : 'bg-gray-900 border-gray-800';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 border-2 ${bgColor}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="font-semibold text-sm">{roll.username}</div>
            {roll.reason && <div className="text-xs text-gray-400">{roll.reason}</div>}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(roll.createdAt).toLocaleTimeString()}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="text-xs text-gray-400 font-mono">{roll.notation}</div>
          <div className="flex flex-wrap gap-1">
            {(isAdvantage || isDisadvantage) ? (
              roll.rolls.map((value, idx) => {
                const isUsed =
                  (isAdvantage && value === Math.max(...roll.rolls)) ||
                  (isDisadvantage && value === Math.min(...roll.rolls));

                return (
                  <motion.span
                    key={idx}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, 360, 0] }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                      isUsed
                        ? 'bg-green-neon/20 border border-green-neon/50 text-green-neon'
                        : 'bg-gray-800 border border-gray-700 text-gray-400 line-through opacity-50'
                    }`}
                  >
                    {value}
                  </motion.span>
                );
              })
            ) : (
              roll.rolls.map((value, idx) => (
                <motion.span
                  key={idx}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 360, 0] }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs font-mono font-bold"
                >
                  {value}
                </motion.span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-300">{roll.breakdown}</div>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className={`text-4xl font-bold ${typeColor}`}
          >
            {roll.total}
          </motion.div>
        </div>

        {isCriticalSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-2 text-center text-xs font-semibold text-yellow-500 animate-pulse"
          >
            ⚡ CRITICAL HIT! ⚡
          </motion.div>
        )}

        {isCriticalFailure && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-2 text-center text-xs font-semibold text-red-500"
          >
            😞 CRITICAL MISS 😞
          </motion.div>
        )}

        {isAdvantage && (
          <div className="mt-2 text-center">
            <span className="px-2 py-1 rounded bg-green-neon/20 border border-green-neon text-green-neon text-xs font-semibold">
              Advantage
            </span>
          </div>
        )}

        {isDisadvantage && (
          <div className="mt-2 text-center">
            <span className="px-2 py-1 rounded bg-red-500/20 border border-red-500 text-red-500 text-xs font-semibold">
              Disadvantage
            </span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
