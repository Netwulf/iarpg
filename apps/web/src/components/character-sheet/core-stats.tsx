'use client';

import { Card, CardContent } from '@iarpg/ui';

interface CoreStatsProps {
  currentHP: number;
  maxHP: number;
  ac: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
}

export function CoreStats({
  currentHP,
  maxHP,
  ac,
  initiative,
  speed,
  proficiencyBonus,
}: CoreStatsProps) {
  const initiativeText = initiative >= 0 ? `+${initiative}` : `${initiative}`;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatBox
        label="Hit Points"
        value={`${currentHP}/${maxHP}`}
        color="text-red"
      />
      <StatBox
        label="Armor Class"
        value={ac.toString()}
        color="text-blue"
      />
      <StatBox
        label="Initiative"
        value={initiativeText}
        color="text-yellow"
      />
      <StatBox
        label="Speed"
        value={`${speed} ft`}
        color="text-green-neon"
      />
      <StatBox
        label="Proficiency"
        value={`+${proficiencyBonus}`}
        color="text-purple"
      />
      <StatBox
        label="Level"
        value="1"
        color="text-gray-400"
      />
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <div className="text-xs text-gray-400 uppercase mb-2">{label}</div>
        <div className={`text-h2 font-bold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
