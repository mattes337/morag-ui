import { validateFileUploadSecurity } from '../../lib/middleware/fileUploadSecurity';
import { validateFileName } from '../../lib/validation';

// Mock File object for testing
class MockFile implements File {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  webkitRelativePath: string;
  private content: string;

  constructor(name: string, type: string = 'text/markdown', size: number = 1024) {
    this.name = name;
    this.type = type;
    this.size = size;
    this.lastModified = Date.now();
    this.webkitRelativePath = '';
    this.content = `# Test Document\n\nThis is a test markdown file.`;
  }

  arrayBuffer(): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    return Promise.resolve(encoder.encode(this.content).buffer);
  }

  slice(start?: number, end?: number, contentType?: string): Blob {
    const slicedContent = this.content.slice(start, end);
    return {
      size: slicedContent.length,
      type: contentType || this.type,
      arrayBuffer: () => {
        const encoder = new TextEncoder();
        return Promise.resolve(encoder.encode(slicedContent).buffer);
      },
      slice: (s?: number, e?: number, ct?: string) => this.slice(s, e, ct),
      stream: () => { throw new Error('Method not implemented.'); },
      text: () => Promise.resolve(slicedContent),
    } as Blob;
  }

  stream(): ReadableStream<Uint8Array> {
    throw new Error('Method not implemented.');
  }

  text(): Promise<string> {
    return Promise.resolve(this.content);
  }
}

describe('validateFileName', () => {
  it('should accept the problematic filename that was causing 400 error', () => {
    const fileName = 'no, not writing an llm coding agent. create an im....md';
    const result = validateFileName(fileName);

    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });
});

describe('validateFileUploadSecurity', () => {
  it('should accept file with problematic filename that was causing 400 error', async () => {
    const file = new MockFile('no, not writing an llm coding agent. create an im....md');

    const result = await validateFileUploadSecurity(file);

    // The file should be secure
    expect(result.isSecure).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should accept files with multiple consecutive dots', async () => {
    const testFiles = [
      'document....pdf',
      'file...txt',
      'test..md',
      'data.....json',
    ];

    for (const fileName of testFiles) {
      const file = new MockFile(fileName, 'text/plain');
      const result = await validateFileUploadSecurity(file);
      
      expect(result.isSecure).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('should reject files with actual path traversal attempts', async () => {
    const maliciousFiles = [
      '../../../etc/passwd',
      '..\\..\\windows\\system32\\config',
      'file/../other.txt',
      'file\\..\\other.txt',
    ];

    for (const fileName of maliciousFiles) {
      const file = new MockFile(fileName);
      const result = await validateFileUploadSecurity(file);
      
      expect(result.isSecure).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('invalid characters'))).toBe(true);
    }
  });

  it('should reject files with dangerous extensions', async () => {
    const dangerousFiles = [
      'malware.exe',
      'script.bat',
      'virus.scr',
      'trojan.vbs',
    ];

    for (const fileName of dangerousFiles) {
      const file = new MockFile(fileName, 'application/octet-stream');
      const result = await validateFileUploadSecurity(file);
      
      expect(result.isSecure).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(error => error.includes('not allowed for security reasons'))).toBe(true);
    }
  });

  it('should handle files with commas and special characters in names', async () => {
    const specialFiles = [
      'file, with, commas.txt',
      'file with spaces.pdf',
      'file-with-dashes.md',
      'file_with_underscores.docx',
      'file (with parentheses).txt',
      'file [with brackets].pdf',
    ];

    for (const fileName of specialFiles) {
      const file = new MockFile(fileName, 'text/plain');
      const result = await validateFileUploadSecurity(file);
      
      expect(result.isSecure).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });

  it('should handle markdown files with various MIME types', async () => {
    const markdownFile = 'test.md';
    const mimeTypes = [
      'text/markdown',
      'text/plain',
      'application/octet-stream',
      '', // Empty MIME type
    ];

    for (const mimeType of mimeTypes) {
      const file = new MockFile(markdownFile, mimeType);
      const result = await validateFileUploadSecurity(file);
      
      expect(result.isSecure).toBe(true);
      expect(result.errors).toHaveLength(0);
    }
  });
});
