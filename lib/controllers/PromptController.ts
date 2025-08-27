import { useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BaseControllerState, ControllerHook } from './types';
import { useBaseController } from './base';

interface PromptState extends BaseControllerState {
  currentRealm: any;
  hasRealm: boolean;
}

interface PromptActions {
  // Add prompt-specific actions here when needed
}

export function usePromptController(): ControllerHook<PromptState, PromptActions> {
  const { currentRealm } = useApp();

  const initialState: PromptState = {
    isLoading: false,
    error: null,
    isInitialized: true,
    currentRealm,
    hasRealm: !!currentRealm
  };

  const {
    state,
    setState,
    logger
  } = useBaseController('PromptController', initialState);

  // Update state when app context changes
  const updateFromContext = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentRealm,
      hasRealm: !!currentRealm
    }), 'updateFromContext');
  }, [currentRealm, setState]);

  // Keep state in sync with context
  if (state.currentRealm !== currentRealm) {
    updateFromContext();
  }

  // Log realm state changes
  if (state.hasRealm !== !!currentRealm) {
    logger.info('Realm availability changed', { 
      hasRealm: !!currentRealm,
      realmId: currentRealm?.id,
      realmName: currentRealm?.name
    });
  }

  const actions: PromptActions = {
    // Add prompt-specific actions here when needed
  };

  return {
    state,
    actions,
    logger
  };
}
