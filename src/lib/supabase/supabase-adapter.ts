import { supabase } from './supabase';
import type { DatabaseAdapter } from '../database-adapter';
import type { Card, BlockType, Reading } from '@/src/interfaces';

export class SupabaseAdapter implements DatabaseAdapter {
  async getAllCards(): Promise<Card[]> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('id');

    if (error) throw error;
    return data;
  }

  async getCardById(id: number): Promise<Card | null> {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  async getAllBlockTypes(): Promise<BlockType[]> {
    const { data, error } = await supabase
      .from('block_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }

  async getBlockTypeById(id: string): Promise<BlockType | null> {
    const { data, error } = await supabase
      .from('block_types')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }

  async createReading(
    reading: Omit<Reading, 'id' | 'created_at'>
  ): Promise<Reading> {
    const { data, error } = await supabase
      .from('insights')
      .insert(reading)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserReadings(userId?: string): Promise<Reading[]> {
    let query = supabase
      .from('insights')
      .select('*')
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
  }

  async getReadingById(id: number): Promise<Reading | null> {
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No rows returned
      throw error;
    }
    return data;
  }
}
