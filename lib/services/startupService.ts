import { DatabaseSeeder } from '../database/seeder';

export class StartupService {
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  static async initialize() {
    // Prevent multiple initializations
    if (this.initialized) {
      return;
    }

    // If initialization is already in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.performInitialization();
    return this.initPromise;
  }

  private static async performInitialization() {
    try {
      console.log('🚀 Starting Morag application initialization...');

      // Check if auto-seeding is enabled
      const autoSeed = process.env.AUTO_SEED_DATABASE !== 'false'; // Default to true
      
      if (autoSeed) {
        console.log('🌱 Auto-seeding is enabled');
        
        // Check current database state
        const status = await DatabaseSeeder.checkSeeding();
        
        if (status.isEmpty) {
          console.log('📦 Database is empty, performing initial seeding...');
          await DatabaseSeeder.seedDefaultUser();
        } else {
          console.log('✅ Database already contains data, skipping seeding');
          
          // Still check if default API key exists
          const defaultApiKey = process.env.DEFAULT_API_KEY;
          if (defaultApiKey) {
            try {
              await this.ensureDefaultApiKey(defaultApiKey);
            } catch (error) {
              console.warn('⚠️ Could not ensure default API key:', error);
            }
          }
        }
      } else {
        console.log('⏭️ Auto-seeding is disabled');
      }

      this.initialized = true;
      console.log('✅ Morag application initialization completed');

    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      // Don't throw - let the app start even if seeding fails
    }
  }

  private static async ensureDefaultApiKey(apiKey: string) {
    const { prisma } = await import('../database');
    
    const existingKey = await prisma.apiKey.findUnique({
      where: { key: apiKey }
    });

    if (!existingKey) {
      console.log('🔑 Creating missing default API key...');
      await DatabaseSeeder.seedDefaultUser({ 
        defaultApiKey: apiKey,
        force: false 
      });
    }
  }

  static async ensureGenericApiKey() {
    const genericKey = process.env.GENERIC_API_KEY;
    if (!genericKey) {
      return null;
    }

    try {
      return await DatabaseSeeder.seedGenericApiKey(genericKey);
    } catch (error) {
      console.warn('⚠️ Could not create generic API key:', error);
      return null;
    }
  }

  static getDefaultCredentials() {
    return {
      email: process.env.DEFAULT_USER_EMAIL || 'admin@morag.local',
      password: process.env.DEFAULT_USER_PASSWORD || 'admin123',
      apiKey: process.env.DEFAULT_API_KEY || 'default-api-key',
      genericApiKey: process.env.GENERIC_API_KEY || null,
    };
  }

  static isAutoSeedEnabled() {
    return process.env.AUTO_SEED_DATABASE !== 'false';
  }
}
