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
    } else if (result.error !== 'Scheduler is already running') {
      console.error('Failed to start background job processor:', result.error);
    }
    // Don't log error if scheduler is already running - this is normal
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

// Background services are now initialized on-demand via API calls
// This prevents multiple initializations during build and static generation

// Handle graceful shutdown
process.on('SIGTERM', cleanupBackgroundServices);
process.on('SIGINT', cleanupBackgroundServices);