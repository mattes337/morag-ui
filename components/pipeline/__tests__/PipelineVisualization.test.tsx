import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PipelineVisualization } from '../PipelineVisualization';
import { createMockStageExecution } from '@/lib/utils/pipelineHelpers';

// Mock Tooltip component to avoid portal issues in tests
jest.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children, content }: { children: React.ReactNode; content: string }) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

describe('PipelineVisualization', () => {
  const mockExecutions = [
    createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
    createMockStageExecution('markdown-optimizer', 'RUNNING', 60),
    createMockStageExecution('chunker', 'PENDING', 0),
    createMockStageExecution('fact-generator', 'PENDING', 0),
    createMockStageExecution('ingestor', 'PENDING', 0),
  ];

  const defaultProps = {
    executions: mockExecutions,
    documentName: 'Test Document.pdf',
  };

  it('should render without crashing', () => {
    render(<PipelineVisualization {...defaultProps} />);
    expect(screen.getByText('Processing Pipeline')).toBeInTheDocument();
  });

  it('should display document name', () => {
    render(<PipelineVisualization {...defaultProps} />);
    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
  });

  it('should calculate and display overall progress', () => {
    render(<PipelineVisualization {...defaultProps} />);
    // (100 + 60 + 0 + 0 + 0) / 5 = 32% complete
    expect(screen.getByText('32% Complete')).toBeInTheDocument();
  });

  it('should render all pipeline stages', () => {
    render(<PipelineVisualization {...defaultProps} />);
    
    expect(screen.getByText('Markdown Conversion')).toBeInTheDocument();
    expect(screen.getByText('Markdown Optimizer')).toBeInTheDocument();
    expect(screen.getByText('Chunker')).toBeInTheDocument();
    expect(screen.getByText('Fact Generator')).toBeInTheDocument();
    expect(screen.getByText('Ingestor')).toBeInTheDocument();
  });

  it('should display stage progress percentages', () => {
    render(<PipelineVisualization {...defaultProps} />);
    
    expect(screen.getByText('100%')).toBeInTheDocument(); // Completed stage
    expect(screen.getByText('60%')).toBeInTheDocument(); // Running stage
    expect(screen.getAllByText('0%')).toHaveLength(3); // Pending stages
  });

  it('should show appropriate status badges for stages', () => {
    render(<PipelineVisualization {...defaultProps} />);
    
    // Check that badges with different colors/variants are present
    const badges = screen.getAllByRole('generic'); // Badge elements
    expect(badges.length).toBeGreaterThan(0);
  });

  it('should display stage descriptions when showDetails is true', () => {
    render(<PipelineVisualization {...defaultProps} showDetails />);
    
    expect(screen.getByText('Convert content to markdown format')).toBeInTheDocument();
    expect(screen.getByText('LLM-based text improvement (optional)')).toBeInTheDocument();
  });

  it('should hide stage descriptions when showDetails is false', () => {
    render(<PipelineVisualization {...defaultProps} showDetails={false} />);
    
    expect(screen.queryByText('Convert content to markdown format')).not.toBeInTheDocument();
  });

  it('should handle empty executions array', () => {
    render(<PipelineVisualization executions={[]} documentName="Empty Test" />);
    
    expect(screen.getByText('Processing Pipeline')).toBeInTheDocument();
    expect(screen.getByText('Empty Test')).toBeInTheDocument();
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  it('should show error message for failed stages', () => {
    const failedExecution = createMockStageExecution('chunker', 'FAILED', 30, {
      errorMessage: 'Connection timeout occurred'
    });
    
    const executionsWithError = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
      failedExecution,
      createMockStageExecution('fact-generator', 'PENDING', 0),
      createMockStageExecution('ingestor', 'PENDING', 0),
    ];

    render(
      <PipelineVisualization 
        executions={executionsWithError} 
        documentName="Failed Test" 
      />
    );

    expect(screen.getByText('Connection timeout occurred')).toBeInTheDocument();
  });

  it('should show retry and skip buttons for failed stages when showActions is true', () => {
    const failedExecution = createMockStageExecution('chunker', 'FAILED', 30, {
      canRetry: true,
      canSkip: true,
    });

    render(
      <PipelineVisualization 
        executions={[failedExecution]} 
        documentName="Test" 
        showActions 
      />
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument();
  });

  it('should hide action buttons when showActions is false', () => {
    const failedExecution = createMockStageExecution('chunker', 'FAILED', 30, {
      canRetry: true,
      canSkip: true,
    });

    render(
      <PipelineVisualization 
        executions={[failedExecution]} 
        documentName="Test" 
        showActions={false} 
      />
    );

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
  });

  it('should call onStageClick when stage is clicked and interactive is true', async () => {
    const user = userEvent.setup();
    const handleStageClick = jest.fn();

    render(
      <PipelineVisualization 
        {...defaultProps} 
        interactive 
        onStageClick={handleStageClick} 
      />
    );

    const stageElement = screen.getByText('Markdown Conversion').closest('[role="button"]');
    expect(stageElement).toBeInTheDocument();
    
    await user.click(stageElement!);
    expect(handleStageClick).toHaveBeenCalledWith(mockExecutions[0]);
  });

  it('should not call onStageClick when interactive is false', async () => {
    const user = userEvent.setup();
    const handleStageClick = jest.fn();

    render(
      <PipelineVisualization 
        {...defaultProps} 
        interactive={false} 
        onStageClick={handleStageClick} 
      />
    );

    const stageElement = screen.getByText('Markdown Conversion').closest('div');
    await user.click(stageElement!);
    expect(handleStageClick).not.toHaveBeenCalled();
  });

  it('should call onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = jest.fn();
    const failedExecution = createMockStageExecution('chunker', 'FAILED', 30, {
      canRetry: true,
    });

    render(
      <PipelineVisualization 
        executions={[failedExecution]} 
        documentName="Test" 
        onRetry={handleRetry}
        showActions 
      />
    );

    const retryButton = screen.getByRole('button', { name: /retry/i });
    await user.click(retryButton);
    expect(handleRetry).toHaveBeenCalledWith(failedExecution);
  });

  it('should call onSkip when skip button is clicked', async () => {
    const user = userEvent.setup();
    const handleSkip = jest.fn();
    const failedExecution = createMockStageExecution('markdown-optimizer', 'FAILED', 20, {
      canSkip: true,
    });

    render(
      <PipelineVisualization 
        executions={[failedExecution]} 
        documentName="Test" 
        onSkip={handleSkip}
        showActions 
      />
    );

    const skipButton = screen.getByRole('button', { name: /skip/i });
    await user.click(skipButton);
    expect(handleSkip).toHaveBeenCalledWith(failedExecution);
  });

  it('should handle keyboard navigation for interactive stages', async () => {
    const user = userEvent.setup();
    const handleStageClick = jest.fn();

    render(
      <PipelineVisualization 
        {...defaultProps} 
        interactive 
        onStageClick={handleStageClick} 
      />
    );

    const stageElement = screen.getByText('Markdown Conversion').closest('[role="button"]');
    expect(stageElement).toHaveTabIndex(0);
    
    stageElement!.focus();
    await user.keyboard('{Enter}');
    expect(handleStageClick).toHaveBeenCalledWith(mockExecutions[0]);
  });

  it('should display pipeline summary with stage counts', () => {
    const mixedExecutions = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
      createMockStageExecution('markdown-optimizer', 'SKIPPED', 0),
      createMockStageExecution('chunker', 'RUNNING', 50),
      createMockStageExecution('fact-generator', 'FAILED', 25),
      createMockStageExecution('ingestor', 'PENDING', 0),
    ];

    render(
      <PipelineVisualization 
        executions={mixedExecutions} 
        documentName="Mixed Test"
        showDetails 
      />
    );

    expect(screen.getByText('1')).toBeInTheDocument(); // Completed
    expect(screen.getByText('Completed')).toBeInTheDocument();
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Skipped')).toBeInTheDocument();
  });

  it('should show animated progress arrows between stages', () => {
    render(<PipelineVisualization {...defaultProps} showAnimatedProgress />);
    
    // Should have arrows connecting the stages
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('should handle missing stages gracefully', () => {
    const incompleteExecutions = [
      createMockStageExecution('markdown-conversion', 'COMPLETED', 100),
      // Missing some stages
    ];

    render(
      <PipelineVisualization 
        executions={incompleteExecutions} 
        documentName="Incomplete Test" 
      />
    );

    // Should still render all pipeline stages (with missing ones as pending)
    expect(screen.getByText('Markdown Conversion')).toBeInTheDocument();
    expect(screen.getByText('Chunker')).toBeInTheDocument();
    expect(screen.getByText('Ingestor')).toBeInTheDocument();
  });

  it('should display running stage with spinning animation', () => {
    render(<PipelineVisualization {...defaultProps} />);
    
    // Should have an animated spinner for the running stage
    const spinners = screen.getAllByRole('img');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('should show progress bar for running stages', () => {
    render(<PipelineVisualization {...defaultProps} />);
    
    // Should have progress bars for stages with progress > 0
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  it('should provide accessibility features', () => {
    render(<PipelineVisualization {...defaultProps} />);
    
    // Should have aria-live region for screen readers
    const liveRegion = screen.getByText(/Pipeline processing status/);
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion.closest('[aria-live="polite"]')).toBeInTheDocument();
    expect(liveRegion.closest('[aria-atomic="true"]')).toBeInTheDocument();
  });

  it('should handle different layout variants', () => {
    const { rerender } = render(<PipelineVisualization {...defaultProps} layout="horizontal" />);
    expect(screen.getByText('Processing Pipeline')).toBeInTheDocument();
    
    rerender(<PipelineVisualization {...defaultProps} layout="compact" />);
    expect(screen.getByText('Processing Pipeline')).toBeInTheDocument();
  });

  it('should handle different size variants', () => {
    const { rerender } = render(<PipelineVisualization {...defaultProps} size="sm" />);
    expect(screen.getByText('Processing Pipeline')).toBeInTheDocument();
    
    rerender(<PipelineVisualization {...defaultProps} size="lg" />);
    expect(screen.getByText('Processing Pipeline')).toBeInTheDocument();
  });

  it('should not show retry button if stage cannot be retried', () => {
    const failedExecution = createMockStageExecution('chunker', 'FAILED', 30, {
      canRetry: false,
      canSkip: false,
    });

    render(
      <PipelineVisualization 
        executions={[failedExecution]} 
        documentName="Test" 
        showActions 
      />
    );

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument();
  });
});