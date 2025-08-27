import { useCallback, useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { BaseControllerState, ControllerHook } from './types';
import { useBaseController } from './base';

interface LoginState extends BaseControllerState {
  email: string;
  password: string;
  headerAuthEnabled: boolean;
  autoLoginEnabled: boolean;
  autoLoginAttempted: boolean;
}

interface LoginActions {
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  handleLogin: () => Promise<void>;
  handleAutoLogin: () => Promise<void>;
}

export function useLoginController(): ControllerHook<LoginState, LoginActions> {
  const { setUser } = useApp();

  const initialState: LoginState = {
    isLoading: false,
    error: null,
    isInitialized: false,
    email: '',
    password: '',
    headerAuthEnabled: false,
    autoLoginEnabled: false,
    autoLoginAttempted: false
  };

  const {
    state,
    setState,
    logger,
    navigationActions,
    commonActions
  } = useBaseController('LoginController', initialState);

  // Check authentication settings on initialization
  useEffect(() => {
    if (!state.isInitialized) {
      logger.info('Initializing LoginController');
      
      const checkAuthSettings = async () => {
        try {
          const response = await fetch('/api/auth/settings');
          if (response.ok) {
            const settings = await response.json();
            setState(prev => ({
              ...prev,
              headerAuthEnabled: settings.headerAuthEnabled || false,
              autoLoginEnabled: settings.autoLoginEnabled || false,
              isInitialized: true
            }), 'checkAuthSettings');
          } else {
            setState(prev => ({ ...prev, isInitialized: true }), 'checkAuthSettingsFailed');
          }
        } catch (error) {
          logger.error('Failed to check auth settings', { error });
          setState(prev => ({ ...prev, isInitialized: true }), 'checkAuthSettingsError');
        }
      };

      checkAuthSettings();
    }
  }, [state.isInitialized, logger, setState]);

  const performLogin = useCallback(async (email?: string, password?: string) => {
    const loginData = {
      email: email || state.email,
      password: password || state.password
    };

    logger.info('Performing login', { email: loginData.email });

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }

    const userData = await response.json();
    setUser(userData.user);

    logger.info('Login successful', { userId: userData.user?.id });
    navigationActions.navigateTo('/');
  }, [state.email, state.password, logger, setUser, navigationActions]);

  const performAutoLogin = useCallback(async () => {
    logger.info('Performing auto-login');

    const response = await fetch('/api/auth/auto-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Auto-login failed');
    }

    const userData = await response.json();
    setUser(userData.user);

    logger.info('Auto-login successful', { userId: userData.user?.id });
    navigationActions.navigateTo('/');
  }, [logger, setUser, navigationActions]);

  const handleLogin = useCallback(async () => {
    try {
      logger.trace('Async action start: handleLogin');
      commonActions.setLoading(true);
      commonActions.setError(null);

      await performLogin();

      logger.trace('Async action success: handleLogin');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Async action failed: handleLogin', { error: errorMessage });
      commonActions.setError(errorMessage);
    } finally {
      commonActions.setLoading(false);
    }
  }, [logger, commonActions, performLogin]);

  const handleAutoLogin = useCallback(async () => {
    try {
      logger.trace('Async action start: handleAutoLogin');
      commonActions.setLoading(true);
      commonActions.setError(null);

      await performAutoLogin();

      logger.trace('Async action success: handleAutoLogin');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Async action failed: handleAutoLogin', { error: errorMessage });
      commonActions.setError(errorMessage);
    } finally {
      commonActions.setLoading(false);
    }
  }, [logger, commonActions, performAutoLogin]);

  // Auto-login attempt
  useEffect(() => {
    if (state.isInitialized && state.autoLoginEnabled && !state.autoLoginAttempted) {
      logger.info('Attempting auto-login');
      setState(prev => ({ ...prev, autoLoginAttempted: true }), 'autoLoginAttempt');
      handleAutoLogin();
    }
  }, [state.isInitialized, state.autoLoginEnabled, state.autoLoginAttempted, setState, logger, handleAutoLogin]);

  const setEmail = useCallback((email: string) => {
    setState(prev => ({ ...prev, email }), 'setEmail');
  }, [setState]);

  const setPassword = useCallback((password: string) => {
    setState(prev => ({ ...prev, password }), 'setPassword');
  }, [setState]);

  const actions: LoginActions = {
    setEmail,
    setPassword,
    handleLogin,
    handleAutoLogin
  };

  return {
    state,
    actions,
    logger
  };
}
