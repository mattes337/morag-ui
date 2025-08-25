import { unifiedFileService } from './unifiedFileService';
import { detectDocumentType, shouldStoreAsMarkdown } from '../utils/documentTypeDetection';

export interface ConversionOptions {
  preserveFormatting?: boolean;
  extractImages?: boolean;
  includeMetadata?: boolean;
  optimizeForReadability?: boolean;
}

export interface ConversionResult {
  markdown: string;
  metadata: {
    originalFilename: string;
    fileType: string;
    conversionDate: string;
    wordCount: number;
    characterCount: number;
    extractedImages?: string[];
  };
}

export class MarkdownConversionService {
  /**
   * Convert a file to markdown format
   */
  static async convertToMarkdown(
    fileId: string,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    // Get file information with content
    const file = await unifiedFileService.getFile(fileId, true);
    if (!file) {
      throw new Error('File not found');
    }

    // Get file content from the file object or read from filesystem
    let fileContent: Buffer;
    if (file.content) {
      fileContent = Buffer.from(file.content);
    } else {
      // If content is not available, try to read from file stream
      const stream = await unifiedFileService.getFileStream(fileId);
      if (!stream) {
        throw new Error('Could not retrieve file content');
      }

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      fileContent = Buffer.concat(chunks);
    }

    // Detect document type
    const docType = detectDocumentType(file.originalName || file.filename);

    // If already markdown, return as-is with minimal processing
    if (shouldStoreAsMarkdown(file.originalName || file.filename)) {
      return this.processExistingMarkdown(fileContent, file, options);
    }

    // Convert based on file type
    let markdown: string;
    const extractedImages: string[] = [];

    switch (docType.subType) {
      case 'pdf':
        markdown = await this.convertPdfToMarkdown(fileContent, options);
        break;
      case 'word':
        markdown = await this.convertWordToMarkdown(fileContent, options);
        break;
      case 'text':
        markdown = await this.convertTextToMarkdown(fileContent, options);
        break;
      case 'csv':
        markdown = await this.convertCsvToMarkdown(fileContent, options);
        break;
      default:
        // For unsupported types, create a basic markdown document
        markdown = await this.createBasicMarkdown(file, fileContent, options);
    }

    // Add metadata header if requested
    if (options.includeMetadata) {
      markdown = this.addMetadataHeader(markdown, file, docType);
    }

    // Calculate statistics
    const wordCount = markdown.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = markdown.length;

    return {
      markdown,
      metadata: {
        originalFilename: file.originalName || file.filename,
        fileType: docType.subType || 'unknown',
        conversionDate: new Date().toISOString(),
        wordCount,
        characterCount,
        extractedImages: extractedImages.length > 0 ? extractedImages : undefined,
      },
    };
  }

  /**
   * Process existing markdown files
   */
  private static async processExistingMarkdown(
    content: Buffer,
    file: any,
    options: ConversionOptions
  ): Promise<ConversionResult> {
    let markdown = content.toString('utf-8');

    // Optimize for readability if requested
    if (options.optimizeForReadability) {
      markdown = this.optimizeMarkdownReadability(markdown);
    }

    const wordCount = markdown.split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = markdown.length;

    return {
      markdown,
      metadata: {
        originalFilename: file.originalName || file.filename,
        fileType: 'markdown',
        conversionDate: new Date().toISOString(),
        wordCount,
        characterCount,
      },
    };
  }

  /**
   * Convert PDF to markdown (placeholder - would integrate with PDF parsing library)
   */
  private static async convertPdfToMarkdown(
    content: Buffer,
    options: ConversionOptions
  ): Promise<string> {
    // TODO: Integrate with PDF parsing library like pdf-parse or pdf2pic
    // For now, return a placeholder that indicates PDF processing is needed
    return `# PDF Document

> **Note**: This PDF document requires processing with a PDF parsing service.
> 
> **File Size**: ${(content.length / 1024).toFixed(1)} KB
> **Processing Date**: ${new Date().toISOString()}

## Content

This PDF document contains ${Math.ceil(content.length / 1000)} estimated content units.
To view the actual content, please integrate with a PDF parsing service such as:

- pdf-parse (Node.js)
- PyPDF2 (Python)
- Apache PDFBox (Java)
- Or a cloud service like Google Document AI

## Next Steps

1. Install a PDF parsing library
2. Extract text content from the PDF
3. Convert extracted text to markdown format
4. Preserve document structure (headings, lists, tables)
5. Extract and reference any embedded images

`;
  }

  /**
   * Convert Word document to markdown (placeholder)
   */
  private static async convertWordToMarkdown(
    content: Buffer,
    options: ConversionOptions
  ): Promise<string> {
    // TODO: Integrate with Word parsing library like mammoth.js
    return `# Word Document

> **Note**: This Word document requires processing with a Word parsing service.
> 
> **File Size**: ${(content.length / 1024).toFixed(1)} KB
> **Processing Date**: ${new Date().toISOString()}

## Content

This Word document contains ${Math.ceil(content.length / 1000)} estimated content units.
To view the actual content, please integrate with a Word parsing service such as:

- mammoth.js (Node.js)
- python-docx (Python)
- Apache POI (Java)

## Recommended Integration

\`\`\`javascript
const mammoth = require("mammoth");
const result = await mammoth.convertToMarkdown({buffer: content});
return result.value; // The markdown content
\`\`\`

`;
  }

  /**
   * Convert plain text to markdown
   */
  private static async convertTextToMarkdown(
    content: Buffer,
    options: ConversionOptions
  ): Promise<string> {
    let text = content.toString('utf-8');

    // Basic text to markdown conversion
    // Add title if the text doesn't start with one
    if (!text.trim().startsWith('#')) {
      text = `# Text Document\n\n${text}`;
    }

    // Convert double line breaks to proper paragraph breaks
    text = text.replace(/\n\n+/g, '\n\n');

    // Convert lines that look like headers (ALL CAPS or followed by ===)
    text = text.replace(/^([A-Z][A-Z\s]+)$/gm, '## $1');
    text = text.replace(/^(.+)\n=+$/gm, '# $1');
    text = text.replace(/^(.+)\n-+$/gm, '## $1');

    return text;
  }

  /**
   * Convert CSV to markdown table
   */
  private static async convertCsvToMarkdown(
    content: Buffer,
    options: ConversionOptions
  ): Promise<string> {
    const csvText = content.toString('utf-8');
    const lines = csvText.split('\n').filter(line => line.trim());

    if (lines.length === 0) {
      return '# Empty CSV\n\nThis CSV file contains no data.';
    }

    let markdown = '# CSV Data\n\n';

    // Parse CSV (basic implementation - would use a proper CSV parser in production)
    const rows = lines.map(line => {
      // Simple CSV parsing - doesn't handle quoted commas properly
      return line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
    });

    if (rows.length > 0) {
      // Create markdown table
      const headers = rows[0];
      markdown += '| ' + headers.join(' | ') + ' |\n';
      markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

      // Add data rows (limit to first 100 rows for performance)
      const dataRows = rows.slice(1, 101);
      for (const row of dataRows) {
        markdown += '| ' + row.join(' | ') + ' |\n';
      }

      if (rows.length > 101) {
        markdown += `\n*Note: Showing first 100 rows of ${rows.length - 1} total data rows.*\n`;
      }
    }

    return markdown;
  }

  /**
   * Create basic markdown for unsupported file types
   */
  private static async createBasicMarkdown(
    file: any,
    content: Buffer,
    options: ConversionOptions
  ): Promise<string> {
    const filename = file.originalName || file.filename;
    const fileSize = (content.length / 1024).toFixed(1);

    return `# ${filename}

> **File Type**: Unsupported for automatic conversion
> **File Size**: ${fileSize} KB
> **Upload Date**: ${new Date().toISOString()}

## File Information

This file type is not currently supported for automatic markdown conversion.

**Supported formats include:**
- PDF documents
- Word documents (.doc, .docx)
- Plain text files (.txt)
- Markdown files (.md)
- CSV files (.csv)

## Manual Processing Required

To process this file:

1. Download the original file
2. Use appropriate software to view/edit the content
3. Manually convert to markdown format if needed
4. Re-upload as a markdown file

## File Content

The original file is preserved and can be downloaded from the file management section.

`;
  }

  /**
   * Add metadata header to markdown
   */
  private static addMetadataHeader(markdown: string, file: any, docType: any): string {
    const header = `---
filename: ${file.originalName || file.filename}
fileType: ${docType.subType || 'unknown'}
fileSize: ${file.filesize || 0}
uploadDate: ${file.createdAt || new Date().toISOString()}
conversionDate: ${new Date().toISOString()}
---

`;
    return header + markdown;
  }

  /**
   * Optimize markdown for readability
   */
  private static optimizeMarkdownReadability(markdown: string): string {
    // Remove excessive whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Ensure proper spacing around headers
    markdown = markdown.replace(/^(#{1,6})\s*(.+)$/gm, '$1 $2\n');

    // Ensure proper list formatting
    markdown = markdown.replace(/^(\s*[-*+])\s*(.+)$/gm, '$1 $2');

    return markdown.trim();
  }
}
