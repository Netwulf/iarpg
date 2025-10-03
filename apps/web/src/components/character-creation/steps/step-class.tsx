'use client';

import { Button, Card, CardContent, CardHeader, CardTitle } from '@iarpg/ui';
import { CLASSES, type Class } from '@/lib/character-data';

interface StepClassProps {
  selectedClass: Class | null;
  onSelectClass: (classData: Class) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function StepClass({ selectedClass, onSelectClass, onNext, onPrevious }: StepClassProps) {
  const handleNext = () => {
    if (selectedClass) {
      onNext();
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-h1 font-bold mb-2">
          Choose Your <span className="text-green-neon">Class</span>
        </h2>
        <p className="text-body text-gray-400">
          Your class determines your abilities, hit points, and combat style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {CLASSES.map((classData) => (
          <Card
            key={classData.id}
            className={`cursor-pointer transition-all ${
              selectedClass?.id === classData.id
                ? 'border-green-neon border-2'
                : 'hover:border-gray-700'
            }`}
            onClick={() => onSelectClass(classData)}
          >
            <CardHeader>
              <CardTitle className="text-h3">{classData.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-small text-gray-400 mb-4">
                {classData.description}
              </p>
              <div className="space-y-2 text-xs text-gray-300">
                <div><strong>Hit Die:</strong> d{classData.hitDie}</div>
                <div><strong>Primary:</strong> {classData.primaryAbility.toUpperCase().slice(0, 3)}</div>
                <div><strong>Saves:</strong> {classData.savingThrows.map(s => s.toUpperCase().slice(0, 3)).join(', ')}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          ← Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedClass}
          size="lg"
        >
          Next: Ability Scores →
        </Button>
      </div>
    </div>
  );
}
