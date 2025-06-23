import { readFileSync } from 'fs';
import { resolve } from 'path';
import { supabase } from './supabase-node';
import type { Card, BlockType } from './supabase-schema';

interface JsonData {
  cards: Card[];
}

async function seedSupabase() {
  try {
    console.log('🌱 Starting Supabase database seeding...');

    // Read cards data
    const cardsJsonPath = resolve('./data/cards.json');
    const cardsData = JSON.parse(
      readFileSync(cardsJsonPath, 'utf8')
    ) as JsonData;

    // Read block types data
    const blockTypesJsonPath = resolve('./data/block_types.json');
    const blockTypesData = JSON.parse(
      readFileSync(blockTypesJsonPath, 'utf8')
    ) as BlockType[];

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await supabase.from('cards').delete().neq('id', 0);
    await supabase.from('block_types').delete().neq('id', '');

    // Insert block types
    console.log('📦 Inserting block types...');
    const { error: blockTypesError } = await supabase
      .from('block_types')
      .insert(blockTypesData);

    if (blockTypesError) {
      throw blockTypesError;
    }
    console.log(`✅ Inserted ${blockTypesData.length} block types`);

    // Insert cards
    console.log('🎴 Inserting cards...');
    const { error: cardsError } = await supabase
      .from('cards')
      .insert(cardsData.cards);

    if (cardsError) {
      throw cardsError;
    }
    console.log(`✅ Inserted ${cardsData.cards.length} cards`);

    console.log('🎉 Supabase database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding Supabase database:', error);
    process.exit(1);
  }
}

seedSupabase();
