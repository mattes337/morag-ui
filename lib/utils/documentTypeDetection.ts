/**
 * Document type detection utilities
 * Determines document type and subtype based on file extension, MIME type, or URL patterns
 */

export interface DocumentTypeInfo {
    type: 'document' | 'video' | 'audio' | 'website' | 'youtube';
    subType?: string;
}

/**
 * Detects document type and subtype from filename or URL
 */
export function detectDocumentType(input: string | { filename?: string; url?: string }): DocumentTypeInfo {
    let inputString: string;
    
    if (typeof input === 'string') {
        inputString = input;
    } else {
        inputString = input.url || input.filename || '';
    }
    
    const lowerInput = inputString.toLowerCase();
    
    // YouTube detection
    if (lowerInput.includes('youtube.com') || lowerInput.includes('youtu.be')) {
        return { type: 'youtube' };
    }
    
    // Website detection (URLs)
    if (lowerInput.startsWith('http://') || lowerInput.startsWith('https://')) {
        return { type: 'website' };
    }
    
    // Extract file extension
    const extensionMatch = lowerInput.match(/\.([a-z0-9]+)$/);
    const extension = extensionMatch ? extensionMatch[1] : '';
    
    // Document types
    const documentExtensions = {
        // Text documents
        'pdf': 'pdf',
        'doc': 'word',
        'docx': 'word',
        'txt': 'text',
        'md': 'markdown',
        'markdown': 'markdown',
        'rtf': 'rtf',
        'odt': 'odt',
        
        // Spreadsheets
        'xls': 'excel',
        'xlsx': 'excel',
        'csv': 'csv',
        'ods': 'ods',
        
        // Presentations
        'ppt': 'powerpoint',
        'pptx': 'powerpoint',
        'odp': 'odp',
        
        // Other document formats
        'epub': 'epub',
        'mobi': 'mobi',
        'azw': 'azw',
        'azw3': 'azw3',
    };
    
    // Video types
    const videoExtensions = {
        'mp4': 'mp4',
        'avi': 'avi',
        'mov': 'mov',
        'wmv': 'wmv',
        'flv': 'flv',
        'webm': 'webm',
        'mkv': 'mkv',
        'm4v': 'm4v',
        '3gp': '3gp',
        'ogv': 'ogv',
    };
    
    // Audio types
    const audioExtensions = {
        'mp3': 'mp3',
        'wav': 'wav',
        'flac': 'flac',
        'aac': 'aac',
        'ogg': 'ogg',
        'wma': 'wma',
        'm4a': 'm4a',
        'opus': 'opus',
        'aiff': 'aiff',
    };
    
    // Check document types
    if (extension in documentExtensions) {
        return {
            type: 'document',
            subType: documentExtensions[extension as keyof typeof documentExtensions]
        };
    }
    
    // Check video types
    if (extension in videoExtensions) {
        return {
            type: 'video',
            subType: videoExtensions[extension as keyof typeof videoExtensions]
        };
    }
    
    // Check audio types
    if (extension in audioExtensions) {
        return {
            type: 'audio',
            subType: audioExtensions[extension as keyof typeof audioExtensions]
        };
    }
    
    // Default to document type if no specific type detected
    return {
        type: 'document',
        subType: extension || undefined
    };
}

/**
 * Checks if a file should be stored as markdown without conversion
 */
export function shouldStoreAsMarkdown(filename: string): boolean {
    const lowerFilename = filename.toLowerCase();
    return lowerFilename.endsWith('.md') || lowerFilename.endsWith('.markdown');
}

/**
 * Gets a human-readable description of the document type
 */
export function getDocumentTypeDescription(type: string, subType?: string): string {
    if (type === 'youtube') {
        return 'YouTube Video';
    }
    
    if (type === 'website') {
        return 'Website';
    }
    
    if (type === 'document') {
        if (subType) {
            switch (subType) {
                case 'markdown':
                    return 'Markdown Document';
                case 'pdf':
                    return 'PDF Document';
                case 'word':
                    return 'Word Document';
                case 'excel':
                    return 'Excel Document';
                case 'powerpoint':
                    return 'PowerPoint Document';
                case 'text':
                    return 'Text Document';
                case 'csv':
                    return 'CSV Document';
                case 'epub':
                    return 'EPUB Document';
                case 'rtf':
                    return 'RTF Document';
                default:
                    return `${subType.toUpperCase()} Document`;
            }
        }
        return 'Document';
    }
    
    if (type === 'video') {
        return `${subType?.toUpperCase() || 'Video'} File`;
    }
    
    if (type === 'audio') {
        return `${subType?.toUpperCase() || 'Audio'} File`;
    }
    
    return 'Unknown Document Type';
}