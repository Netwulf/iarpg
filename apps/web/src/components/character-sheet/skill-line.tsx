'use client';

interface SkillLineProps {
  name: string;
  modifier: number;
  isProficient: boolean;
  onRoll?: () => void;
}

export function SkillLine({ name, modifier, isProficient, onRoll }: SkillLineProps) {
  const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

  return (
    <div
      className="flex items-center justify-between py-2 px-3 hover:bg-gray-800/50 rounded cursor-pointer transition-colors"
      onClick={onRoll}
    >
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full border ${
            isProficient ? 'bg-green-500 border-green-500' : 'border-gray-600'
          }`}
        />
        <span className="text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold min-w-[2rem] text-right">{modifierText}</span>
        <button
          className="text-xs text-gray-400 hover:text-green-500 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onRoll?.();
          }}
        >
          Roll
        </button>
      </div>
    </div>
  );
}
