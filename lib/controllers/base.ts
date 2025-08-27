import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BaseControllerState, ControllerLogger, NavigationActions, CommonControllerActions } from './types';
import { createControllerLogger, logStateChange } from './logger';

/**
 * Base hook for creating controllers with common functionality
 */
export function useBaseController<TState extends BaseControllerState>(
  controllerName: string,
  initialState: TState
) {
  const [state, setState] = useState<TState>(initialState);
  const logger = useRef<ControllerLogger>(createControllerLogger(controllerName));
  const router = useRouter();
  const isCleanedUp = useRef(false);

  // Navigation actions
  const navigationActions: NavigationActions = {
    goBack: useCallback(() => {
      logger.current.trace('Navigation: goBack');
      router.back();
    }, [router]),

    navigateTo: useCallback((path: string) => {
      logger.current.trace('Navigation: navigateTo', { path });
      router.push(path);
    }, [router]),

    replace: useCallback((path: string) => {
      logger.current.trace('Navigation: replace', { path });
      router.replace(path);
    }, [router])
  };

  // Common controller actions
  const commonActions: CommonControllerActions = {
    refresh: useCallback(async () => {
      logger.current.trace('Action: refresh');
      // Override in specific controllers
    }, []),

    reset: useCallback(() => {
      logger.current.trace('Action: reset');
      setState(initialState);
    }, [initialState]),

    setError: useCallback((error: string | null) => {
      setState(prev => {
        logStateChange(logger.current, 'error', prev.error, error, 'setError');
        return { ...prev, error };
      });
    }, []),

    setLoading: useCallback((isLoading: boolean) => {
      setState(prev => {
        logStateChange(logger.current, 'isLoading', prev.isLoading, isLoading, 'setLoading');
        return { ...prev, isLoading };
      });
    }, [])
  };

  // State update helper with logging
  const updateState = useCallback((updater: (prev: TState) => TState, action?: string) => {
    setState(prev => {
      const newState = updater(prev);
      logStateChange(logger.current, 'state', prev, newState, action);
      return newState;
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCleanedUp.current = true;
      logger.current.trace('Controller cleanup');
    };
  }, []);

  // Safe state update that checks if component is still mounted
  const safeUpdateState = useCallback((updater: (prev: TState) => TState, action?: string) => {
    if (!isCleanedUp.current) {
      updateState(updater, action);
    }
  }, [updateState]);

  return {
    state,
    setState: updateState,
    safeSetState: safeUpdateState,
    logger: logger.current,
    navigationActions,
    commonActions,
    isCleanedUp: isCleanedUp.current
  };
}

/**
 * Helper for creating async actions with error handling and loading states
 */
export function useAsyncAction<TArgs extends any[], TResult>(
  logger: ControllerLogger,
  setLoading: (loading: boolean) => void,
  setError: (error: string | null) => void,
  actionName: string,
  asyncFn: (...args: TArgs) => Promise<TResult>
) {
  return useCallback(async (...args: TArgs): Promise<TResult | null> => {
    try {
      logger.trace(`Async action start: ${actionName}`, { args });
      setLoading(true);
      setError(null);

      const result = await asyncFn(...args);

      logger.trace(`Async action success: ${actionName}`, { result });
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Async action failed: ${actionName}`, { error: errorMessage, args });
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [logger, setLoading, setError, actionName, asyncFn]);
}
