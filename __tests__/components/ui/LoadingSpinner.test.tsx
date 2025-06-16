import React from 'react';
import { render, screen } from '../../../lib/test-utils';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
    it('should render loading spinner', () => {
        render(<LoadingSpinner data-oid="t.m3pw-" />);

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
        render(<LoadingSpinner data-testid="spinner-container" />);

        const spinnerContainer = screen.getByTestId('spinner-container');
        expect(spinnerContainer).toHaveClass('flex', 'items-center', 'justify-center', 'p-8');
    });
});
