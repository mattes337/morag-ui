import { useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Job } from '../../types';
import { BaseControllerState, ControllerHook } from './types';
import { useBaseController } from './base';

interface JobsState extends BaseControllerState {
  jobs: Job[];
}

interface JobsActions {
  handleCancelJob: (job: Job) => void;
}

export function useJobsController(): ControllerHook<JobsState, JobsActions> {
  const { jobs, setJobs } = useApp();

  const initialState: JobsState = {
    isLoading: false,
    error: null,
    isInitialized: true,
    jobs
  };

  const {
    state,
    setState,
    logger
  } = useBaseController('JobsController', initialState);

  // Update state when app context changes
  const updateFromContext = useCallback(() => {
    setState(prev => ({
      ...prev,
      jobs
    }), 'updateFromContext');
  }, [jobs, setState]);

  // Keep state in sync with context
  if (state.jobs !== jobs) {
    updateFromContext();
  }

  const handleCancelJob = useCallback((job: Job) => {
    logger.info('Cancelling job', {
      jobId: job.id,
      documentType: job.documentType,
      currentStatus: job.status
    });

    // Update job status to cancelled
    const updatedJobs = jobs.map((j) =>
      j.id === job.id
        ? {
            ...j,
            status: 'CANCELLED' as const,
            endDate: new Date().toISOString(),
            progress: {
              ...j.progress,
              summary: 'Job cancelled by user',
            },
            updatedAt: new Date().toISOString(),
          }
        : j,
    );
    
    setJobs(updatedJobs);
    
    logger.info('Job cancelled successfully', { 
      jobId: job.id,
      newStatus: 'CANCELLED'
    });
  }, [jobs, setJobs, logger]);

  const actions: JobsActions = {
    handleCancelJob
  };

  return {
    state,
    actions,
    logger
  };
}
