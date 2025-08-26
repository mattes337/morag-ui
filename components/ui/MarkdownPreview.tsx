import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  document: any;
  files: any[];
}

const MarkdownPreviewComponent: React.FC<MarkdownPreviewProps> = ({ document, files }) => {
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMarkdownContent, setHasMarkdownContent] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);

  // Memoize the original file to prevent unnecessary re-renders
  const originalFile = useMemo(() =>
    files.find(f =>
      f.fileType === 'ORIGINAL_DOCUMENT' &&
      (f.filename.endsWith('.md') || f.filename.endsWith('.markdown'))
    ), [files]
  );

  // Memoize the fallback content
  const fallbackContent = useMemo(() => `# ${document.name}

## Document Preview

This document is still being processed. The markdown content will appear here once processing is complete.

### Processing Information
- **Status**: ${document.state}
- **Chunks**: ${document.chunks || 0}
- **Quality**: ${document.quality ? (document.quality * 100).toFixed(1) : '0'}%

Please check back later or refresh the page to see the processed content.`, [document.name, document.state, document.chunks, document.quality]);

  const loadOriginalFile = useCallback(async (fileId: string) => {
    if (isLoading || loadAttempted) return;

    setIsLoading(true);
    setLoadAttempted(true);

    try {
      const response = await fetch(`/api/files/${fileId}?includeContent=true`);
      if (response.ok) {
        const data = await response.json();
        if (data.file?.content) {
          const content = typeof data.file.content === 'string'
            ? data.file.content
            : Buffer.from(data.file.content).toString('utf-8');
          setMarkdownContent(content);
          setHasMarkdownContent(false); // This is original content, not processed
          return;
        }
      }
    } catch (error) {
      console.error('Error loading original file:', error);
    } finally {
      setIsLoading(false);
    }

    // If we get here, loading failed, use fallback
    setMarkdownContent(fallbackContent);
    setHasMarkdownContent(false);
  }, [isLoading, loadAttempted, fallbackContent]);

  // Reset state when document ID changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[MarkdownPreview] Document ID changed, resetting state:', document.id);
    }
    setLoadAttempted(false);
    setMarkdownContent(null);
    setHasMarkdownContent(false);
    setIsLoading(false);
  }, [document.id]);

  useEffect(() => {
    // Only load if we haven't attempted yet
    if (!loadAttempted) {
      // Check if processed markdown is available
      if (document.markdown && document.markdown.trim().length > 0) {
        setMarkdownContent(document.markdown);
        setHasMarkdownContent(true);
        setLoadAttempted(true);
        return;
      }

      // If no processed markdown, try to load from original file
      if (originalFile) {
        loadOriginalFile(originalFile.id);
      } else {
        // No original file, use fallback
        setMarkdownContent(fallbackContent);
        setHasMarkdownContent(false);
        setLoadAttempted(true);
      }
    }
  }, [document.markdown, originalFile, loadOriginalFile, fallbackContent, loadAttempted]);

  if (isLoading) {
    return (
      <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Markdown Preview</span>
          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
            Loading...
          </span>
        </div>
        <div className="p-6 bg-white max-h-96 overflow-y-auto">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Markdown Preview</span>
        {hasMarkdownContent ? (
          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
            ✓ Converted
          </span>
        ) : markdownContent && markdownContent !== `# ${document.name}` ? (
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Original File
          </span>
        ) : (
          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
            Processing...
          </span>
        )}
      </div>
      <div className="p-6 bg-white max-h-96 overflow-y-auto">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown
            components={{
              h1: ({children}) => <h1 className="text-2xl font-bold mb-4 text-gray-900">{children}</h1>,
              h2: ({children}) => <h2 className="text-xl font-semibold mb-3 text-gray-800">{children}</h2>,
              h3: ({children}) => <h3 className="text-lg font-medium mb-2 text-gray-700">{children}</h3>,
              p: ({children}) => <p className="mb-3 text-gray-600 leading-relaxed">{children}</p>,
              ul: ({children}) => <ul className="list-disc list-inside mb-3 text-gray-600">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal list-inside mb-3 text-gray-600">{children}</ol>,
              li: ({children}) => <li className="mb-1">{children}</li>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 mb-3">{children}</blockquote>,
              code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">{children}</code>,
              pre: ({children}) => <pre className="bg-gray-100 p-3 rounded overflow-x-auto mb-3">{children}</pre>,
              a: ({children, href}) => <a href={href} className="text-blue-600 hover:text-blue-800 underline">{children}</a>,
              strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
              em: ({children}) => <em className="italic">{children}</em>,
              img: ({src, alt}) => {
                // Handle broken images gracefully
                const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                };

                return (
                  <img
                    src={src}
                    alt={alt || 'Image'}
                    className="max-w-full h-auto mb-3 rounded border"
                    onError={handleImageError}
                    loading="lazy"
                  />
                );
              }
            }}
          >
            {markdownContent || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const MarkdownPreview = React.memo(MarkdownPreviewComponent, (prevProps, nextProps) => {
  // Only re-render if document ID, markdown content, or files array length changes
  return (
    prevProps.document.id === nextProps.document.id &&
    prevProps.document.markdown === nextProps.document.markdown &&
    prevProps.files.length === nextProps.files.length &&
    prevProps.files.every((file, index) => file.id === nextProps.files[index]?.id)
  );
});
