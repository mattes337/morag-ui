import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  testComponentAccessibility 
} from '@/lib/accessibility/a11y-test-utils';
import { DropZone } from './DropZone';

// Mock file validation
jest.mock('@/lib/utils/fileValidation');

const mockProps = {
  onDrop: jest.fn(),
  onDragEnter: jest.fn(),
  onDragLeave: jest.fn(),
  accept: 'application/pdf,text/plain',
  maxSize: 50 * 1024 * 1024, // 50MB
  disabled: false,
};

describe('DropZone Accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Accessibility', () => {
    test('meets WCAG 2.1 AA standards', async () => {
      await testComponentAccessibility(<DropZone {...mockProps} />);
    });

    test('has proper ARIA attributes', () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      expect(dropZone).toHaveAttribute('tabIndex', '0');
      expect(dropZone).toHaveAttribute('aria-label', expect.stringMatching(/drop.*files|upload.*area/i));
      expect(dropZone).toHaveAttribute('role', 'region');
    });

    test('provides clear instructions to users', () => {
      render(<DropZone {...mockProps} />);
      
      expect(screen.getByText(/drag.*drop|drop.*files/i)).toBeInTheDocument();
      expect(screen.getByText(/click.*browse|browse.*files/i)).toBeInTheDocument();
    });

    test('shows accepted file types', () => {
      render(<DropZone {...mockProps} accept="application/pdf,.txt,.docx" />);
      
      expect(screen.getByText(/pdf|txt|docx/i)).toBeInTheDocument();
    });

    test('displays maximum file size information', () => {
      const maxSize = 25 * 1024 * 1024; // 25MB
      render(<DropZone {...mockProps} maxSize={maxSize} />);
      
      expect(screen.getByText(/25.*mb|maximum.*25/i)).toBeInTheDocument();
    });
  });

  describe('Visual Feedback', () => {
    test('shows drag over state visually', async () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      
      // Simulate drag enter
      act(() => {
        const dragEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer: new DataTransfer()
        });
        dropZone.dispatchEvent(dragEvent);
      });
      
      await waitFor(() => {
        expect(dropZone).toHaveAttribute('data-drag-active', 'true');
        expect(mockProps.onDragEnter).toHaveBeenCalled();
      });
    });

    test('shows drag leave state', async () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      
      // First enter drag state
      act(() => {
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer: new DataTransfer()
        });
        dropZone.dispatchEvent(dragEnterEvent);
      });
      
      // Then leave drag state
      act(() => {
        const dragLeaveEvent = new DragEvent('dragleave', {
          bubbles: true,
          dataTransfer: new DataTransfer()
        });
        dropZone.dispatchEvent(dragLeaveEvent);
      });
      
      await waitFor(() => {
        expect(dropZone).toHaveAttribute('data-drag-active', 'false');
        expect(mockProps.onDragLeave).toHaveBeenCalled();
      });
    });

    test('shows reject animation for invalid files', async () => {
      render(<DropZone {...mockProps} accept="application/pdf" />);
      
      const dropZone = screen.getByRole('region');
      
      // Create invalid file type
      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      
      act(() => {
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dragEnterEvent);
      });
      
      await waitFor(() => {
        expect(dropZone).toHaveAttribute('data-drag-reject', 'true');
      });
    });

    test('shows accept animation for valid files', async () => {
      render(<DropZone {...mockProps} accept="application/pdf" />);
      
      const dropZone = screen.getByRole('region');
      
      // Create valid file type
      const validFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(validFile);
      
      act(() => {
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dragEnterEvent);
      });
      
      await waitFor(() => {
        expect(dropZone).toHaveAttribute('data-drag-accept', 'true');
      });
    });
  });

  describe('File Type Previews', () => {
    test('shows file type icons during drag', async () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      const pdfFile = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(pdfFile);
      
      act(() => {
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dragEnterEvent);
      });
      
      await waitFor(() => {
        // Should show file type indicator
        expect(screen.getByText(/pdf/i)).toBeInTheDocument();
      });
    });

    test('shows multiple file type indicators', async () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      const pdfFile = new File(['content1'], 'document1.pdf', { type: 'application/pdf' });
      const txtFile = new File(['content2'], 'document2.txt', { type: 'text/plain' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(pdfFile);
      dataTransfer.items.add(txtFile);
      
      act(() => {
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dragEnterEvent);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/2.*files/i)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Interaction', () => {
    test('is keyboard focusable', async () => {
      const user = userEvent.setup();
      render(<DropZone {...mockProps} />);
      
      await user.tab();
      expect(screen.getByRole('region')).toHaveFocus();
    });

    test('activates on enter key', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<DropZone {...mockProps} onClick={onClick} />);
      
      const dropZone = screen.getByRole('region');
      dropZone.focus();
      
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalled();
    });

    test('activates on space key', async () => {
      const user = userEvent.setup();
      const onClick = jest.fn();
      
      render(<DropZone {...mockProps} onClick={onClick} />);
      
      const dropZone = screen.getByRole('region');
      dropZone.focus();
      
      await user.keyboard('{Space}');
      expect(onClick).toHaveBeenCalled();
    });

    test('provides keyboard instructions', () => {
      render(<DropZone {...mockProps} />);
      
      expect(screen.getByText(/press.*enter.*space/i)).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    test('handles disabled state correctly', () => {
      render(<DropZone {...mockProps} disabled={true} />);
      
      const dropZone = screen.getByRole('region');
      expect(dropZone).toHaveAttribute('aria-disabled', 'true');
      expect(dropZone).toHaveAttribute('tabIndex', '-1');
    });

    test('does not respond to events when disabled', async () => {
      render(<DropZone {...mockProps} disabled={true} />);
      
      const dropZone = screen.getByRole('region');
      
      act(() => {
        const dragEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer: new DataTransfer()
        });
        dropZone.dispatchEvent(dragEvent);
      });
      
      // Should not call event handlers when disabled
      expect(mockProps.onDragEnter).not.toHaveBeenCalled();
    });

    test('shows disabled visual state', () => {
      render(<DropZone {...mockProps} disabled={true} />);
      
      const dropZone = screen.getByRole('region');
      expect(dropZone).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Drop Handling', () => {
    test('handles successful file drop', async () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      act(() => {
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dropEvent);
      });
      
      await waitFor(() => {
        expect(mockProps.onDrop).toHaveBeenCalledWith([file]);
      });
    });

    test('prevents browser default drag behavior', () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      
      const dragEvent = new DragEvent('dragover', { bubbles: true });
      const preventDefaultSpy = jest.spyOn(dragEvent, 'preventDefault');
      
      act(() => {
        dropZone.dispatchEvent(dragEvent);
      });
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('handles file system access errors gracefully', () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      
      // Simulate drop event that might fail
      const dataTransfer = new DataTransfer();
      
      act(() => {
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dropEvent);
      });
      
      // Should not crash and should call onDrop with empty array
      expect(mockProps.onDrop).toHaveBeenCalledWith([]);
    });

    test('shows error state for failed operations', async () => {
      const onDrop = jest.fn().mockRejectedValue(new Error('Drop failed'));
      
      render(<DropZone {...mockProps} onDrop={onDrop} />);
      
      const dropZone = screen.getByRole('region');
      const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      act(() => {
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dropEvent);
      });
      
      await waitFor(() => {
        expect(dropZone).toHaveAttribute('data-error', 'true');
      });
    });
  });

  describe('Accessibility Announcements', () => {
    test('announces drag state changes to screen readers', async () => {
      render(<DropZone {...mockProps} />);
      
      const dropZone = screen.getByRole('region');
      
      act(() => {
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer: new DataTransfer()
        });
        dropZone.dispatchEvent(dragEnterEvent);
      });
      
      await waitFor(() => {
        const announcement = screen.getByLabelText(/ready.*drop|drop.*files/i);
        expect(announcement).toBeInTheDocument();
      });
    });

    test('announces file validation results', async () => {
      render(<DropZone {...mockProps} accept="application/pdf" />);
      
      const dropZone = screen.getByRole('region');
      const invalidFile = new File(['content'], 'document.txt', { type: 'text/plain' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      
      act(() => {
        const dragEnterEvent = new DragEvent('dragenter', {
          bubbles: true,
          dataTransfer
        });
        dropZone.dispatchEvent(dragEnterEvent);
      });
      
      await waitFor(() => {
        const announcement = screen.getByText(/invalid.*file.*type|not.*supported/i);
        expect(announcement).toBeInTheDocument();
      });
    });
  });

  describe('Progressive Enhancement', () => {
    test('provides fallback when drag and drop is not available', () => {
      // Mock drag and drop as unavailable
      Object.defineProperty(document.documentElement, 'ondrop', {
        value: undefined,
        configurable: true
      });
      
      render(<DropZone {...mockProps} />);
      
      // Should still render with click functionality
      const dropZone = screen.getByRole('region');
      expect(dropZone).toBeInTheDocument();
      expect(dropZone).toHaveAttribute('role', 'button');
    });

    test('shows appropriate messaging for different capabilities', () => {
      render(<DropZone {...mockProps} />);
      
      // Should have both drag/drop and click instructions
      expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
      expect(screen.getByText(/click.*browse/i)).toBeInTheDocument();
    });
  });
});