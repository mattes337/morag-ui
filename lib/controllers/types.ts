/**
 * Base types and interfaces for the controller pattern
 */

export interface BaseControllerState {
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface ControllerLogger {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  trace: (action: string, data?: any) => void;
}

export interface BaseController<TState extends BaseControllerState> {
  state: TState;
  logger: ControllerLogger;
  initialize: () => Promise<void> | void;
  cleanup: () => void;
}

export interface ControllerHook<TState extends BaseControllerState, TActions = {}> {
  state: TState;
  actions: TActions;
  logger: ControllerLogger;
}

/**
 * Navigation actions that controllers can perform
 */
export interface NavigationActions {
  goBack: () => void;
  navigateTo: (path: string) => void;
  replace: (path: string) => void;
}

/**
 * Common controller actions
 */
export interface CommonControllerActions {
  refresh: () => Promise<void>;
  reset: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}
