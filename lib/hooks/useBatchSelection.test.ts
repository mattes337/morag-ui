import { renderHook, act } from '@testing-library/react';
import { useBatchSelection, useDocumentBatchSelection } from './useBatchSelection';

describe('useBatchSelection', () => {
  test('should initialize with empty selection', () => {
    const { result } = renderHook(() => useBatchSelection());

    expect(result.current.selectedIds.size).toBe(0);
    expect(result.current.selectCount).toBe(0);
    expect(result.current.allSelected).toBe(false);
    expect(result.current.isPartialSelection).toBe(false);
  });

  test('should select and deselect items', () => {
    const { result } = renderHook(() => useBatchSelection<string>());

    act(() => {
      result.current.selectItem('item1');
    });

    expect(result.current.selectedIds.has('item1')).toBe(true);
    expect(result.current.selectCount).toBe(1);

    act(() => {
      result.current.deselectItem('item1');
    });

    expect(result.current.selectedIds.has('item1')).toBe(false);
    expect(result.current.selectCount).toBe(0);
  });

  test('should toggle item selection', () => {
    const { result } = renderHook(() => useBatchSelection<string>());

    act(() => {
      result.current.toggleItem('item1');
    });

    expect(result.current.selectedIds.has('item1')).toBe(true);

    act(() => {
      result.current.toggleItem('item1');
    });

    expect(result.current.selectedIds.has('item1')).toBe(false);
  });

  test('should select all items', () => {
    const { result } = renderHook(() => useBatchSelection<string>());
    const items = ['item1', 'item2', 'item3'];

    act(() => {
      result.current.selectAll(items);
    });

    expect(result.current.selectCount).toBe(3);
    items.forEach(item => {
      expect(result.current.selectedIds.has(item)).toBe(true);
    });
  });

  test('should clear all selections', () => {
    const { result } = renderHook(() => useBatchSelection<string>());
    const items = ['item1', 'item2', 'item3'];

    act(() => {
      result.current.selectAll(items);
    });

    expect(result.current.selectCount).toBe(3);

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectCount).toBe(0);
    expect(result.current.selectedIds.size).toBe(0);
  });

  test('should respect maxSelection limit', () => {
    const { result } = renderHook(() => useBatchSelection<string>({ maxSelection: 2 }));

    act(() => {
      result.current.selectItem('item1');
      result.current.selectItem('item2');
      result.current.selectItem('item3'); // Should be ignored
    });

    expect(result.current.selectCount).toBe(2);
    expect(result.current.isMaxSelectionReached).toBe(true);
    expect(result.current.selectedIds.has('item3')).toBe(false);
  });

  test('should select multiple items at once', () => {
    const { result } = renderHook(() => useBatchSelection<string>());

    act(() => {
      result.current.selectMultiple(['item1', 'item2', 'item3']);
    });

    expect(result.current.selectCount).toBe(3);
    ['item1', 'item2', 'item3'].forEach(item => {
      expect(result.current.selectedIds.has(item)).toBe(true);
    });
  });

  test('should deselect multiple items at once', () => {
    const { result } = renderHook(() => useBatchSelection<string>());

    act(() => {
      result.current.selectAll(['item1', 'item2', 'item3', 'item4']);
    });

    expect(result.current.selectCount).toBe(4);

    act(() => {
      result.current.deselectMultiple(['item2', 'item4']);
    });

    expect(result.current.selectCount).toBe(2);
    expect(result.current.selectedIds.has('item1')).toBe(true);
    expect(result.current.selectedIds.has('item3')).toBe(true);
    expect(result.current.selectedIds.has('item2')).toBe(false);
    expect(result.current.selectedIds.has('item4')).toBe(false);
  });

  test('should return selected items from array', () => {
    const { result } = renderHook(() => useBatchSelection<string>());
    const items = [
      { id: 'item1', name: 'Item 1' },
      { id: 'item2', name: 'Item 2' },
      { id: 'item3', name: 'Item 3' },
    ];

    act(() => {
      result.current.selectMultiple(['item1', 'item3']);
    });

    const selectedItems = result.current.getSelectedItems(items, item => item.id);
    expect(selectedItems).toHaveLength(2);
    expect(selectedItems[0]?.id).toBe('item1');
    expect(selectedItems[1]?.id).toBe('item3');
  });

  test('should call onSelectionChange callback', () => {
    const onSelectionChange = jest.fn();
    const { result } = renderHook(() => 
      useBatchSelection<string>({ onSelectionChange })
    );

    act(() => {
      result.current.selectItem('item1');
    });

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['item1']));
  });

  test('should reset selection state', () => {
    const { result } = renderHook(() => useBatchSelection<string>());

    act(() => {
      result.current.selectAll(['item1', 'item2', 'item3']);
    });

    expect(result.current.selectCount).toBe(3);

    act(() => {
      result.current.reset();
    });

    expect(result.current.selectCount).toBe(0);
    expect(result.current.selectedIds.size).toBe(0);
  });
});

describe('useDocumentBatchSelection', () => {
  test('should have document-specific methods', () => {
    const { result } = renderHook(() => useDocumentBatchSelection());

    expect(typeof result.current.getSelectedDocumentIds).toBe('function');
    expect(typeof result.current.getSelectedDocumentCount).toBe('function');
    expect(typeof result.current.hasSelection).toBe('function');
  });

  test('should return correct document counts', () => {
    const { result } = renderHook(() => useDocumentBatchSelection());

    act(() => {
      result.current.selectMultiple(['doc1', 'doc2', 'doc3']);
    });

    expect(result.current.getSelectedDocumentCount()).toBe(3);
    expect(result.current.hasSelection()).toBe(true);
    expect(result.current.getSelectedDocumentIds()).toEqual(['doc1', 'doc2', 'doc3']);
  });
});