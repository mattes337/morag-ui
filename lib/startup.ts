import { backgroundJobService } from './services/backgroundJobService';
import { jobScheduler } from './services/jobScheduler';

/**
 * Initialize background services on application startup
 */
export async function initializeBackgroundServices(): Promise<void> {
  try {
    console.log('Initializing background services...');
    
    // Start the job scheduler which will start the background processor
    const result = await jobScheduler.start();
    
    if (result.success) {
      console.log('Background job processor started successfully');
    } else {
      console.error('Failed to start background job processor:', result.error);
    }
  } catch (error) {
    console.error('Error initializing background services:', error);
  }
}

/**
 * Cleanup background services on application shutdown
 */
export async function cleanupBackgroundServices(): Promise<void> {
  try {
    console.log('Cleaning up background services...');
    
    const result = await jobScheduler.stop();
    
    if (result.success) {
      console.log('Background job processor stopped successfully');
    } else {
      console.error('Failed to stop background job processor:', result.error);
    }
  } catch (error) {
    console.error('Error cleaning up background services:', error);
  }
}

// Auto-start in production or when explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.AUTO_START_BACKGROUND_JOBS === 'true') {
  // Use a small delay to ensure the application is fully initialized
  setTimeout(() => {
    initializeBackgroundServices();
  }, 1000);
}

// Handle graceful shutdown
process.on('SIGTERM', cleanupBackgroundServices);
process.on('SIGINT', cleanupBackgroundServices);