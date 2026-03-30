import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from .env file
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get migration file path from command line arguments
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Please provide a migration file path');
  console.error('Usage: node applyMigration.js <migration-file-path>');
  process.exit(1);
}

// Read migration file
try {
  const migrationSql = fs.readFileSync(path.resolve(migrationFile), 'utf8');
  
  // Apply migration
  applyMigration(migrationSql)
    .then(() => {
      console.log(`Migration ${migrationFile} applied successfully`);
    })
    .catch(error => {
      console.error(`Error applying migration ${migrationFile}:`, error);
      process.exit(1);
    });
} catch (error) {
  console.error(`Error reading migration file ${migrationFile}:`, error);
  process.exit(1);
}

// Function to apply a migration
async function applyMigration(migrationSql) {
  try {
    // Execute SQL directly using RPC
    const { error } = await supabase.rpc('exec_sql', { query: migrationSql });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error executing SQL:', error);
    throw error;
  }
}