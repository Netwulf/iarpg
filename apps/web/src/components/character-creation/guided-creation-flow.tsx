'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@iarpg/ui';
import { StepRace } from './steps/step-race';
import { StepClass } from './steps/step-class';
import { StepAbilityScores } from './steps/step-ability-scores';
import { StepEquipment } from './steps/step-equipment';
import { StepReview } from './steps/step-review';
import type { AbilityScores, Race, Class } from '@/lib/character-data';
import { apiClient } from '@/lib/api-client';

interface GuidedCreationFlowProps {
  onBack: () => void;
}

interface CharacterResponse {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

export interface CharacterFormData {
  race: Race | null;
  class: Class | null;
  abilityScores: AbilityScores | null;
  equipment: string[];
  name: string;
  background: string;
}

export function GuidedCreationFlow({ onBack }: GuidedCreationFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CharacterFormData>({
    race: null,
    class: null,
    abilityScores: null,
    equipment: [],
    name: '',
    background: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 5;

  const updateFormData = (data: Partial<CharacterFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const handleCreateCharacter = async () => {
    if (!formData.name || !formData.race || !formData.class || !formData.abilityScores) {
      setError('Please complete all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post<CharacterResponse>('/characters', {
        name: formData.name,
        race: formData.race.name,
        class: formData.class.name,
        level: 1,
        abilityScores: formData.abilityScores,
        equipment: formData.equipment,
        background: formData.background,
      });

      router.push(`/characters/${response.id}`);
    } catch (err) {
      setError('Failed to create character. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={handlePrevious}>
              ← Back
            </Button>
            <div className="text-small text-gray-400">
              Step {currentStep} of {totalSteps}
            </div>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index < currentStep
                    ? 'bg-green-neon'
                    : index === currentStep - 1
                    ? 'bg-green-neon/50'
                    : 'bg-gray-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <StepRace
              selectedRace={formData.race}
              onSelectRace={(race) => updateFormData({ race })}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <StepClass
              selectedClass={formData.class}
              onSelectClass={(classData) => updateFormData({ class: classData })}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 3 && (
            <StepAbilityScores
              race={formData.race}
              abilityScores={formData.abilityScores}
              onSetAbilityScores={(scores) => updateFormData({ abilityScores: scores })}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 4 && (
            <StepEquipment
              classData={formData.class}
              equipment={formData.equipment}
              onSetEquipment={(equipment) => updateFormData({ equipment })}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}

          {currentStep === 5 && (
            <StepReview
              formData={formData}
              onUpdateFormData={updateFormData}
              onPrevious={handlePrevious}
              onCreateCharacter={handleCreateCharacter}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
