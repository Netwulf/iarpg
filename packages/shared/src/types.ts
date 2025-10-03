export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  level: number;
}

export interface Table {
  id: string;
  name: string;
  masterId: string;
  createdAt: Date;
}

export interface Combatant {
  id: string;
  characterId?: string | null;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  isNPC: boolean;
  position: number;
  character?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  } | null;
}

export interface CombatEncounter {
  id: string;
  tableId: string;
  name: string;
  round: number;
  currentTurn: number;
  state: string;
  combatants: Combatant[];
  createdAt: string;
  endedAt?: string | null;
}
