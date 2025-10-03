'use client';

import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@iarpg/ui';
import type { Class } from '@/lib/character-data';

interface StepEquipmentProps {
  classData: Class | null;
  equipment: string[];
  onSetEquipment: (equipment: string[]) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StepEquipment({
  classData,
  equipment,
  onSetEquipment,
  onNext,
  onPrevious
}: StepEquipmentProps) {
  const [packageChoice, setPackageChoice] = useState<'A' | 'B'>('A');

  const handleNext = () => {
    if (classData) {
      onSetEquipment(classData.equipment);
      onNext();
    }
  };

  if (!classData) {
    return null;
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-h1 font-bold mb-2">
          Choose <span className="text-green-neon">Equipment</span>
        </h2>
        <p className="text-body text-gray-400">
          Select your starting equipment package
        </p>
      </div>

      <Card className="max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle className="text-h2">{classData.name} Starting Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-h4 mb-3">Standard Package</h3>
              <ul className="space-y-2">
                {classData.equipment.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <span className="text-green-neon">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-800">
              <p className="text-small text-gray-400">
                This is your starting equipment as a level 1 {classData.name}. Additional
                equipment can be purchased or found during your adventures.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button onClick={handleNext} size="lg">
          Next: Review →
        </Button>
      </div>
    </div>
  );
}
