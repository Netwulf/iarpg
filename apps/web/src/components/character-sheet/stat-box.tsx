'use client';

import { Card } from '@iarpg/ui';

interface StatBoxProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatBox({ label, value, icon, className = '' }: StatBoxProps) {
  return (
    <Card className={`p-4 text-center ${className}`}>
      {icon && <div className="mb-2 flex justify-center text-gray-400">{icon}</div>}
      <div className="text-xs text-gray-400 uppercase font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </Card>
  );
}
