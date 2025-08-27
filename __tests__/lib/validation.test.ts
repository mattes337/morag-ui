import { validateFileName, validateFile } from '../../lib/validation';

describe('validateFileName', () => {
  it('should accept valid filenames', () => {
    const validNames = [
      'document.pdf',
      'my-file.txt',
      'file_name.docx',
      'simple.md',
      'file with spaces.pdf',
      'file,with,commas.txt',
      'file....md', // Multiple dots before extension should be allowed
      'no, not writing an llm coding agent. create an im....md', // The problematic filename
    ];

    validNames.forEach(fileName => {
      const result = validateFileName(fileName);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it('should reject dangerous file extensions', () => {
    const dangerousNames = [
      'malware.exe',
      'script.bat',
      'virus.scr',
      'trojan.vbs',
      'malicious.js',
    ];

    dangerousNames.forEach(fileName => {
      const result = validateFileName(fileName);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not allowed for security reasons');
    });
  });

  it('should reject path traversal attempts', () => {
    const pathTraversalNames = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32\\config',
      'file/../other.txt',
      'file\\..\\other.txt',
      'normal/path/file.txt', // Forward slashes not allowed
      'normal\\path\\file.txt', // Backslashes not allowed
    ];

    pathTraversalNames.forEach(fileName => {
      const result = validateFileName(fileName);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('invalid characters');
    });
  });

  it('should allow consecutive dots that are not path traversal', () => {
    const validDotNames = [
      'file..txt',
      'document...pdf',
      'file....md',
      'test.....docx',
      '...file.txt', // Leading dots (though unusual)
    ];

    validDotNames.forEach(fileName => {
      const result = validateFileName(fileName);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });
});

describe('validateFile', () => {
  it('should validate file with problematic name', () => {
    // Create a mock File object
    const mockFile = {
      name: 'no, not writing an llm coding agent. create an im....md',
      type: 'text/markdown',
      size: 1024,
    } as File;

    const result = validateFile(mockFile);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject files with dangerous extensions', () => {
    const mockFile = {
      name: 'malware.exe',
      type: 'application/octet-stream',
      size: 1024,
    } as File;

    const result = validateFile(mockFile);
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('not allowed for security reasons');
  });
});
