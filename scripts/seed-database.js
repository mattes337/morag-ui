#!/usr/bin/env node

/**
 * Database seeding script for Morag
 * 
 * Usage:
 *   npm run seed                    # Seed with default values
 *   npm run seed -- --force         # Force recreate even if exists
 *   npm run seed -- --check         # Just check database status
 *   npm run seed -- --generic-only  # Only create generic API key
 */

const { DatabaseSeeder } = require('../lib/database/seeder');

async function main() {
  const args = process.argv.slice(2);
  
  const options = {
    force: args.includes('--force'),
    check: args.includes('--check'),
    genericOnly: args.includes('--generic-only'),
    help: args.includes('--help') || args.includes('-h'),
  };

  if (options.help) {
    console.log(`
🌱 Morag Database Seeder

Usage:
  npm run seed                    # Seed with default values
  npm run seed -- --force         # Force recreate even if exists  
  npm run seed -- --check         # Just check database status
  npm run seed -- --generic-only  # Only create generic API key
  npm run seed -- --help          # Show this help

Environment Variables:
  AUTO_SEED_DATABASE      # Enable/disable auto-seeding (default: true)
  DEFAULT_USER_EMAIL      # Default admin email (default: admin@morag.local)
  DEFAULT_USER_PASSWORD   # Default admin password (default: admin123)
  DEFAULT_USER_NAME       # Default admin name (default: Default Admin)
  DEFAULT_API_KEY         # Default API key (default: default-api-key)
  GENERIC_API_KEY         # Generic API key for automation (optional)

Examples:
  # Basic seeding
  npm run seed

  # Force recreate everything
  npm run seed -- --force

  # Check current database status
  npm run seed -- --check

  # Only create generic API key
  npm run seed -- --generic-only
`);
    return;
  }

  try {
    console.log('🌱 Morag Database Seeder');
    console.log('========================\n');

    if (options.check) {
      console.log('📊 Checking database status...\n');
      const status = await DatabaseSeeder.checkSeeding();
      
      if (status.isEmpty) {
        console.log('📦 Database is empty - ready for seeding');
        console.log('\nRun: npm run seed');
      } else {
        console.log('✅ Database contains data');
        console.log('\nTo force recreate: npm run seed -- --force');
      }
      return;
    }

    if (options.genericOnly) {
      const genericKey = process.env.GENERIC_API_KEY;
      if (!genericKey) {
        console.error('❌ GENERIC_API_KEY environment variable not set');
        process.exit(1);
      }
      
      console.log('🌐 Creating generic API key only...\n');
      await DatabaseSeeder.seedGenericApiKey(genericKey);
      console.log('\n✅ Generic API key created successfully!');
      return;
    }

    console.log('🚀 Starting database seeding...\n');
    
    const result = await DatabaseSeeder.seedDefaultUser({
      force: options.force
    });

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   👤 User: ${result.user.email}`);
    console.log(`   🔑 API Key: ${result.apiKey.key}`);
    if (result.genericApiKey) {
      console.log(`   🌐 Generic Key: ${result.genericApiKey.key}`);
    }
    console.log(`   🏰 Realm: ${result.realm.name}`);
    console.log(`   📊 Status: ${result.created ? 'Created' : 'Already existed'}`);

    console.log('\n🚀 You can now:');
    console.log('   • Access the API with the default API key');
    console.log('   • View API docs at: http://localhost:3000/swagger');
    console.log('   • Login to the UI with the default credentials');
    
    if (result.genericApiKey) {
      console.log('   • Use the generic API key for automation');
    }

  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('\nFull error:', error);
    }
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
main();
