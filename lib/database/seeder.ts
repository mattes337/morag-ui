import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export interface SeedOptions {
  defaultApiKey?: string;
  defaultUserEmail?: string;
  defaultUserPassword?: string;
  defaultUserName?: string;
  force?: boolean; // Force recreate even if exists
}

export class DatabaseSeeder {
  static async seedDefaultUser(options: SeedOptions = {}) {
    // Only seed if database is empty (unless force is true)
    if (!options.force) {
      const status = await this.checkSeeding();
      if (!status.isEmpty) {
        console.log('✅ Database already contains data, skipping seeding');
        return {
          user: null,
          apiKey: null,
          genericApiKey: null,
          realm: null,
          created: false
        };
      }
    }
    const {
      defaultApiKey = process.env.DEFAULT_API_KEY || 'default-api-key',
      defaultUserEmail = process.env.DEFAULT_USER_EMAIL || 'admin@morag.local',
      defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || 'admin123',
      defaultUserName = process.env.DEFAULT_USER_NAME || 'Default Admin',
      force = false
    } = options;

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
    }
  }

  static async seedGenericApiKey(apiKey: string, userId?: string) {
    console.log(`🌐 Creating generic API key: ${apiKey}`);

    // If no userId provided, use the first admin user
    let targetUserId = userId;
    if (!targetUserId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      if (!adminUser) {
        throw new Error('No admin user found. Please create a user first.');
      }
      targetUserId = adminUser.id;
    }

    const existingKey = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    });

    if (existingKey) {
      console.log(`✅ Generic API key already exists`);
      return existingKey;
    }

    const genericApiKey = await prisma.apiKey.create({
      data: {
        name: 'Generic API Key',
        key: apiKey,
        userId: targetUserId,
        realmId: null,
        isGeneric: true,
      }
    });

    console.log(`✅ Generic API key created successfully`);
    return genericApiKey;
  }

  static async checkSeeding() {
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
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const force = args.includes('--force');
  
  DatabaseSeeder.seedDefaultUser({ force })
    .then(() => {
      console.log('🎉 Seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
