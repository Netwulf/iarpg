// D&D 5e Skills and related data
export const DND_SKILLS = [
  { name: 'Acrobatics', ability: 'dexterity' },
  { name: 'Animal Handling', ability: 'wisdom' },
  { name: 'Arcana', ability: 'intelligence' },
  { name: 'Athletics', ability: 'strength' },
  { name: 'Deception', ability: 'charisma' },
  { name: 'History', ability: 'intelligence' },
  { name: 'Insight', ability: 'wisdom' },
  { name: 'Intimidation', ability: 'charisma' },
  { name: 'Investigation', ability: 'intelligence' },
  { name: 'Medicine', ability: 'wisdom' },
  { name: 'Nature', ability: 'intelligence' },
  { name: 'Perception', ability: 'wisdom' },
  { name: 'Performance', ability: 'charisma' },
  { name: 'Persuasion', ability: 'charisma' },
  { name: 'Religion', ability: 'intelligence' },
  { name: 'Sleight of Hand', ability: 'dexterity' },
  { name: 'Stealth', ability: 'dexterity' },
  { name: 'Survival', ability: 'wisdom' },
] as const;

export const SAVING_THROWS = [
  { name: 'Strength', ability: 'strength' },
  { name: 'Dexterity', ability: 'dexterity' },
  { name: 'Constitution', ability: 'constitution' },
  { name: 'Intelligence', ability: 'intelligence' },
  { name: 'Wisdom', ability: 'wisdom' },
  { name: 'Charisma', ability: 'charisma' },
] as const;

export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

export function getModifierColor(modifier: number): string {
  if (modifier > 0) return 'text-green-neon';
  if (modifier < 0) return 'text-red';
  return 'text-gray-400';
}
