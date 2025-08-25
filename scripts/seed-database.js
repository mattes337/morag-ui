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

// Import dependencies - handle both development and production environments
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let DatabaseSeeder;

// Embedded DatabaseSeeder class for production environments
class EmbeddedDatabaseSeeder {
  static async seedDefaultUser(options = {}) {
    const prisma = new PrismaClient();

    const {
      defaultApiKey = process.env.DEFAULT_API_KEY || 'default-api-key',
      defaultUserEmail = process.env.DEFAULT_USER_EMAIL || 'admin@morag.local',
      defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || 'admin123',
      defaultUserName = process.env.DEFAULT_USER_NAME || 'Default Admin',
      force = false
    } = options;

    // Only seed if database is empty (unless force is true)
    if (!force) {
      const status = await this.checkSeeding();
      if (!status.isEmpty) {
        console.log('✅ Database already contains data, skipping seeding');
        await prisma.$disconnect();
        return {
          user: null,
          apiKey: null,
          genericApiKey: null,
          realm: null,
          created: false
        };
      }
    }

    console.log('🌱 Starting database seeding...');

    try {
      // Check if default user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: defaultUserEmail },
        include: {
          apiKeys: true,
          realms: true,
        }
      });

      if (existingUser && !force) {
        console.log(`✅ Default user already exists: ${existingUser.email}`);

        // Check if API key exists
        const existingApiKey = await prisma.apiKey.findUnique({
          where: { key: defaultApiKey }
        });

        if (existingApiKey) {
          console.log(`✅ Default API key already exists`);
          return {
            user: existingUser,
            apiKey: existingApiKey,
            realm: existingUser.realms[0] || null,
            created: false
          };
        }
      }

      // Create or update user
      let user;
      if (existingUser && force) {
        console.log(`🔄 Updating existing user: ${defaultUserEmail}`);
        user = await prisma.user.update({
          where: { email: defaultUserEmail },
          data: {
            name: defaultUserName,
            role: 'ADMIN',
          },
          include: {
            apiKeys: true,
            realms: true,
          }
        });
      } else if (!existingUser) {
        console.log(`👤 Creating default user: ${defaultUserEmail}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(defaultUserPassword, 12);

        user = await prisma.user.create({
          data: {
            email: defaultUserEmail,
            name: defaultUserName,
            role: 'ADMIN',
            password: hashedPassword,
          },
          include: {
            apiKeys: true,
            realms: true,
          }
        });
      } else {
        user = existingUser;
      }

      // Create default realm if it doesn't exist
      let defaultRealm = user.realms.find(r => r.isDefault);
      if (!defaultRealm) {
        console.log(`🏰 Creating default realm for user: ${user.email}`);
        defaultRealm = await prisma.realm.create({
          data: {
            name: 'Default Realm',
            description: 'Default realm for initial setup',
            ownerId: user.id,
            isDefault: true,
            documentCount: 0,
            lastUpdated: new Date(),
          }
        });

        // Create user-realm relationship
        await prisma.userRealm.create({
          data: {
            userId: user.id,
            realmId: defaultRealm.id,
            role: 'OWNER',
          }
        });
      }

      // Create or update default API key
      let apiKey;
      const existingApiKey = await prisma.apiKey.findUnique({
        where: { key: defaultApiKey }
      });

      if (existingApiKey && force) {
        console.log(`🔄 Updating default API key`);
        apiKey = await prisma.apiKey.update({
          where: { key: defaultApiKey },
          data: {
            name: 'Default API Key',
            userId: user.id,
            realmId: defaultRealm.id,
            isGeneric: false,
            lastUsed: null,
          }
        });
      } else if (!existingApiKey) {
        console.log(`🔑 Creating default API key: ${defaultApiKey}`);
        apiKey = await prisma.apiKey.create({
          data: {
            name: 'Default API Key',
            key: defaultApiKey,
            userId: user.id,
            realmId: defaultRealm.id,
            isGeneric: false,
          }
        });
      } else {
        apiKey = existingApiKey;
      }

      // Create generic API key if specified in environment
      let genericApiKey = null;
      const genericKey = process.env.GENERIC_API_KEY;
      if (genericKey) {
        const existingGenericKey = await prisma.apiKey.findUnique({
          where: { key: genericKey }
        });

        if (!existingGenericKey) {
          console.log(`🌐 Creating generic API key: ${genericKey}`);
          genericApiKey = await prisma.apiKey.create({
            data: {
              name: 'Generic API Key',
              key: genericKey,
              userId: user.id,
              realmId: null,
              isGeneric: true,
            }
          });
        } else {
          genericApiKey = existingGenericKey;
        }
      }

      console.log('✅ Database seeding completed successfully!');
      console.log(`📧 Default user: ${user.email}`);
      console.log(`🔑 Default API key: ${defaultApiKey}`);
      if (genericApiKey) {
        console.log(`🌐 Generic API key: ${genericKey}`);
      }
      console.log(`🏰 Default realm: ${defaultRealm.name} (${defaultRealm.id})`);

      return {
        user,
        apiKey,
        genericApiKey,
        realm: defaultRealm,
        created: true
      };

    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    } finally {
      await prisma.$disconnect();
    }
  }

  static async checkSeeding() {
    const prisma = new PrismaClient();

    try {
      const userCount = await prisma.user.count();
      const realmCount = await prisma.realm.count();
      const apiKeyCount = await prisma.apiKey.count();

      console.log('📊 Database status:');
      console.log(`   Users: ${userCount}`);
      console.log(`   Realms: ${realmCount}`);
      console.log(`   API Keys: ${apiKeyCount}`);

      return {
        users: userCount,
        realms: realmCount,
        apiKeys: apiKeyCount,
        isEmpty: userCount === 0 && realmCount === 0 && apiKeyCount === 0
      };
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Initialize DatabaseSeeder - try TypeScript version first, fallback to embedded
try {
  // Try to import the TypeScript seeder first (development)
  if (process.env.NODE_ENV !== 'production') {
    try {
      require('ts-node/register');
      DatabaseSeeder = require('../lib/database/seeder.ts').DatabaseSeeder;
      console.log('📦 Using TypeScript seeder for development...');
    } catch (tsError) {
      // Fall back to embedded implementation
      DatabaseSeeder = EmbeddedDatabaseSeeder;
      console.log('📦 Using embedded seeder implementation...');
    }
  } else {
    // Production - use embedded implementation
    DatabaseSeeder = EmbeddedDatabaseSeeder;
    console.log('📦 Using embedded seeder for production...');
  }
} catch (error) {
  console.error('❌ Could not initialize DatabaseSeeder:', error.message);
  process.exit(1);
}

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
        console.log('✅ Database contains data - seeding will be skipped');
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

    if (!result.created && !options.force) {
      console.log('\n✅ Database already contains data - no seeding needed');
      console.log('\nTo force recreate: npm run seed -- --force');
      console.log('To check status: npm run seed:check');
    } else {
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
