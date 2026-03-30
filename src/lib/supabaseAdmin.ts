import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a Supabase client for direct database operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  }
});

// Function to execute SQL directly
export async function executeSql(sql: string) {
  try {
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { query: sql });
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error executing SQL:', error);
    return { data: null, error };
  }
}

// Function to apply a migration
export async function applyMigration(migrationSql: string) {
  return executeSql(migrationSql);
}