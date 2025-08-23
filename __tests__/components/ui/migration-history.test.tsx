import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MigrationHistory } from '../../../components/ui/migration-history';

// Mock the API calls
global.fetch = jest.fn();

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('MigrationHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: [] }),
    });
  });

  it('should render migration history with migrations', async () => {
    const mockMigrationsData = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'COMPLETED' as const,
        totalDocuments: 2,
        processedDocuments: 2,
        documentTitles: ['Doc 1', 'Doc 2'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: mockMigrationsData }),
    });

    render(<MigrationHistory />);

    // Check if loading state is shown initially
    expect(screen.getByText('Loading migrations...')).toBeInTheDocument();

    // Wait for migrations to load
    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check if migrations are displayed
    await waitFor(() => {
      expect(screen.getByText('Source Realm')).toBeInTheDocument();
      expect(screen.getByText('Target Realm')).toBeInTheDocument();
    });
  });

  it('should display correct status badges', async () => {
    const mockMigrationsWithStatuses = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'COMPLETED' as const,
        totalDocuments: 1,
        processedDocuments: 1,
        documentTitles: ['Doc 1'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
      {
        id: 'migration-2',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'IN_PROGRESS' as const,
        totalDocuments: 1,
        processedDocuments: 0,
        documentTitles: ['Doc 2'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: mockMigrationsWithStatuses }),
    });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Wait for data to load and check status badges
    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
    });
  });

  it('should display progress information', async () => {
    const mockMigrationsWithProgress = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'IN_PROGRESS' as const,
        totalDocuments: 5,
        processedDocuments: 3,
        documentTitles: ['Doc 1', 'Doc 2', 'Doc 3', 'Doc 4', 'Doc 5'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: mockMigrationsWithProgress }),
    });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check progress information (the component shows "3 / 5" separately)
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('should display migration options for completed migrations', async () => {
    const mockMigrations = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'COMPLETED' as const,
        totalDocuments: 2,
        processedDocuments: 2,
        documentTitles: ['Doc 1', 'Doc 2'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: ['ingestor'],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ migrations: mockMigrations }),
    });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check migration options badges
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Stage Files')).toBeInTheDocument();
    });
  });

  it('should handle refresh button click', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ migrations: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ migrations: [] }),
      });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Wait for the component to finish loading and show the refresh button
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
    });

    // Should call fetch again
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('should handle cancel migration', async () => {
    const mockMigrationsWithInProgress = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'IN_PROGRESS' as const,
        totalDocuments: 2,
        processedDocuments: 1,
        documentTitles: ['Doc 1', 'Doc 2'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: ['ingestor'],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ migrations: mockMigrationsWithInProgress }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          migrations: mockMigrationsWithInProgress.map(m => ({ ...m, status: 'CANCELLED' }))
        }),
      });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Find and click cancel button for in-progress migration
    await waitFor(() => {
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButtons[0]);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/migrations/migration-1', {
        method: 'DELETE',
      });
    });
  });

  it('should handle API error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('should show empty state when no migrations', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: [] }),
    });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('No migrations found')).toBeInTheDocument();
    });
  });

  it('should display timestamps correctly', async () => {
    const mockMigrationsWithTimestamps = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'COMPLETED' as const,
        totalDocuments: 1,
        processedDocuments: 1,
        documentTitles: ['Doc 1'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: mockMigrationsWithTimestamps }),
    });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check if timestamps are displayed (the component shows "Created" and "Completed")
    await waitFor(() => {
      expect(screen.getByText(/Created/)).toBeInTheDocument();
      expect(screen.getByText(/Completed/)).toBeInTheDocument();
    });
  });

  it('should handle cancel migration error', async () => {
    const mockMigrationsWithInProgress = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'IN_PROGRESS' as const,
        totalDocuments: 2,
        processedDocuments: 1,
        documentTitles: ['Doc 1', 'Doc 2'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: ['ingestor'],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ migrations: mockMigrationsWithInProgress }),
      })
      .mockRejectedValueOnce(new Error('Cancel failed'));

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Find and click cancel button
    await waitFor(() => {
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButtons[0]);
    });

    // Should handle the error gracefully (component should still be functional)
    await waitFor(() => {
      expect(screen.getByText('Cancel failed')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });
  });

  it('should disable cancel button for non-cancellable migrations', async () => {
    const mockMigrationsWithMixedStatus = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'COMPLETED' as const,
        totalDocuments: 1,
        processedDocuments: 1,
        documentTitles: ['Doc 1'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
      {
        id: 'migration-2',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'IN_PROGRESS' as const,
        totalDocuments: 1,
        processedDocuments: 0,
        documentTitles: ['Doc 2'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: mockMigrationsWithMixedStatus }),
    });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    await waitFor(() => {
      const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
      // Only in-progress migrations should have cancel buttons
      expect(cancelButtons.length).toBe(1); // Only one in-progress migration
    });
  });

  it('should show progress bars for in-progress migrations', async () => {
    const mockMigrationsWithProgress = [
      {
        id: 'migration-1',
        sourceRealmId: 'realm-1',
        sourceRealmName: 'Source Realm',
        targetRealmId: 'realm-2',
        targetRealmName: 'Target Realm',
        status: 'IN_PROGRESS' as const,
        totalDocuments: 4,
        processedDocuments: 2,
        documentTitles: ['Doc 1', 'Doc 2', 'Doc 3', 'Doc 4'],
        migrationOptions: {
          copyStageFiles: true,
          reprocessStages: [],
          preserveOriginal: true,
          migrationMode: 'copy' as const,
        },
        createdAt: new Date().toISOString(),
        errors: [],
        createdBy: 'test-user',
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ migrations: mockMigrationsWithProgress }),
    });

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check for progress indicators (the component shows "2" and "4" separately)
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

  });
});