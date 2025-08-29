/**
 * Test for YouTube URL corruption fix
 * Verifies that URLs are properly corrected at all stages of processing
 */

import { fixUrlCorruption } from '../../lib/utils/youtubeUtils';

describe('YouTube URL Corruption Fix', () => {
  describe('fixUrlCorruption utility', () => {
    it('should fix missing slash in HTTPS protocol', () => {
      const corruptedUrl = 'https:/www.youtube.com/watch?v=siBSKuWmV8s';
      const expectedUrl = 'https://www.youtube.com/watch?v=siBSKuWmV8s';
      
      const result = fixUrlCorruption(corruptedUrl);
      
      expect(result).toBe(expectedUrl);
    });

    it('should fix missing slash in HTTP protocol', () => {
      const corruptedUrl = 'http:/www.youtube.com/watch?v=siBSKuWmV8s';
      const expectedUrl = 'http://www.youtube.com/watch?v=siBSKuWmV8s';
      
      const result = fixUrlCorruption(corruptedUrl);
      
      expect(result).toBe(expectedUrl);
    });

    it('should not modify already correct URLs', () => {
      const correctUrl = 'https://www.youtube.com/watch?v=siBSKuWmV8s';
      
      const result = fixUrlCorruption(correctUrl);
      
      expect(result).toBe(correctUrl);
    });

    it('should handle various YouTube URL formats', () => {
      const testCases = [
        {
          input: 'https:/youtu.be/siBSKuWmV8s',
          expected: 'https://youtu.be/siBSKuWmV8s'
        },
        {
          input: 'https:/www.youtube.com/embed/siBSKuWmV8s',
          expected: 'https://www.youtube.com/embed/siBSKuWmV8s'
        },
        {
          input: 'https:/www.youtube.com/v/siBSKuWmV8s',
          expected: 'https://www.youtube.com/v/siBSKuWmV8s'
        }
      ];

      testCases.forEach(({ input, expected }) => {
        const result = fixUrlCorruption(input);
        expect(result).toBe(expected);
      });
    });

    it('should handle edge cases gracefully', () => {
      expect(fixUrlCorruption('')).toBe('');
      expect(fixUrlCorruption(null as any)).toBe(null);
      expect(fixUrlCorruption(undefined as any)).toBe(undefined);
      expect(fixUrlCorruption('not-a-url')).toBe('not-a-url');
    });

    it('should handle multiple protocol issues in one URL', () => {
      // This shouldn't happen in practice, but test for robustness
      const weirdUrl = 'https:/example.com';
      const result = fixUrlCorruption(weirdUrl);
      expect(result).toBe('https://example.com');
    });
  });

  describe('JSON serialization/deserialization', () => {
    it('should preserve corrected URLs through JSON round-trip', () => {
      const originalCorruptedUrl = 'https:/www.youtube.com/watch?v=siBSKuWmV8s';
      const correctedUrl = fixUrlCorruption(originalCorruptedUrl);
      
      // Test array serialization (like input_files)
      const urlArray = [correctedUrl];
      const jsonString = JSON.stringify(urlArray);
      const parsedArray = JSON.parse(jsonString);
      
      expect(parsedArray[0]).toBe(correctedUrl);
      expect(parsedArray[0]).toBe('https://www.youtube.com/watch?v=siBSKuWmV8s');
    });

    it('should preserve corrected URLs in metadata objects', () => {
      const originalCorruptedUrl = 'https:/www.youtube.com/watch?v=siBSKuWmV8s';
      const correctedUrl = fixUrlCorruption(originalCorruptedUrl);
      
      // Test metadata object serialization (like job metadata)
      const metadata = {
        sourceUrl: correctedUrl,
        documentType: 'youtube',
        documentSubType: 'unknown'
      };
      
      const jsonString = JSON.stringify(metadata);
      const parsedMetadata = JSON.parse(jsonString);
      
      expect(parsedMetadata.sourceUrl).toBe(correctedUrl);
      expect(parsedMetadata.sourceUrl).toBe('https://www.youtube.com/watch?v=siBSKuWmV8s');
    });
  });

  describe('FormData handling', () => {
    it('should preserve corrected URLs in FormData', () => {
      const originalCorruptedUrl = 'https:/www.youtube.com/watch?v=siBSKuWmV8s';
      const correctedUrl = fixUrlCorruption(originalCorruptedUrl);
      
      // Test FormData handling (like backend API calls)
      const formData = new FormData();
      formData.append('input_files', JSON.stringify([correctedUrl]));
      
      const retrievedValue = formData.get('input_files') as string;
      const parsedUrls = JSON.parse(retrievedValue);
      
      expect(parsedUrls[0]).toBe(correctedUrl);
      expect(parsedUrls[0]).toBe('https://www.youtube.com/watch?v=siBSKuWmV8s');
    });
  });

  describe('URL validation', () => {
    it('should produce valid URLs after correction', () => {
      const corruptedUrls = [
        'https:/www.youtube.com/watch?v=siBSKuWmV8s',
        'http:/www.youtube.com/watch?v=siBSKuWmV8s',
        'https:/youtu.be/siBSKuWmV8s'
      ];

      corruptedUrls.forEach(corruptedUrl => {
        const correctedUrl = fixUrlCorruption(corruptedUrl);
        
        // Should be able to create a valid URL object
        expect(() => new URL(correctedUrl)).not.toThrow();
        
        // Should have correct protocol
        const urlObj = new URL(correctedUrl);
        expect(['http:', 'https:']).toContain(urlObj.protocol);
      });
    });
  });
});
