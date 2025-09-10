import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProcessingStatus } from '../ProcessingStatus';
import { createMockStageExecution } from '@/lib/utils/pipelineHelpers';

// Mock Tooltip component to avoid portal issues in tests
jest.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

describe('ProcessingStatus', () => {
  const mockExecutions = [
    createMockStageExecution('markdown-conversion', 'COMPLETED', 100, {
      startTime: new Date('2024-01-01T10:00:00Z'),
      endTime: new Date('2024-01-01T10:02:00Z'),
      duration: 120000, // 2 minutes
    }),
    createMockStageExecution('markdown-optimizer', 'RUNNING', 75, {
      startTime: new Date('2024-01-01T10:02:00Z'),
    }),
    createMockStageExecution('chunker', 'PENDING', 0),
    createMockStageExecution('fact-generator', 'PENDING', 0),
    createMockStageExecution('ingestor', 'PENDING', 0),
  ];

  const defaultProps = {
    executions: mockExecutions,
    documentName: 'Test Document.pdf',
  };

  it('should render without crashing', () => {
    render(<ProcessingStatus {...defaultProps} />);
    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
  });

  it('should display document name', () => {
    render(<ProcessingStatus {...defaultProps} />);
    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
  });

  it('should calculate and display overall progress', () => {
    render(<ProcessingStatus {...defaultProps} />);
    // (100 + 75 + 0 + 0 + 0) / 5 = 35%
    expect(screen.getByText('35%')).toBeInTheDocument();
  });

  it('should show appropriate status text for running pipeline', () => {
    render(<ProcessingStatus {...defaultProps} />);
    expect(screen.getByText('Processing markdown optimizer...')).toBeInTheDocument();
  });

  it('should show appropriate status text for completed pipeline', () => {
    const completedExecutions = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
      createMockStageExecution('markdown-optimizer', 'COMPLETED', 100),
      createMockStageExecution('chunker', 'COMPLETED', 100),
      createMockStageExecution('fact-generator', 'COMPLETED', 100),
      createMockStageExecution('ingestor', 'COMPLETED', 100),
    ];

    render(
      <ProcessingStatus 
        executions={completedExecutions} 
        documentName="Completed Doc" 
      />
    );
    
    expect(screen.getByText('Processing complete')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should show appropriate status text for failed pipeline', () => {
    const failedExecutions = [
      createMockStageExecution('markdown-conversion', 'FAILED', 0),
      createMockStageExecution('markdown-optimizer', 'PENDING', 0),
      createMockStageExecution('chunker', 'PENDING', 0),
    ];

    render(
      <ProcessingStatus 
        executions={failedExecutions} 
        documentName="Failed Doc" 
      />
    );
    
    expect(screen.getByText('Processing failed')).toBeInTheDocument();
  });

  it('should show appropriate status text for partial completion', () => {
    const partialExecutions = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
      createMockStageExecution('markdown-optimizer', 'FAILED', 30),
      createMockStageExecution('chunker', 'COMPLETED', 100),
    ];

    render(
      <ProcessingStatus 
        executions={partialExecutions} 
        documentName="Partial Doc" 
      />
    );
    
    expect(screen.getByText('Partially complete')).toBeInTheDocument();
  });

  it('should show appropriate status text for pending pipeline', () => {
    const pendingExecutions = [
      createMockStageExecution('markdown-conversion', 'PENDING', 0),
      createMockStageExecution('markdown-optimizer', 'PENDING', 0),
    ];

    render(
      <ProcessingStatus 
        executions={pendingExecutions} 
        documentName="Pending Doc" 
      />
    );
    
    expect(screen.getByText('Waiting to start')).toBeInTheDocument();
  });

  it('should display custom status text when provided', () => {
    render(
      <ProcessingStatus 
        {...defaultProps} 
        statusText="Custom status message" 
      />
    );
    
    expect(screen.getByText('Custom status message')).toBeInTheDocument();
  });

  it('should show stage completion summary when showDetails is true', () => {
    render(<ProcessingStatus {...defaultProps} showDetails />);
    
    expect(screen.getByText('1 of 5 stages complete')).toBeInTheDocument();
  });

  it('should hide details when showDetails is false', () => {
    render(<ProcessingStatus {...defaultProps} showDetails={false} />);
    
    expect(screen.queryByText('1 of 5 stages complete')).not.toBeInTheDocument();
  });

  it('should show current stage progress when available', () => {
    render(<ProcessingStatus {...defaultProps} showDetails />);
    
    // Should show current stage progress (75% through markdown optimizer)
    expect(screen.getByText('75% through current stage')).toBeInTheDocument();
  });

  it('should show estimated time remaining when available', () => {
    render(<ProcessingStatus {...defaultProps} showTimeEstimate />);
    
    // Should show estimated time remaining
    const timeText = screen.getByText(/Estimated time remaining:/);
    expect(timeText).toBeInTheDocument();
  });

  it('should hide time estimate when showTimeEstimate is false', () => {
    render(<ProcessingStatus {...defaultProps} showTimeEstimate={false} />);
    
    expect(screen.queryByText(/Estimated time remaining:/)).not.toBeInTheDocument();
  });

  it('should show failed stages count when there are failures', () => {
    const executionsWithFailures = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
      createMockStageExecution('markdown-optimizer', 'FAILED', 20),
      createMockStageExecution('chunker', 'FAILED', 30),
      createMockStageExecution('fact-generator', 'SKIPPED', 0),
      createMockStageExecution('ingestor', 'PENDING', 0),
    ];

    render(
      <ProcessingStatus 
        executions={executionsWithFailures} 
        documentName="Failed Test"
        showDetails 
      />
    );
    
    expect(screen.getByText('2 stages failed, 1 skipped')).toBeInTheDocument();
  });

  it('should show current stage details when available', () => {
    render(<ProcessingStatus {...defaultProps} showDetails />);
    
    expect(screen.getByText(/Current: markdown optimizer/)).toBeInTheDocument();
  });

  it('should show elapsed time for current stage', () => {
    // Mock Date.now to return a fixed time for consistent testing
    const mockNow = new Date('2024-01-01T10:03:00Z').getTime(); // 1 minute after stage start
    jest.spyOn(Date, 'now').mockReturnValue(mockNow);

    render(<ProcessingStatus {...defaultProps} showDetails />);
    
    expect(screen.getByText(/1m elapsed/)).toBeInTheDocument();
    
    jest.restoreAllMocks();
  });

  it('should be clickable when onStatusClick is provided', async () => {
    const user = userEvent.setup();
    const handleStatusClick = jest.fn();

    render(
      <ProcessingStatus 
        {...defaultProps} 
        onStatusClick={handleStatusClick} 
      />
    );

    const statusElement = screen.getByRole('button');
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('tabindex', '0');
    
    await user.click(statusElement!);
    expect(handleStatusClick).toHaveBeenCalledTimes(1);
  });

  it('should handle keyboard navigation when clickable', async () => {
    const user = userEvent.setup();
    const handleStatusClick = jest.fn();

    render(
      <ProcessingStatus 
        {...defaultProps} 
        onStatusClick={handleStatusClick} 
      />
    );

    const statusElement = screen.getByText('Test Document.pdf').closest('[role="button"]');
    statusElement!.focus();
    
    await user.keyboard('{Enter}');
    expect(handleStatusClick).toHaveBeenCalledTimes(1);
    
    await user.keyboard(' ');
    expect(handleStatusClick).toHaveBeenCalledTimes(2);
  });

  it('should not be clickable when onStatusClick is not provided', () => {
    render(<ProcessingStatus {...defaultProps} />);
    
    const statusElement = screen.getByText('Test Document.pdf').closest('div');
    expect(statusElement).not.toHaveAttribute('role', 'button');
    expect(statusElement).not.toHaveAttribute('tabindex');
  });

  it('should display appropriate badge variants for different statuses', () => {
    const { rerender } = render(<ProcessingStatus {...defaultProps} />);
    expect(screen.getByText('35%')).toBeInTheDocument();

    // Test completed status
    const completedExecutions = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
    ];
    rerender(
      <ProcessingStatus 
        executions={completedExecutions} 
        documentName="Completed Doc" 
      />
    );
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Test failed status
    const failedExecutions = [
      createMockStageExecution('markdown-conversion', 'FAILED', 30),
    ];
    rerender(
      <ProcessingStatus 
        executions={failedExecutions} 
        documentName="Failed Doc" 
      />
    );
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('should handle empty executions array gracefully', () => {
    render(
      <ProcessingStatus 
        executions={[]} 
        documentName="Empty Test" 
      />
    );
    
    expect(screen.getByText('Empty Test')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Waiting to start')).toBeInTheDocument();
  });

  it('should handle different size variants', () => {
    const { rerender } = render(<ProcessingStatus {...defaultProps} size="sm" />);
    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
    
    rerender(<ProcessingStatus {...defaultProps} size="lg" />);
    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
  });

  it('should show progress bar with correct variant based on status', () => {
    render(<ProcessingStatus {...defaultProps} />);
    
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should show current stage progress bar when available', () => {
    render(<ProcessingStatus {...defaultProps} showDetails />);
    
    // Should have progress bars for overall and current stage
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThanOrEqual(2);
  });

  it('should provide accessibility announcements for screen readers', () => {
    render(<ProcessingStatus {...defaultProps} />);
    
    const announcement = screen.getByText(/Processing status for Test Document.pdf/);
    expect(announcement).toBeInTheDocument();
    expect(announcement.closest('[aria-live="polite"]')).toBeInTheDocument();
    expect(announcement.closest('[aria-atomic="true"]')).toBeInTheDocument();
    expect(announcement).toHaveTextContent(/currently processing markdown optimizer/);
    expect(announcement).toHaveTextContent(/35% complete/);
  });

  it('should update accessibility announcements based on status', () => {
    const completedExecutions = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
      createMockStageExecution('markdown-optimizer', 'COMPLETED', 100),
      createMockStageExecution('chunker', 'COMPLETED', 100),
      createMockStageExecution('fact-generator', 'COMPLETED', 100),
      createMockStageExecution('ingestor', 'COMPLETED', 100),
    ];

    render(
      <ProcessingStatus 
        executions={completedExecutions} 
        documentName="Completed Doc" 
      />
    );
    
    const announcement = screen.getByText(/Processing status for Completed Doc/);
    expect(announcement).toHaveTextContent(/Processing complete/);
    expect(announcement).toHaveTextContent(/100% complete/);
    expect(announcement).not.toHaveTextContent(/currently processing/);
  });

  it('should handle tooltip for current stage progress', () => {
    render(<ProcessingStatus {...defaultProps} showDetails />);
    
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute('title', 'Currently processing: markdown optimizer');
  });
});