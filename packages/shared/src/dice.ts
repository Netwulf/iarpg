/**
 * Dice Rolling System
 * Supports standard D&D 5e dice notation
 */

export interface ParsedNotation {
  count: number;
  sides: number;
  modifier: number;
}

export interface DiceRoll {
  notation: string;
  rolls: number[];
  total: number;
  modifier: number;
  type: 'normal' | 'advantage' | 'disadvantage' | 'critical';
  breakdown: string;
}

export class DiceRoller {
  private static readonly MAX_DICE = 20;
  private static readonly MAX_SIDES = 100;
  private static readonly NOTATION_REGEX = /^(\d+)d(\d+)([+-]\d+)?$/i;

  /**
   * Parse dice notation string into components
   * @example parseDiceNotation('3d6+5') → { count: 3, sides: 6, modifier: 5 }
   */
  static parseDiceNotation(notation: string): ParsedNotation {
    const match = notation.trim().match(this.NOTATION_REGEX);

    if (!match) {
      throw new Error(`Invalid dice notation: ${notation}`);
    }

    const count = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;

    // Validation
    if (count < 1 || count > this.MAX_DICE) {
      throw new Error(`Dice count must be between 1 and ${this.MAX_DICE}`);
    }

    if (sides < 2 || sides > this.MAX_SIDES) {
      throw new Error(`Dice sides must be between 2 and ${this.MAX_SIDES}`);
    }

    return { count, sides, modifier };
  }

  /**
   * Roll a single die
   */
  private static rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }

  /**
   * Roll multiple dice and return array of results
   */
  static rollDice(sides: number, count: number): number[] {
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(this.rollDie(sides));
    }
    return rolls;
  }

  /**
   * Roll with standard notation
   * @example roll('3d6+5') → { notation: '3d6+5', rolls: [4, 5, 3], total: 17, ... }
   */
  static roll(notation: string): DiceRoll {
    const parsed = this.parseDiceNotation(notation);
    const rolls = this.rollDice(parsed.sides, parsed.count);
    const sum = rolls.reduce((acc, val) => acc + val, 0);
    const total = sum + parsed.modifier;

    const breakdown = this.formatBreakdown(rolls, parsed.modifier);

    return {
      notation,
      rolls,
      total,
      modifier: parsed.modifier,
      type: 'normal',
      breakdown,
    };
  }

  /**
   * Roll with advantage (2d20, keep highest)
   */
  static rollWithAdvantage(notation: string): DiceRoll {
    // Extract just the d20 part if there's a modifier
    const parsed = this.parseDiceNotation(notation);

    // Roll 2 dice
    const rolls = this.rollDice(parsed.sides, 2);
    const highest = Math.max(...rolls);
    const total = highest + parsed.modifier;

    const breakdown = this.formatAdvantageBreakdown(rolls, highest, parsed.modifier);

    return {
      notation,
      rolls,
      total,
      modifier: parsed.modifier,
      type: 'advantage',
      breakdown,
    };
  }

  /**
   * Roll with disadvantage (2d20, keep lowest)
   */
  static rollWithDisadvantage(notation: string): DiceRoll {
    const parsed = this.parseDiceNotation(notation);

    // Roll 2 dice
    const rolls = this.rollDice(parsed.sides, 2);
    const lowest = Math.min(...rolls);
    const total = lowest + parsed.modifier;

    const breakdown = this.formatDisadvantageBreakdown(rolls, lowest, parsed.modifier);

    return {
      notation,
      rolls,
      total,
      modifier: parsed.modifier,
      type: 'disadvantage',
      breakdown,
    };
  }

  /**
   * Format breakdown string for display
   */
  private static formatBreakdown(rolls: number[], modifier: number): string {
    const rollsStr = rolls.join(' + ');
    const modifierStr = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
    return `[${rollsStr}]${modifierStr}`;
  }

  /**
   * Format advantage breakdown
   */
  private static formatAdvantageBreakdown(rolls: number[], highest: number, modifier: number): string {
    const rollsStr = rolls.map(r => r === highest ? `**${r}**` : r).join(', ');
    const modifierStr = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
    return `[${rollsStr}] (advantage)${modifierStr}`;
  }

  /**
   * Format disadvantage breakdown
   */
  private static formatDisadvantageBreakdown(rolls: number[], lowest: number, modifier: number): string {
    const rollsStr = rolls.map(r => r === lowest ? `**${r}**` : r).join(', ');
    const modifierStr = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
    return `[${rollsStr}] (disadvantage)${modifierStr}`;
  }

  /**
   * Check if a roll is a critical success (nat 20)
   */
  static isCriticalSuccess(roll: DiceRoll): boolean {
    return roll.notation.includes('d20') && roll.rolls.some(r => r === 20);
  }

  /**
   * Check if a roll is a critical failure (nat 1)
   */
  static isCriticalFailure(roll: DiceRoll): boolean {
    return roll.notation.includes('d20') && roll.rolls.some(r => r === 1);
  }
}
