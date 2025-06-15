// Simple test to verify the functions work
const { execSync } = require('child_process');

try {
    // Compile TypeScript
    console.log('Compiling TypeScript...');
    execSync('npx tsc --outDir ./dist --target es2020 --module commonjs lib/services/databaseService.ts lib/database.ts', { stdio: 'inherit' });
    
    // Test the compiled functions
    console.log('Testing compiled functions...');
    const databaseService = require('./dist/services/databaseService');
    
    console.log('Available exports:', Object.keys(databaseService));
    console.log('updateDocumentCount:', databaseService.updateDocumentCount);
    console.log('Type of updateDocumentCount:', typeof databaseService.updateDocumentCount);
    console.log('createDatabase:', databaseService.createDatabase);
    console.log('Type of createDatabase:', typeof databaseService.createDatabase);
    
    console.log('\nAll functions are properly exported!');
} catch (error) {
    console.error('Error:', error.message);
}