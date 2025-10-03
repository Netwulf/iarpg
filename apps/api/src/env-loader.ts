/**
 * Environment variable loader
 * Must be imported FIRST in server.ts before any other imports
 */
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

// Verify critical environment variables are set
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please check your .env file');
  process.exit(1);
}

export {}; // Make this a module
