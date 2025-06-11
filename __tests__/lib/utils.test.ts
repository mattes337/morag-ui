import { cn } from '../../lib/utils';

describe('utils', () => {
    describe('cn (className utility)', () => {
        it('should merge class names', () => {
            const result = cn('class1', 'class2');
            expect(result).toBe('class1 class2');
        });

        it('should handle conditional classes', () => {
            const result = cn('base', true && 'conditional', false && 'hidden');
            expect(result).toBe('base conditional');
        });

        it('should handle undefined and null values', () => {
            const result = cn('base', undefined, null, 'valid');
            expect(result).toBe('base valid');
        });

        it('should handle empty strings', () => {
            const result = cn('base', '', 'valid');
            expect(result).toBe('base valid');
        });

        it('should handle arrays', () => {
            const result = cn(['class1', 'class2'], 'class3');
            expect(result).toBe('class1 class2 class3');
        });

        it('should handle objects', () => {
            const result = cn({
                class1: true,
                class2: false,
                class3: true,
            });
            expect(result).toBe('class1 class3');
        });

        it('should merge Tailwind classes correctly', () => {
            const result = cn('px-2 py-1', 'px-4');
            // Should prioritize the last px class
            expect(result).toContain('px-4');
            expect(result).toContain('py-1');
        });
    });
});
