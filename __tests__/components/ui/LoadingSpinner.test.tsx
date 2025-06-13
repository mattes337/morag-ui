import React from 'react';
import { render, screen } from '../../utils/test-utils';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
    it('should render loading spinner', () => {
        render(<LoadingSpinner data-oid=".xm8k7q" />);

        const spinner = screen.getByTestId('loading-spinner');
        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass(
            'animate-spin',
            'rounded-full',
            'h-8',
            'w-8',
            'border-b-2',
            'border-blue-600',
        );
    });

    it('should have correct container styling', () => {
        const { container } = render(<LoadingSpinner data-oid="hs2cgol" />);

        const spinnerContainer = container.firstChild;
        expect(spinnerContainer).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');
    });
});
