/**
 * useBatchSelection Hook
 * Manages batch selection state for documents and other entities
 */

import { useState, useCallback, useMemo } from 'react';

export interface BatchSelectionState<T = string> {
  selectedIds: Set<T>;
  selectCount: number;
  allSelected: boolean;
  isPartialSelection: boolean;
}

export interface BatchSelectionActions<T = string> {
  selectAll: (items: T[]) => void;
  clearSelection: () => void;
  toggleItem: (id: T) => void;
  selectItem: (id: T) => void;
  deselectItem: (id: T) => void;
  selectMultiple: (ids: T[]) => void;
  deselectMultiple: (ids: T[]) => void;
  isSelected: (id: T) => boolean;
  getSelectedItems: <K>(items: K[], getId: (item: K) => T) => K[];
}

export interface UseBatchSelectionOptions {
  /** Maximum number of items that can be selected at once */
  maxSelection?: number;
  /** Whether to persist selection across data refreshes */
  persistSelection?: boolean;
  /** Callback fired when selection changes */
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

export interface UseBatchSelectionReturn<T = string> extends BatchSelectionState<T>, BatchSelectionActions<T> {
  /** Reset all selection state */
  reset: () => void;
  /** Get array of selected IDs */
  getSelectedArray: () => T[];
  /** Check if maximum selection limit is reached */
  isMaxSelectionReached: boolean;
}

/**
 * Hook for managing batch selection state
 * Provides utilities for selecting/deselecting items, checking selection state, etc.
 */
export function useBatchSelection<T = string>(
  options: UseBatchSelectionOptions = {}
): UseBatchSelectionReturn<T> {
  const { maxSelection, onSelectionChange } = options;
  
  const [selectedIds, setSelectedIds] = useState<Set<T>>(new Set());

  // Derived state
  const selectCount = selectedIds.size;
  const isMaxSelectionReached = maxSelection ? selectCount >= maxSelection : false;

  // Actions
  const selectAll = useCallback((items: T[]) => {
    const newSelection = new Set(maxSelection ? items.slice(0, maxSelection) : items);
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection as Set<string>);
  }, [maxSelection, onSelectionChange]);

  const clearSelection = useCallback(() => {
    const newSelection = new Set<T>();
    setSelectedIds(newSelection);
    onSelectionChange?.(newSelection as Set<string>);
  }, [onSelectionChange]);

  const toggleItem = useCallback((id: T) => {
    setSelectedIds((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else if (!maxSelection || newSelection.size < maxSelection) {
        newSelection.add(id);
      }
      onSelectionChange?.(newSelection as Set<string>);
      return newSelection;
    });
  }, [maxSelection, onSelectionChange]);

  const selectItem = useCallback((id: T) => {
    setSelectedIds((prev) => {
      if (prev.has(id) || (maxSelection && prev.size >= maxSelection)) {
        return prev;
      }
      const newSelection = new Set(prev);
      newSelection.add(id);
      onSelectionChange?.(newSelection as Set<string>);
      return newSelection;
    });
  }, [maxSelection, onSelectionChange]);

  const deselectItem = useCallback((id: T) => {
    setSelectedIds((prev) => {
      if (!prev.has(id)) {
        return prev;
      }
      const newSelection = new Set(prev);
      newSelection.delete(id);
      onSelectionChange?.(newSelection as Set<string>);
      return newSelection;
    });
  }, [onSelectionChange]);

  const selectMultiple = useCallback((ids: T[]) => {
    setSelectedIds((prev) => {
      const newSelection = new Set(prev);
      const remainingSlots = maxSelection ? maxSelection - newSelection.size : Infinity;
      const idsToAdd = ids.slice(0, remainingSlots);
      
      idsToAdd.forEach(id => newSelection.add(id));
      onSelectionChange?.(newSelection as Set<string>);
      return newSelection;
    });
  }, [maxSelection, onSelectionChange]);

  const deselectMultiple = useCallback((ids: T[]) => {
    setSelectedIds((prev) => {
      const newSelection = new Set(prev);
      ids.forEach(id => newSelection.delete(id));
      onSelectionChange?.(newSelection as Set<string>);
      return newSelection;
    });
  }, [onSelectionChange]);

  const isSelected = useCallback((id: T) => {
    return selectedIds.has(id);
  }, [selectedIds]);

  const getSelectedItems = useCallback(<K>(items: K[], getId: (item: K) => T): K[] => {
    return items.filter(item => selectedIds.has(getId(item)));
  }, [selectedIds]);

  const reset = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const getSelectedArray = useCallback((): T[] => {
    return Array.from(selectedIds);
  }, [selectedIds]);

  // Computed state for UI feedback
  const allSelected = useMemo(() => {
    return selectCount > 0; // Simple check - can be enhanced based on context
  }, [selectCount]);

  const isPartialSelection = useMemo(() => {
    return selectCount > 0 && !allSelected;
  }, [selectCount, allSelected]);

  return {
    // State
    selectedIds,
    selectCount,
    allSelected,
    isPartialSelection,
    isMaxSelectionReached,

    // Actions
    selectAll,
    clearSelection,
    toggleItem,
    selectItem,
    deselectItem,
    selectMultiple,
    deselectMultiple,
    isSelected,
    getSelectedItems,
    reset,
    getSelectedArray,
  };
}

/**
 * Enhanced hook for document-specific batch selection
 * Includes document-specific utilities and features
 */
export function useDocumentBatchSelection(options: UseBatchSelectionOptions = {}) {
  const batchSelection = useBatchSelection<string>(options);

  // Document-specific methods can be added here
  const getSelectedDocumentIds = useCallback(() => {
    return batchSelection.getSelectedArray();
  }, [batchSelection]);

  const getSelectedDocumentCount = useCallback(() => {
    return batchSelection.selectCount;
  }, [batchSelection.selectCount]);

  const hasSelection = useCallback(() => {
    return batchSelection.selectCount > 0;
  }, [batchSelection.selectCount]);

  return {
    ...batchSelection,
    getSelectedDocumentIds,
    getSelectedDocumentCount,
    hasSelection,
  };
}

export default useBatchSelection;