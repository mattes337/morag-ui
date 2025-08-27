import { useCallback, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BaseControllerState, ControllerHook } from './types';
import { useBaseController } from './base';

interface RealmsState extends BaseControllerState {
  user: any;
  realms: any[];
  isDataLoading: boolean;
}

interface RealmsActions {
  handleSelectRealm: (realm: any) => void;
  handlePromptRealm: (realm: any) => void;
  handleViewRealm: (realm: any) => void;
}

export function useRealmsController(): ControllerHook<RealmsState, RealmsActions> {
  const {
    user,
    realms,
    isDataLoading,
    setCurrentRealm,
    setSelectedDocument,
    setShowCreateRealmDialog,
  } = useApp();

  const initialState: RealmsState = {
    isLoading: isDataLoading,
    error: null,
    isInitialized: false,
    user,
    realms,
    isDataLoading
  };

  const {
    state,
    setState,
    logger,
    navigationActions
  } = useBaseController('RealmsController', initialState);

  // Update state when app context changes
  const updateFromContext = useCallback(() => {
    setState(prev => ({
      ...prev,
      user,
      realms,
      isDataLoading,
      isLoading: isDataLoading
    }), 'updateFromContext');
  }, [user, realms, isDataLoading, setState]);

  // Keep state in sync with context
  if (state.user !== user || state.realms !== realms || state.isDataLoading !== isDataLoading) {
    updateFromContext();
  }

  // Handle authentication redirect
  useEffect(() => {
    if (!user && !isDataLoading) {
      logger.info('User not authenticated, redirecting to login');
      navigationActions.navigateTo('/login');
    }
  }, [user, isDataLoading, logger, navigationActions]);

  // Initialize controller
  useEffect(() => {
    if (!state.isInitialized) {
      logger.info('Initializing RealmsController', { 
        hasUser: !!user, 
        realmsCount: realms.length,
        isDataLoading 
      });
      setState(prev => ({ ...prev, isInitialized: true }), 'initialize');
    }
  }, [state.isInitialized, user, realms, isDataLoading, logger, setState]);

  const handleSelectRealm = useCallback((realm: any) => {
    logger.trace('Selecting realm for documents view', { 
      realmId: realm.id, 
      realmName: realm.name 
    });
    setCurrentRealm(realm);
    navigationActions.navigateTo('/documents');
  }, [logger, setCurrentRealm, navigationActions]);

  const handlePromptRealm = useCallback((realm: any) => {
    logger.trace('Selecting realm for prompt', { 
      realmId: realm.id, 
      realmName: realm.name 
    });
    setCurrentRealm(realm);
    setSelectedDocument(null);
    navigationActions.navigateTo('/prompt');
  }, [logger, setCurrentRealm, setSelectedDocument, navigationActions]);

  const handleViewRealm = useCallback((realm: any) => {
    logger.trace('Viewing realm details', { 
      realmId: realm.id, 
      realmName: realm.name 
    });
    navigationActions.navigateTo(`/realms/${realm.id}`);
  }, [logger, navigationActions]);

  const actions: RealmsActions = {
    handleSelectRealm,
    handlePromptRealm,
    handleViewRealm
  };

  return {
    state,
    actions,
    logger
  };
}
