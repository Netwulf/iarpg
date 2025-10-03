import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'test@iarpg.com' },
    update: {},
    create: {
      email: 'test@iarpg.com',
      username: 'testuser',
      passwordHash: await bcrypt.hash('password123', 10),
      tier: 'free',
      bio: 'Test user for development',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'dm@iarpg.com' },
    update: {},
    create: {
      email: 'dm@iarpg.com',
      username: 'testdm',
      passwordHash: await bcrypt.hash('password123', 10),
      tier: 'premium',
      bio: 'Test dungeon master',
    },
  });

  console.log(`✅ Created users: ${user1.username}, ${user2.username}`);

  // Create test characters
  const character1 = await prisma.character.upsert({
    where: { id: 'test-char-1' },
    update: {},
    create: {
      id: 'test-char-1',
      userId: user1.id,
      name: 'Thorin Ironforge',
      race: 'Dwarf',
      class: 'Fighter',
      level: 5,
      strength: 16,
      dexterity: 14,
      constitution: 15,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
      proficiencyBonus: 3,
      hp: 42,
      maxHp: 42,
      ac: 18,
      initiative: 2,
      background: 'Soldier',
      proficiencies: JSON.stringify(['Athletics', 'Intimidation', 'Survival']),
      spells: JSON.stringify([]),
      equipment: JSON.stringify([
        { name: 'Longsword', type: 'weapon', equipped: true },
        { name: 'Shield', type: 'armor', equipped: true },
        { name: 'Plate Armor', type: 'armor', equipped: true },
      ]),
    },
  });

  const character2 = await prisma.character.upsert({
    where: { id: 'test-char-2' },
    update: {},
    create: {
      id: 'test-char-2',
      userId: user1.id,
      name: 'Elara Moonwhisper',
      race: 'Elf',
      class: 'Wizard',
      level: 5,
      strength: 8,
      dexterity: 14,
      constitution: 12,
      intelligence: 18,
      wisdom: 13,
      charisma: 10,
      proficiencyBonus: 3,
      hp: 28,
      maxHp: 28,
      ac: 12,
      initiative: 2,
      background: 'Sage',
      proficiencies: JSON.stringify(['Arcana', 'History', 'Investigation']),
      spells: JSON.stringify([
        { name: 'Fireball', level: 3, school: 'Evocation' },
        { name: 'Magic Missile', level: 1, school: 'Evocation' },
        { name: 'Shield', level: 1, school: 'Abjuration' },
      ]),
      equipment: JSON.stringify([
        { name: 'Spellbook', type: 'focus', equipped: true },
        { name: 'Robes', type: 'armor', equipped: true },
      ]),
    },
  });

  console.log(`✅ Created characters: ${character1.name}, ${character2.name}`);

  // Create test table
  const table1 = await prisma.table.upsert({
    where: { inviteCode: 'TEST123' },
    update: {},
    create: {
      ownerId: user2.id,
      name: 'The Lost Mines of Phandelver',
      description: 'A classic D&D adventure for new and experienced players alike.',
      playStyle: 'sync',
      privacy: 'public',
      inviteCode: 'TEST123',
      state: 'active',
      maxPlayers: 6,
      tags: ['beginner-friendly', 'combat', 'roleplay'],
      rulesVariant: 'standard',
    },
  });

  console.log(`✅ Created table: ${table1.name}`);

  // Add members to table
  await prisma.tableMember.upsert({
    where: { id: 'test-member-1' },
    update: {},
    create: {
      id: 'test-member-1',
      tableId: table1.id,
      userId: user2.id,
      characterId: character1.id,
      role: 'dm',
    },
  });

  await prisma.tableMember.upsert({
    where: { id: 'test-member-2' },
    update: {},
    create: {
      id: 'test-member-2',
      tableId: table1.id,
      userId: user1.id,
      characterId: character2.id,
      role: 'player',
    },
  });

  console.log('✅ Added members to table');

  // Create some test messages
  await prisma.message.create({
    data: {
      tableId: table1.id,
      userId: user2.id,
      type: 'system',
      content: 'Welcome to The Lost Mines of Phandelver!',
    },
  });

  await prisma.message.create({
    data: {
      tableId: table1.id,
      userId: user1.id,
      characterId: character2.id,
      type: 'ic',
      content: 'Elara looks around cautiously, her hand resting on her spellbook.',
    },
  });

  console.log('✅ Created test messages');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
