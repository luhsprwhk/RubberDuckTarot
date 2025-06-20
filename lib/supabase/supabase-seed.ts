import { readFileSync } from 'fs';
import { resolve } from 'path';
import { supabase } from './supabase';

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

async function seedSupabase() {
  try {
    console.log('🌱 Starting Supabase database seeding...');

    // Read the existing JSON data
    const jsonPath = resolve('../data/cards.json');
    const jsonData = JSON.parse(readFileSync(jsonPath, 'utf8')) as JsonData;

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('cards').delete().neq('id', 0);
    await supabase.from('block_types').delete().neq('id', '');

    // Insert block types
    console.log('📦 Inserting block types...');
    const { error: blockTypesError } = await supabase
      .from('block_types')
      .insert(jsonData.block_types);

    if (blockTypesError) {
      throw blockTypesError;
    }
    console.log(`✅ Inserted ${jsonData.block_types.length} block types`);

    // Insert cards
    console.log('🎴 Inserting cards...');
    const { error: cardsError } = await supabase
      .from('cards')
      .insert(jsonData.cards);

    if (cardsError) {
      throw cardsError;
    }
    console.log(`✅ Inserted ${jsonData.cards.length} cards`);

    console.log('🎉 Supabase database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Supabase database:', error);
    process.exit(1);
  }
}

seedSupabase();
