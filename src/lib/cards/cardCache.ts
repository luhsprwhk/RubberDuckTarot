import type { Card } from '@/src/interfaces';

interface CacheData {
  cards: Card[];
  version: string;
  timestamp: number;
}

const CACHE_KEY = 'tarot_cards_cache';
const CACHE_VERSION_KEY = 'tarot_cards_version';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Disable card cache in development for easier debugging
const IS_DEV =
  import.meta.env.MODE === 'development' ||
  process.env.NODE_ENV === 'development';

export const cardCache = {
  get: (): CacheData | null => {
    if (IS_DEV) {
      // No caching in dev
      return null;
    }
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const version = localStorage.getItem(CACHE_VERSION_KEY);

      if (!cached || !version) {
        return null;
      }

      const data: CacheData = JSON.parse(cached);

      // Check if cache is expired
      if (Date.now() - data.timestamp > CACHE_DURATION) {
        cardCache.clear();
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading card cache:', error);
      cardCache.clear();
      return null;
    }
  },

  set: (cards: Card[], version: string): void => {
    if (IS_DEV) {
      // No caching in dev
      return;
    }
    try {
      const data: CacheData = {
        cards,
        version,
        timestamp: Date.now(),
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_VERSION_KEY, version);
    } catch (error) {
      console.error('Error saving card cache:', error);
    }
  },

  clear: (): void => {
    if (IS_DEV) {
      // No caching in dev
      return;
    }
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_VERSION_KEY);
    } catch (error) {
      console.error('Error clearing card cache:', error);
    }
  },

  isValid: (currentVersion: string): boolean => {
    const cached = cardCache.get();
    return cached !== null && cached.version === currentVersion;
  },
};
