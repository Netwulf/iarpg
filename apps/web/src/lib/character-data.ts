// D&D 5e Character Data

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface PreMadeCharacter {
  id: string;
  name: string;
  race: string;
  class: string;
  level: number;
  abilityScores: AbilityScores;
  equipment: string[];
  description: string;
}

export const PRE_MADE_CHARACTERS: PreMadeCharacter[] = [
  {
    id: 'human-fighter',
    name: 'Valiant Warrior',
    race: 'Human',
    class: 'Fighter',
    level: 1,
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
    },
    equipment: ['Longsword', 'Shield', 'Chain Mail', 'Backpack'],
    description: 'A strong and resilient warrior, ready for front-line combat.',
  },
  {
    id: 'elf-wizard',
    name: 'Arcane Scholar',
    race: 'Elf',
    class: 'Wizard',
    level: 1,
    abilityScores: {
      strength: 8,
      dexterity: 16,
      constitution: 12,
      intelligence: 16,
      wisdom: 13,
      charisma: 10,
    },
    equipment: ['Spellbook', 'Quarterstaff', 'Robes', 'Component Pouch'],
    description: 'A master of arcane magic, wielding powerful spells.',
  },
  {
    id: 'halfling-rogue',
    name: 'Sneaky Scout',
    race: 'Halfling',
    class: 'Rogue',
    level: 1,
    abilityScores: {
      strength: 10,
      dexterity: 17,
      constitution: 12,
      intelligence: 13,
      wisdom: 14,
      charisma: 8,
    },
    equipment: ['Shortsword', 'Shortbow', 'Leather Armor', "Thieves' Tools"],
    description: 'A nimble and cunning rogue, expert in stealth and trickery.',
  },
  {
    id: 'dwarf-cleric',
    name: 'Divine Healer',
    race: 'Dwarf',
    class: 'Cleric',
    level: 1,
    abilityScores: {
      strength: 14,
      dexterity: 10,
      constitution: 16,
      intelligence: 8,
      wisdom: 16,
      charisma: 12,
    },
    equipment: ['Mace', 'Shield', 'Scale Mail', 'Holy Symbol'],
    description: 'A devoted cleric, channeling divine power to heal and protect.',
  },
  {
    id: 'human-ranger',
    name: 'Forest Tracker',
    race: 'Human',
    class: 'Ranger',
    level: 1,
    abilityScores: {
      strength: 14,
      dexterity: 16,
      constitution: 13,
      intelligence: 10,
      wisdom: 15,
      charisma: 8,
    },
    equipment: ['Longbow', 'Shortsword', 'Leather Armor', 'Quiver'],
    description: 'A skilled ranger, at home in the wilderness and deadly with a bow.',
  },
  {
    id: 'half-elf-paladin',
    name: 'Holy Knight',
    race: 'Half-Elf',
    class: 'Paladin',
    level: 1,
    abilityScores: {
      strength: 16,
      dexterity: 10,
      constitution: 14,
      intelligence: 8,
      wisdom: 12,
      charisma: 15,
    },
    equipment: ['Longsword', 'Shield', 'Chain Mail', 'Holy Symbol'],
    description: 'A righteous paladin, sworn to uphold justice and vanquish evil.',
  },
];

export interface Race {
  id: string;
  name: string;
  description: string;
  abilityScoreIncrease: Partial<AbilityScores>;
  speed: number;
  size: 'Small' | 'Medium';
}

export const RACES: Race[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile and ambitious, humans are the most adaptable race.',
    abilityScoreIncrease: { strength: 1, dexterity: 1, constitution: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    speed: 30,
    size: 'Medium',
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful and long-lived, elves are masters of magic and archery.',
    abilityScoreIncrease: { dexterity: 2, intelligence: 1 },
    speed: 30,
    size: 'Medium',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Stout and resilient, dwarves are skilled craftsmen and warriors.',
    abilityScoreIncrease: { constitution: 2, strength: 2 },
    speed: 25,
    size: 'Medium',
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small and nimble, halflings are lucky and brave beyond their size.',
    abilityScoreIncrease: { dexterity: 2, charisma: 1 },
    speed: 25,
    size: 'Small',
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Dragon-descended warriors with breath weapons and draconic ancestry.',
    abilityScoreIncrease: { strength: 2, charisma: 1 },
    speed: 30,
    size: 'Medium',
  },
  {
    id: 'gnome',
    name: 'Gnome',
    description: 'Small and inventive, gnomes are curious tinkerers and illusionists.',
    abilityScoreIncrease: { intelligence: 2, dexterity: 1 },
    speed: 25,
    size: 'Small',
  },
  {
    id: 'half-elf',
    name: 'Half-Elf',
    description: 'Combining human ambition with elven grace, half-elves are diplomatic and versatile.',
    abilityScoreIncrease: { charisma: 2, dexterity: 1, intelligence: 1 },
    speed: 30,
    size: 'Medium',
  },
  {
    id: 'half-orc',
    name: 'Half-Orc',
    description: 'Powerful and fierce, half-orcs combine orcish strength with human adaptability.',
    abilityScoreIncrease: { strength: 2, constitution: 1 },
    speed: 30,
    size: 'Medium',
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Infernal heritage grants tieflings a commanding presence and innate magic.',
    abilityScoreIncrease: { charisma: 2, intelligence: 1 },
    speed: 30,
    size: 'Medium',
  },
];

export interface Class {
  id: string;
  name: string;
  description: string;
  hitDie: number;
  primaryAbility: keyof AbilityScores;
  savingThrows: (keyof AbilityScores)[];
  equipment: string[];
}

export const CLASSES: Class[] = [
  {
    id: 'barbarian',
    name: 'Barbarian',
    description: 'A fierce warrior who channels rage to devastating effect in combat.',
    hitDie: 12,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    equipment: ['Greataxe', 'Handaxe (2)', 'Javelin (4)', "Explorer's Pack"],
  },
  {
    id: 'bard',
    name: 'Bard',
    description: 'A charismatic performer who weaves magic through music and words.',
    hitDie: 8,
    primaryAbility: 'charisma',
    savingThrows: ['dexterity', 'charisma'],
    equipment: ['Rapier', 'Lute', 'Leather Armor', "Entertainer's Pack"],
  },
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'A divine spellcaster who channels the power of their deity.',
    hitDie: 8,
    primaryAbility: 'wisdom',
    savingThrows: ['wisdom', 'charisma'],
    equipment: ['Mace', 'Scale Mail', 'Shield', 'Holy Symbol'],
  },
  {
    id: 'druid',
    name: 'Druid',
    description: 'A nature priest who can shapeshift and command natural forces.',
    hitDie: 8,
    primaryAbility: 'wisdom',
    savingThrows: ['intelligence', 'wisdom'],
    equipment: ['Wooden Shield', 'Scimitar', 'Leather Armor', 'Druidic Focus'],
  },
  {
    id: 'fighter',
    name: 'Fighter',
    description: 'A master of martial combat, skilled with weapons and armor.',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrows: ['strength', 'constitution'],
    equipment: ['Longsword', 'Shield', 'Chain Mail', 'Crossbow'],
  },
  {
    id: 'monk',
    name: 'Monk',
    description: 'A master of unarmed combat who harnesses ki energy.',
    hitDie: 8,
    primaryAbility: 'dexterity',
    savingThrows: ['strength', 'dexterity'],
    equipment: ['Shortsword', 'Dart (10)', "Explorer's Pack"],
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'A holy warrior bound by sacred oaths, wielding divine magic.',
    hitDie: 10,
    primaryAbility: 'strength',
    savingThrows: ['wisdom', 'charisma'],
    equipment: ['Longsword', 'Shield', 'Chain Mail', 'Javelin (5)'],
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'A wilderness warrior who tracks foes and wields nature magic.',
    hitDie: 10,
    primaryAbility: 'dexterity',
    savingThrows: ['strength', 'dexterity'],
    equipment: ['Longbow', 'Quiver (20 arrows)', 'Shortsword', 'Leather Armor'],
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'A cunning scoundrel who relies on stealth and precision.',
    hitDie: 8,
    primaryAbility: 'dexterity',
    savingThrows: ['dexterity', 'intelligence'],
    equipment: ['Rapier', 'Shortbow', 'Leather Armor', "Thieves' Tools"],
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    description: 'An innate spellcaster who draws magic from their bloodline.',
    hitDie: 6,
    primaryAbility: 'charisma',
    savingThrows: ['constitution', 'charisma'],
    equipment: ['Dagger (2)', 'Component Pouch', 'Light Crossbow', "Dungeoneer's Pack"],
  },
  {
    id: 'warlock',
    name: 'Warlock',
    description: 'A spellcaster who gains power through a pact with an otherworldly entity.',
    hitDie: 8,
    primaryAbility: 'charisma',
    savingThrows: ['wisdom', 'charisma'],
    equipment: ['Light Crossbow', 'Leather Armor', 'Dagger (2)', 'Component Pouch'],
  },
  {
    id: 'wizard',
    name: 'Wizard',
    description: 'A scholarly magic-user who learns spells through study and practice.',
    hitDie: 6,
    primaryAbility: 'intelligence',
    savingThrows: ['intelligence', 'wisdom'],
    equipment: ['Quarterstaff', 'Spellbook', 'Component Pouch', "Scholar's Pack"],
  },
];

export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function calculateHP(classData: Class, constitution: number): number {
  return classData.hitDie + calculateModifier(constitution);
}

export function calculateAC(dexterity: number): number {
  return 10 + calculateModifier(dexterity);
}
