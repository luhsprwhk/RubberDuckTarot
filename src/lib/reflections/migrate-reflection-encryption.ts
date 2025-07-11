/**
 * Migration utility to encrypt existing unencrypted reflection data
 * This should be run once when deploying the reflection encryption feature
 */

import { supabase } from '../supabase/supabase';
import { encryptForDatabase, decryptFromDatabase } from '../encryption';

interface MigrationStats {
  totalReflections: number;
  encryptedReflections: number;
  skippedReflections: number;
  failedReflections: number;
  errors: string[];
}

/**
 * Checks if a reflection text is already encrypted
 */
async function isAlreadyEncrypted(reflectionText: string): Promise<boolean> {
  try {
    // Try to parse as JSON - if it succeeds and has the right structure, it's encrypted
    const parsed = JSON.parse(reflectionText);
    return !!(parsed.encrypted && parsed.iv && parsed.salt);
  } catch {
    // If JSON parsing fails, it's not encrypted
    return false;
  }
}

interface ReflectionRecord {
  id: number;
  reflection_text: string;
}

/**
 * Migrates a batch of reflections to encrypted format
 */
async function migrateBatch(
  reflections: ReflectionRecord[],
  stats: MigrationStats,
  dryRun: boolean = false
): Promise<void> {
  console.log(`Processing batch of ${reflections.length} reflections...`);

  for (const reflection of reflections) {
    try {
      // Check if already encrypted
      if (await isAlreadyEncrypted(reflection.reflection_text)) {
        console.log(`Skipping reflection ${reflection.id} - already encrypted`);
        stats.skippedReflections++;
        continue;
      }

      // Encrypt the reflection text
      const encryptedText = await encryptForDatabase(
        reflection.reflection_text
      );

      if (!encryptedText) {
        console.warn(
          `Failed to encrypt reflection ${reflection.id} - encryption returned null`
        );
        stats.failedReflections++;
        stats.errors.push(
          `Reflection ${reflection.id}: Encryption returned null`
        );
        continue;
      }

      // Verify encryption worked by trying to decrypt
      const decryptedText = await decryptFromDatabase(encryptedText);
      if (decryptedText !== reflection.reflection_text) {
        console.error(
          `Encryption verification failed for reflection ${reflection.id}`
        );
        stats.failedReflections++;
        stats.errors.push(
          `Reflection ${reflection.id}: Encryption verification failed`
        );
        continue;
      }

      if (!dryRun) {
        // Update the database with encrypted data
        const { error } = await supabase
          .from('user_card_reflections')
          .update({
            reflection_text: encryptedText,
            updated_at: new Date().toISOString(),
          })
          .eq('id', reflection.id);

        if (error) {
          console.error(
            `Database update failed for reflection ${reflection.id}:`,
            error
          );
          stats.failedReflections++;
          stats.errors.push(
            `Reflection ${reflection.id}: Database update failed - ${error.message}`
          );
          continue;
        }
      }

      console.log(
        `✓ ${dryRun ? 'Would encrypt' : 'Encrypted'} reflection ${reflection.id}`
      );
      stats.encryptedReflections++;
    } catch (error) {
      console.error(`Error processing reflection ${reflection.id}:`, error);
      stats.failedReflections++;
      stats.errors.push(
        `Reflection ${reflection.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

/**
 * Main migration function
 */
export async function migrateReflectionEncryption(
  options: {
    dryRun?: boolean;
    batchSize?: number;
    maxReflections?: number;
  } = {}
): Promise<MigrationStats> {
  const { dryRun = false, batchSize = 100, maxReflections } = options;

  console.log(`Starting reflection encryption migration...`);
  console.log(`Dry run: ${dryRun}`);
  console.log(`Batch size: ${batchSize}`);
  if (maxReflections) console.log(`Max reflections: ${maxReflections}`);

  const stats: MigrationStats = {
    totalReflections: 0,
    encryptedReflections: 0,
    skippedReflections: 0,
    failedReflections: 0,
    errors: [],
  };

  try {
    // Get total count first
    const { count, error: countError } = await supabase
      .from('user_card_reflections')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new Error(`Failed to count reflections: ${countError.message}`);
    }

    const totalCount = count || 0;
    stats.totalReflections = maxReflections
      ? Math.min(totalCount, maxReflections)
      : totalCount;

    console.log(`Found ${totalCount} total reflections`);
    console.log(`Will process ${stats.totalReflections} reflections`);

    if (stats.totalReflections === 0) {
      console.log('No reflections to process');
      return stats;
    }

    // Process in batches
    let offset = 0;
    let processedCount = 0;

    while (processedCount < stats.totalReflections) {
      const remainingCount = stats.totalReflections - processedCount;
      const currentBatchSize = Math.min(batchSize, remainingCount);

      console.log(`\n--- Batch ${Math.floor(offset / batchSize) + 1} ---`);
      console.log(
        `Processing reflections ${offset + 1} to ${offset + currentBatchSize}`
      );

      // Fetch batch
      const { data, error } = await supabase
        .from('user_card_reflections')
        .select('id, reflection_text')
        .order('id', { ascending: true })
        .range(offset, offset + currentBatchSize - 1);

      if (error) {
        throw new Error(`Failed to fetch batch: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('No more reflections to process');
        break;
      }

      // Process batch
      await migrateBatch(data, stats, dryRun);

      offset += currentBatchSize;
      processedCount += data.length;

      // Add a small delay between batches to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Total reflections: ${stats.totalReflections}`);
    console.log(`Encrypted: ${stats.encryptedReflections}`);
    console.log(`Skipped (already encrypted): ${stats.skippedReflections}`);
    console.log(`Failed: ${stats.failedReflections}`);

    if (stats.errors.length > 0) {
      console.log('\nErrors:');
      stats.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (dryRun) {
      console.log('\nThis was a dry run. No actual changes were made.');
    }

    return stats;
  } catch (error) {
    console.error('Migration failed:', error);
    stats.errors.push(
      `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw error;
  }
}

/**
 * Validates that all reflections are properly encrypted
 */
export async function validateReflectionEncryption(): Promise<{
  totalReflections: number;
  encryptedReflections: number;
  unencryptedReflections: number;
  invalidReflections: number;
}> {
  console.log('Validating reflection encryption...');

  const stats = {
    totalReflections: 0,
    encryptedReflections: 0,
    unencryptedReflections: 0,
    invalidReflections: 0,
  };

  let offset = 0;
  const batchSize = 100;

  while (true) {
    const { data, error } = await supabase
      .from('user_card_reflections')
      .select('id, reflection_text')
      .order('id', { ascending: true })
      .range(offset, offset + batchSize - 1);

    if (error) {
      throw new Error(`Failed to fetch reflections: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const reflection of data) {
      stats.totalReflections++;

      try {
        if (await isAlreadyEncrypted(reflection.reflection_text)) {
          // Try to decrypt to validate
          const decrypted = await decryptFromDatabase(
            reflection.reflection_text
          );
          if (decrypted) {
            stats.encryptedReflections++;
          } else {
            stats.invalidReflections++;
            console.warn(
              `Reflection ${reflection.id} appears encrypted but decryption failed`
            );
          }
        } else {
          stats.unencryptedReflections++;
          console.log(`Reflection ${reflection.id} is not encrypted`);
        }
      } catch (error) {
        stats.invalidReflections++;
        console.error(`Error validating reflection ${reflection.id}:`, error);
      }
    }

    offset += batchSize;
  }

  console.log('\n=== Validation Results ===');
  console.log(`Total reflections: ${stats.totalReflections}`);
  console.log(`Encrypted: ${stats.encryptedReflections}`);
  console.log(`Unencrypted: ${stats.unencryptedReflections}`);
  console.log(`Invalid: ${stats.invalidReflections}`);

  return stats;
}

// CLI interface for running the migration
if (
  typeof window === 'undefined' &&
  import.meta.url === new URL(import.meta.url).href
) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const validate = args.includes('--validate');
  const batchSize = parseInt(
    args.find((arg) => arg.startsWith('--batch-size='))?.split('=')[1] || '100'
  );
  const maxReflections =
    parseInt(
      args.find((arg) => arg.startsWith('--max='))?.split('=')[1] || '0'
    ) || undefined;

  if (validate) {
    validateReflectionEncryption().catch(console.error);
  } else {
    migrateReflectionEncryption({
      dryRun,
      batchSize,
      maxReflections,
    }).catch(console.error);
  }
}
