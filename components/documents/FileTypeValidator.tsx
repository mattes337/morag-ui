'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { 
  validateFiles, 
  FileValidationResult,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,
  formatFileSize
} from '@/lib/utils/fileValidation';

// Synchronous basic validation for immediate checks
function validateFileBasic(file: File): boolean {
  // Only check size and type synchronously - content validation is async
  if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) return false;
  if (file.size > MAX_FILE_SIZE || file.size === 0) return false;
  return true;
}

export interface FileTypeValidatorProps {
  files: File[];
  onValidationChange?: (isValid: boolean, results: FileValidationResult) => void;
  showDetails?: boolean;
  className?: string;
}

export function FileTypeValidator({ 
  files, 
  onValidationChange, 
  showDetails = true,
  className = '' 
}: FileTypeValidatorProps) {
  const [validationResult, setValidationResult] = React.useState<FileValidationResult>({ isValid: true, errors: [] });
  const [isValidating, setIsValidating] = React.useState(false);

  React.useEffect(() => {
    async function performValidation() {
      if (files.length === 0) {
        setValidationResult({ isValid: true, errors: [] });
        return;
      }
      
      setIsValidating(true);
      try {
        const result = await validateFiles(files);
        setValidationResult(result);
      } catch (error) {
        setValidationResult({
          isValid: false,
          errors: [{ code: 'VALIDATION_ERROR', message: 'Failed to validate files' }]
        });
      } finally {
        setIsValidating(false);
      }
    }
    
    performValidation();
  }, [files]);

  React.useEffect(() => {
    onValidationChange?.(validationResult.isValid, validationResult);
  }, [validationResult, onValidationChange]);

  if (files.length === 0) {
    return null;
  }

  const hasErrors = !validationResult.isValid;
  // Simplified warning check - don't use async validateFile in render
  const hasWarnings = !isValidating && !hasErrors && files.some(file => {
    return validateFileBasic(file) && file.size > MAX_FILE_SIZE * 0.8;
  });

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Summary Cards */}
      {hasErrors && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-red-800">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">
                {validationResult.errors.length === 1 
                  ? validationResult.errors[0]?.message || 'Unknown error'
                  : `${validationResult.errors.length} validation errors found`
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasErrors && hasWarnings && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">
                Some files are large and may take longer to process.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {!hasErrors && !hasWarnings && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                All files are valid and ready for upload.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Validation Results */}
      {showDetails && hasErrors && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Validation Details:</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {validationResult.errors.map((error: any, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File Summary */}
      {files.length > 0 && (
        <div className="text-xs text-gray-500 space-y-1">
          <div>
            Files selected: {files.length} of {MAX_FILES_COUNT} maximum
          </div>
          <div>
            Total size: {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))} 
            of {formatFileSize(MAX_FILE_SIZE)} maximum per file
          </div>
        </div>
      )}
    </div>
  );
}

export interface SupportedTypesInfoProps {
  className?: string;
}

export function SupportedTypesInfo({ className = '' }: SupportedTypesInfoProps) {
  const supportedTypes = Object.values(SUPPORTED_FILE_TYPES);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900">Supported File Types:</h4>
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        {supportedTypes.map((type) => (
          <div key={type.extension} className="flex items-center gap-2">
            <span className="font-mono uppercase bg-gray-100 px-1.5 py-0.5 rounded">
              {type.extension}
            </span>
            <span>{type.name}</span>
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2">
        Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
      </div>
    </div>
  );
}

export default FileTypeValidator;