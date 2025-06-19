import { readFileSync } from 'fs';
import { resolve } from 'path';
import { db } from './connection';
import { cards, blockTypes } from './schema';

interface CardData {
  id: number;
  name: string;
  emoji: string;
  traditional_equivalent: string;
  core_meaning: string;
  duck_question: string;
  visual_description: string;
  perspective_prompts: string[];
  block_applications: {
    creative: string;
    decision: string;
    work: string;
    life: string;
    relationship: string;
  };
  duck_wisdom: string;
  reversed_meaning: string;
  tags: string[];
}

interface BlockTypeData {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

interface JsonData {
  cards: CardData[];
  block_types: BlockTypeData[];
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Read the existing JSON data
    const jsonPath = resolve('./data/cards.json');
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8')) as JsonData;

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    db.delete(cards).run();
    db.delete(blockTypes).run();

    // Insert block types
    console.log('📦 Inserting block types...');
    db.insert(blockTypes).values(jsonData.block_types).run();
    console.log(`✅ Inserted ${jsonData.block_types.length} block types`);

    // Insert cards
    console.log('🎴 Inserting cards...');
    db.insert(cards).values(jsonData.cards).run();
    console.log(`✅ Inserted ${jsonData.cards.length} cards`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
