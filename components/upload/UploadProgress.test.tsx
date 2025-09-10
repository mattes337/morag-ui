import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  renderWithA11y, 
  testComponentAccessibility 
} from '@/lib/accessibility/a11y-test-utils';
import { UploadProgress } from './UploadProgress';

const mockFiles = [
  {
    id: 'file-1',
    name: 'document1.pdf',
    size: 1024 * 1024, // 1MB
    type: 'application/pdf',
    status: 'uploading' as const,
    progress: 45,
    error: null,
  },
  {
    id: 'file-2',
    name: 'document2.txt',
    size: 512 * 1024, // 512KB
    type: 'text/plain',
    status: 'completed' as const,
    progress: 100,
    error: null,
  },
  {
    id: 'file-3',
    name: 'document3.docx',
    size: 2 * 1024 * 1024, // 2MB
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    status: 'error' as const,
    progress: 0,
    error: 'File too large',
  },
];

const mockProps = {
  files: mockFiles,
  onCancel: jest.fn(),
  onRetry: jest.fn(),
  onClear: jest.fn(),
};

describe('UploadProgress Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Accessibility', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      await testComponentAccessibility(<UploadProgress {...mockProps} />);
    });

    test('has proper semantic structure', () => {
      render(<UploadProgress {...mockProps} />);
      
      // Should have a region for the upload progress
      const progressRegion = screen.getByRole('region', { name: /upload.*progress/i });
      expect(progressRegion).toBeInTheDocument();
      
      // Should have a list for files
      const filesList = screen.getByRole('list');
      expect(filesList).toBeInTheDocument();
    });

    test('provides overall progress summary', () => {
      render(<UploadProgress {...mockProps} />);
      
      const summary = screen.getByText(/2.*of.*3.*files.*completed/i);
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveAttribute('role', 'status');
      expect(summary).toHaveAttribute('aria-live', 'polite');
    });

    test('shows overall progress bar', () => {
      render(<UploadProgress {...mockProps} />);
      
      const overallProgress = screen.getByRole('progressbar', { name: /overall.*progress/i });
      expect(overallProgress).toBeInTheDocument();
      
      // Should show percentage based on completed files (1/3 completed = ~33%)
      expect(overallProgress).toHaveAttribute('aria-valuenow', expect.stringMatching(/33|34/));
      expect(overallProgress).toHaveAttribute('aria-valuemin', '0');
      expect(overallProgress).toHaveAttribute('aria-valuemax', '100');
    });
  });

  describe('Individual File Progress', () => {
    test('shows progress for each file', () => {
      render(<UploadProgress {...mockProps} />);
      
      // Check uploading file progress
      const uploadingProgress = screen.getByRole('progressbar', { name: /document1\.pdf/i });
      expect(uploadingProgress).toHaveAttribute('aria-valuenow', '45');
      
      // Check completed file
      const completedProgress = screen.getByRole('progressbar', { name: /document2\.txt/i });
      expect(completedProgress).toHaveAttribute('aria-valuenow', '100');
    });

    test('handles indeterminate progress state', () => {
      const indeterminateFiles = [{
        ...mockFiles[0],
        progress: -1, // Indeterminate
      }];
      
      render(<UploadProgress {...mockProps} files={indeterminateFiles} />);
      
      const progress = screen.getByRole('progressbar', { name: /document1\.pdf/i });
      expect(progress).not.toHaveAttribute('aria-valuenow');
      expect(progress).toHaveAttribute('aria-label', expect.stringMatching(/processing|uploading/i));
    });

    test('shows file status indicators', () => {
      render(<UploadProgress {...mockProps} />);
      
      expect(screen.getByText(/uploading/i)).toBeInTheDocument();
      expect(screen.getByText(/completed/i)).toBeInTheDocument();
      expect(screen.getByText(/error|failed/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error messages accessibly', () => {
      render(<UploadProgress {...mockProps} />);
      
      const errorMessage = screen.getByText('File too large');
      expect(errorMessage).toBeInTheDocument();
      
      // Error should be announced to screen readers
      const errorRegion = screen.getByRole('alert');
      expect(errorRegion).toHaveTextContent('File too large');
    });

    test('provides retry functionality for failed files', async () => {
      const user = userEvent.setup();
      render(<UploadProgress {...mockProps} />);
      
      const retryButton = screen.getByRole('button', { name: /retry.*document3\.docx/i });
      expect(retryButton).toBeInTheDocument();
      
      await user.click(retryButton);
      expect(mockProps.onRetry).toHaveBeenCalledWith('file-3');
    });

    test('shows error count in summary', () => {
      render(<UploadProgress {...mockProps} />);
      
      expect(screen.getByText(/1.*error/i)).toBeInTheDocument();
    });
  });

  describe('Control Actions', () => {
    test('provides cancel button for ongoing uploads', async () => {
      const user = userEvent.setup();
      render(<UploadProgress {...mockProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel.*upload/i });
      expect(cancelButton).toBeInTheDocument();
      
      await user.click(cancelButton);
      expect(mockProps.onCancel).toHaveBeenCalled();
    });

    test('provides clear button when uploads are complete', async () => {
      const completedFiles = mockFiles.map(file => ({
        ...file,
        status: 'completed' as const,
        progress: 100,
        error: null,
      }));
      
      const user = userEvent.setup();
      render(<UploadProgress {...mockProps} files={completedFiles} />);
      
      const clearButton = screen.getByRole('button', { name: /clear|dismiss/i });
      expect(clearButton).toBeInTheDocument();
      
      await user.click(clearButton);
      expect(mockProps.onClear).toHaveBeenCalled();
    });

    test('shows retry all button when there are errors', async () => {
      const filesWithErrors = [
        { ...mockFiles[0], status: 'error' as const, error: 'Network error' },
        { ...mockFiles[1], status: 'error' as const, error: 'Server error' },
      ];
      
      const user = userEvent.setup();
      render(<UploadProgress {...mockProps} files={filesWithErrors} />);
      
      const retryAllButton = screen.getByRole('button', { name: /retry.*all/i });
      expect(retryAllButton).toBeInTheDocument();
      
      await user.click(retryAllButton);
      expect(mockProps.onRetry).toHaveBeenCalledWith('all');
    });
  });

  describe('Progress Animations', () => {
    test('shows loading animation for active uploads', () => {
      render(<UploadProgress {...mockProps} />);
      
      const uploadingProgress = screen.getByRole('progressbar', { name: /document1\.pdf/i });
      expect(uploadingProgress).toHaveClass(expect.stringMatching(/animate|loading/));
    });

    test('shows completion animation', async () => {
      const { rerender } = render(<UploadProgress {...mockProps} />);
      
      // Update file to completed
      const updatedFiles = mockFiles.map(file => 
        file.id === 'file-1' 
          ? { ...file, status: 'completed' as const, progress: 100 }
          : file
      );
      
      rerender(<UploadProgress {...mockProps} files={updatedFiles} />);
      
      await waitFor(() => {
        const completedProgress = screen.getByRole('progressbar', { name: /document1\.pdf/i });
        expect(completedProgress).toHaveClass(expect.stringMatching(/complete|success/));
      });
    });
  });

  describe('Real-time Updates', () => {
    test('updates progress values dynamically', async () => {
      const { rerender } = render(<UploadProgress {...mockProps} />);
      
      // Update progress
      const updatedFiles = mockFiles.map(file => 
        file.id === 'file-1' 
          ? { ...file, progress: 75 }
          : file
      );
      
      rerender(<UploadProgress {...mockProps} files={updatedFiles} />);
      
      await waitFor(() => {
        const progress = screen.getByRole('progressbar', { name: /document1\.pdf/i });
        expect(progress).toHaveAttribute('aria-valuenow', '75');
      });
    });

    test('announces significant progress milestones', async () => {
      const { rerender } = render(<UploadProgress {...mockProps} />);
      
      // Update to 100% complete
      const completedFiles = mockFiles.map(file => ({
        ...file,
        status: 'completed' as const,
        progress: 100,
        error: null,
      }));
      
      rerender(<UploadProgress {...mockProps} files={completedFiles} />);
      
      await waitFor(() => {
        const completionAnnouncement = screen.getByRole('status');
        expect(completionAnnouncement).toHaveTextContent(/all.*files.*completed/i);
      });
    });
  });

  describe('Upload Speed and Time Estimates', () => {
    test('shows upload speed information', () => {
      const filesWithSpeed = mockFiles.map(file => ({
        ...file,
        uploadSpeed: file.status === 'uploading' ? 1024 * 1024 : undefined, // 1MB/s
        timeRemaining: file.status === 'uploading' ? 30 : undefined, // 30 seconds
      }));
      
      render(<UploadProgress {...mockProps} files={filesWithSpeed} />);
      
      expect(screen.getByText(/1\.0.*mb\/s|30.*second/i)).toBeInTheDocument();
    });

    test('shows time remaining estimates', () => {
      const filesWithTime = mockFiles.map(file => ({
        ...file,
        timeRemaining: file.status === 'uploading' ? 45 : undefined, // 45 seconds
      }));
      
      render(<UploadProgress {...mockProps} files={filesWithTime} />);
      
      expect(screen.getByText(/45.*second.*remaining/i)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    test('all control buttons are keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<UploadProgress {...mockProps} />);
      
      // Tab through buttons
      await user.tab();
      expect(screen.getByRole('button', { name: /cancel/i })).toHaveFocus();
      
      await user.tab();
      expect(screen.getByRole('button', { name: /retry.*document3\.docx/i })).toHaveFocus();
    });

    test('supports keyboard activation', async () => {
      const user = userEvent.setup();
      render(<UploadProgress {...mockProps} />);
      
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      cancelButton.focus();
      
      await user.keyboard('{Enter}');
      expect(mockProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Empty States', () => {
    test('handles empty file list', () => {
      render(<UploadProgress {...mockProps} files={[]} />);
      
      expect(screen.getByText(/no.*files|empty/i)).toBeInTheDocument();
    });

    test('shows appropriate message for no active uploads', () => {
      const completedFiles = mockFiles.map(file => ({
        ...file,
        status: 'completed' as const,
        progress: 100,
        error: null,
      }));
      
      render(<UploadProgress {...mockProps} files={completedFiles} />);
      
      expect(screen.getByText(/all.*completed/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to narrow viewports', () => {
      // Mock narrow viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      
      render(<UploadProgress {...mockProps} />);
      
      // Should still show essential information
      expect(screen.getByRole('progressbar', { name: /overall/i })).toBeInTheDocument();
      expect(screen.getByText(/document1\.pdf/)).toBeInTheDocument();
    });

    test('shows detailed view on wide screens', () => {
      // Mock wide viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });
      
      render(<UploadProgress {...mockProps} />);
      
      // Should show additional details
      expect(screen.getByText(/1\.0.*mb|1024.*kb/i)).toBeInTheDocument(); // File sizes
    });
  });

  describe('Data Persistence', () => {
    test('maintains state across re-renders', async () => {
      const { rerender } = render(<UploadProgress {...mockProps} />);
      
      // Verify initial state
      expect(screen.getByRole('progressbar', { name: /document1\.pdf/i }))
        .toHaveAttribute('aria-valuenow', '45');
      
      // Re-render with same props
      rerender(<UploadProgress {...mockProps} />);
      
      // State should be maintained
      expect(screen.getByRole('progressbar', { name: /document1\.pdf/i }))
        .toHaveAttribute('aria-valuenow', '45');
    });
  });
});