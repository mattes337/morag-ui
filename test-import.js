// Simple test to check DatabaseService import
const { execSync } = require('child_process');

try {
  // First compile the TypeScript
  console.log('Compiling TypeScript...');
  execSync('npx tsc --outDir ./dist --target es2020 --module commonjs lib/services/databaseService.ts lib/database.ts', { stdio: 'inherit' });
  
  // Now try to require the compiled JS
  console.log('\nTesting compiled JavaScript...');
  const { DatabaseService } = require('./dist/services/databaseService');
  console.log('DatabaseService:', DatabaseService);
  console.log('Methods:', Object.getOwnPropertyNames(DatabaseService));
  console.log('updateDocumentCount:', DatabaseService.updateDocumentCount);
  console.log('Type of updateDocumentCount:', typeof DatabaseService.updateDocumentCount);
} catch (error) {
  console.error('Error:', error.message);
}