import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MigrationHistory } from '../../../components/ui/migration-history';
import { MigrationStatus } from '@prisma/client';

// Mock the API calls
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockMigrations = [
  {
    id: 'migration-1',
    sourceRealmId: 'realm-1',
    targetRealmId: 'realm-2',
    status: MigrationStatus.COMPLETED,
    totalDocuments: 10,
    processedDocuments: 10,
    failedDocuments: 0,
    migrationOptions: {
      includeMetadata: true,
      preserveTimestamps: true,
      overwriteExisting: false,
    },
    createdAt: '2024-01-15T10:00:00Z',
    completedAt: '2024-01-15T10:30:00Z',
    sourceRealm: {
      name: 'Source Realm',
    },
    targetRealm: {
      name: 'Target Realm',
    },
  },
  {
    id: 'migration-2',
    sourceRealmId: 'realm-2',
    targetRealmId: 'realm-3',
    status: MigrationStatus.IN_PROGRESS,
    totalDocuments: 5,
    processedDocuments: 3,
    failedDocuments: 0,
    migrationOptions: {
      includeMetadata: false,
      preserveTimestamps: true,
      overwriteExisting: true,
    },
    createdAt: '2024-01-15T11:00:00Z',
    completedAt: null,
    sourceRealm: {
      name: 'Another Source',
    },
    targetRealm: {
      name: 'Another Target',
    },
  },
  {
    id: 'migration-3',
    sourceRealmId: 'realm-1',
    targetRealmId: 'realm-3',
    status: MigrationStatus.FAILED,
    totalDocuments: 8,
    processedDocuments: 4,
    failedDocuments: 4,
    migrationOptions: {
      includeMetadata: true,
      preserveTimestamps: false,
      overwriteExisting: false,
    },
    createdAt: '2024-01-15T09:00:00Z',
    completedAt: null,
    sourceRealm: {
      name: 'Failed Source',
    },
    targetRealm: {
      name: 'Failed Target',
    },
  },
];

describe('MigrationHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockMigrations,
    } as Response);
  });

  it('should render migration history with migrations', async () => {
    render(<MigrationHistory />);

    // Check if loading state is shown initially
    expect(screen.getByText('Loading migrations...')).toBeInTheDocument();

    // Wait for migrations to load
    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check if migrations are displayed
    expect(screen.getByText('Source Realm → Target Realm')).toBeInTheDocument();
    expect(screen.getByText('Another Source → Another Target')).toBeInTheDocument();
    expect(screen.getByText('Failed Source → Failed Target')).toBeInTheDocument();
  });

  it('should display correct status badges', async () => {
    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check status badges
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should display progress information', async () => {
    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check progress information
    expect(screen.getByText('10/10 documents')).toBeInTheDocument();
    expect(screen.getByText('3/5 documents')).toBeInTheDocument();
    expect(screen.getByText('4/8 documents (4 failed)')).toBeInTheDocument();
  });

  it('should display migration options', async () => {
    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check migration options
    expect(screen.getByText('Include Metadata')).toBeInTheDocument();
    expect(screen.getByText('Preserve Timestamps')).toBeInTheDocument();
    expect(screen.getByText('Overwrite Existing')).toBeInTheDocument();
  });

  it('should handle refresh button click', async () => {
    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    // Should call fetch again
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should handle cancel migration', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMigrations,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMigrations.map(m => 
          m.id === 'migration-2' ? { ...m, status: MigrationStatus.CANCELLED } : m
        ),
      } as Response);

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Find and click cancel button for in-progress migration
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[0]);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/migrations/migration-2', {
        method: 'DELETE',
      });
    });
  });

  it('should handle API error', async () => {
    mockFetch.mockRejectedValue(new Error('API Error'));

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load migrations')).toBeInTheDocument();
    });
  });

  it('should show empty state when no migrations', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('No migrations found')).toBeInTheDocument();
    });
  });

  it('should display timestamps correctly', async () => {
    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check if timestamps are displayed (simplified check)
    expect(screen.getByText(/Started:/)).toBeInTheDocument();
    expect(screen.getByText(/Completed:/)).toBeInTheDocument();
  });

  it('should handle cancel migration error', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockMigrations,
      } as Response)
      .mockRejectedValueOnce(new Error('Cancel failed'));

    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Find and click cancel button
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButtons[0]);

    // Should handle the error gracefully (component should still be functional)
    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });
  });

  it('should disable cancel button for non-cancellable migrations', async () => {
    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    
    // Only in-progress migrations should have enabled cancel buttons
    // Completed and failed migrations should not have cancel buttons or they should be disabled
    expect(cancelButtons.length).toBeLessThanOrEqual(1); // Only one in-progress migration
  });

  it('should show progress bars for in-progress migrations', async () => {
    render(<MigrationHistory />);

    await waitFor(() => {
      expect(screen.getByText('Migration History')).toBeInTheDocument();
    });

    // Check for progress indicators (this depends on your implementation)
    const progressElements = screen.getAllByRole('progressbar');
    expect(progressElements.length).toBeGreaterThan(0);
  });
});