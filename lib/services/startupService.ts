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

        try {
          // Attempt to seed the database (will only seed if empty)
          console.log('📦 Checking database and seeding if needed...');
          await DatabaseSeeder.seedDefaultUser();
        } catch (seedError) {
          const errorMessage = seedError instanceof Error ? seedError.message : 'Unknown error';
          console.warn('⚠️ Auto-seeding failed, but application will continue:', errorMessage);
          // Continue without seeding - the app should still work
        }
      } else {
        console.log('⏭️ Auto-seeding is disabled');
      }

      this.initialized = true;
      console.log('✅ Morag application initialization completed');

    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      // Don't throw - let the app start even if seeding fails
      this.initialized = true; // Mark as initialized anyway
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
