'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@iarpg/ui';
import { Plus, Trash2 } from 'lucide-react';

interface CombatantInput {
  id: string;
  characterId?: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  isNPC: boolean;
}

interface StartCombatModalProps {
  open: boolean;
  onClose: () => void;
  onStart: (combatants: CombatantInput[]) => void;
  tableMembers: Array<{
    id: string;
    characterId: string | null;
    character: {
      id: string;
      name: string;
      class: string;
      level: number;
      avatarUrl?: string | null;
    } | null;
  }>;
}

export function StartCombatModal({
  open,
  onClose,
  onStart,
  tableMembers,
}: StartCombatModalProps) {
  const [combatants, setCombatants] = useState<CombatantInput[]>([]);

  useEffect(() => {
    if (open) {
      // Initialize with table characters (HP will need manual input)
      const initialCombatants: CombatantInput[] = tableMembers
        .filter((m) => m.character)
        .map((m) => ({
          id: crypto.randomUUID(),
          characterId: m.character!.id,
          name: m.character!.name,
          initiative: 0,
          hp: 20, // Default HP - DM should adjust
          maxHp: 20, // Default Max HP - DM should adjust
          isNPC: false,
        }));

      setCombatants(initialCombatants);
    }
  }, [open, tableMembers]);

  const addNPC = () => {
    setCombatants([
      ...combatants,
      {
        id: crypto.randomUUID(),
        name: `NPC ${combatants.filter((c) => c.isNPC).length + 1}`,
        initiative: 0,
        hp: 20,
        maxHp: 20,
        isNPC: true,
      },
    ]);
  };

  const removeCombatant = (id: string) => {
    setCombatants(combatants.filter((c) => c.id !== id));
  };

  const updateCombatant = (id: string, field: keyof CombatantInput, value: any) => {
    setCombatants(
      combatants.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleStart = () => {
    if (combatants.length === 0) {
      alert('Add at least one combatant');
      return;
    }

    if (combatants.some((c) => !c.name.trim())) {
      alert('All combatants must have a name');
      return;
    }

    onStart(combatants);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Start Combat Encounter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Configure combatants and roll initiative
            </p>
            <Button onClick={addNPC} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add NPC
            </Button>
          </div>

          {combatants.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No combatants added yet</p>
              <p className="text-xs mt-1">Add NPCs to start combat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {combatants.map((combatant) => (
                <div
                  key={combatant.id}
                  className={`p-3 rounded border ${
                    combatant.isNPC
                      ? 'border-red-900 bg-red-900/10'
                      : 'border-gray-800 bg-gray-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <Label htmlFor={`name-${combatant.id}`} className="text-xs">
                          Name
                        </Label>
                        <Input
                          id={`name-${combatant.id}`}
                          value={combatant.name}
                          onChange={(e) =>
                            updateCombatant(combatant.id, 'name', e.target.value)
                          }
                          placeholder="Combatant name"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`init-${combatant.id}`} className="text-xs">
                          Initiative
                        </Label>
                        <Input
                          id={`init-${combatant.id}`}
                          type="number"
                          value={combatant.initiative}
                          onChange={(e) =>
                            updateCombatant(
                              combatant.id,
                              'initiative',
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="h-8 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`hp-${combatant.id}`} className="text-xs">
                          HP / Max HP
                        </Label>
                        <div className="flex gap-1">
                          <Input
                            id={`hp-${combatant.id}`}
                            type="number"
                            value={combatant.hp}
                            onChange={(e) =>
                              updateCombatant(
                                combatant.id,
                                'hp',
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="HP"
                            className="h-8 text-sm"
                          />
                          <Input
                            type="number"
                            value={combatant.maxHp}
                            onChange={(e) =>
                              updateCombatant(
                                combatant.id,
                                'maxHp',
                                parseInt(e.target.value) || 0
                              )
                            }
                            placeholder="Max"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {combatant.isNPC && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCombatant(combatant.id)}
                        className="mt-5 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleStart}>Start Combat</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
