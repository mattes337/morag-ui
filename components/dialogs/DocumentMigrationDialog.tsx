'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Copy, 
  Move, 
  FileText, 
  Database,
  Settings,
  X,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: string;
  state: string;
  chunks: number;
  quality: number;
}

interface Realm {
  id: string;
  name: string;
  description?: string;
}

interface DocumentMigrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDocuments: Document[];
  currentRealm: Realm;
  availableRealms: Realm[];
  onMigrationComplete?: (result: any) => void;
}

export function DocumentMigrationDialog({
  isOpen,
  onClose,
  selectedDocuments,
  currentRealm,
  availableRealms,
  onMigrationComplete
}: DocumentMigrationDialogProps) {
  const [targetRealmId, setTargetRealmId] = useState('');
  const [migrationMode, setMigrationMode] = useState<'copy' | 'move'>('copy');
  const [copyFiles, setCopyFiles] = useState(true);
  const [copyProcessingResults, setCopyProcessingResults] = useState(true);
  const [preserveOriginal, setPreserveOriginal] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const targetRealms = availableRealms.filter(realm => realm.id !== currentRealm.id);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when dialog closes
      setTargetRealmId('');
      setMigrationMode('copy');
      setCopyFiles(true);
      setCopyProcessingResults(true);
      setPreserveOriginal(true);
      setMigrationResult(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!targetRealmId) {
      alert('Please select a target realm');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch('/api/documents/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: selectedDocuments.map(doc => doc.id),
          sourceRealmId: currentRealm.id,
          targetRealmId,
          migrationOptions: {
            migrationMode,
            copyFiles,
            copyProcessingResults,
            preserveOriginal,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Migration failed');
      }

      const result = await response.json();
      setMigrationResult(result);
      
      if (onMigrationComplete) {
        onMigrationComplete(result);
      }
    } catch (error) {
      console.error('Migration failed:', error);
      alert(error instanceof Error ? error.message : 'Migration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const targetRealm = targetRealms.find(realm => realm.id === targetRealmId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Migrate Documents</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {migrationResult ? (
          // Migration Result View
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Migration Started</h3>
              <p className="text-gray-600">
                Your documents are being migrated. You can track the progress in the migration history.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Migration Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Migration ID</label>
                    <p className="text-sm font-mono">{migrationResult.migration?.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge variant="default">
                      {migrationResult.migration?.status || 'PENDING'}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Documents</label>
                    <p className="text-sm">{selectedDocuments.length} documents</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mode</label>
                    <p className="text-sm capitalize">{migrationMode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          // Migration Setup View
          <div className="space-y-6">
            {/* Source and Target Realms */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Database className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">{currentRealm.name}</h4>
                    <p className="text-sm text-gray-600">Source Realm</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-center">
                <ArrowRight className="w-8 h-8 text-gray-400" />
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <Database className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <select
                      value={targetRealmId}
                      onChange={(e) => setTargetRealmId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Target Realm</option>
                      {targetRealms.map((realm) => (
                        <option key={realm.id} value={realm.id}>
                          {realm.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-600 mt-1">Target Realm</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Selected Documents ({selectedDocuments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-600">
                          {doc.type} • {doc.chunks} chunks • {(doc.quality * 100).toFixed(1)}% quality
                        </p>
                      </div>
                      <Badge variant={doc.state === 'INGESTED' ? 'default' : 'secondary'}>
                        {doc.state}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Migration Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Migration Options</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Migration Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Migration Mode
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="copy"
                        checked={migrationMode === 'copy'}
                        onChange={(e) => setMigrationMode(e.target.value as 'copy')}
                        className="text-blue-600"
                      />
                      <Copy className="w-4 h-4" />
                      <span>Copy (keep original)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        value="move"
                        checked={migrationMode === 'move'}
                        onChange={(e) => setMigrationMode(e.target.value as 'move')}
                        className="text-blue-600"
                      />
                      <Move className="w-4 h-4" />
                      <span>Move (remove from source)</span>
                    </label>
                  </div>
                </div>

                {/* Copy Options */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={copyFiles}
                      onChange={(e) => setCopyFiles(e.target.checked)}
                      className="text-blue-600"
                    />
                    <span>Copy original files and stage outputs</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={copyProcessingResults}
                      onChange={(e) => setCopyProcessingResults(e.target.checked)}
                      className="text-blue-600"
                    />
                    <span>Copy processing results (chunks, entities, facts)</span>
                  </label>
                  {migrationMode === 'move' && (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preserveOriginal}
                        onChange={(e) => setPreserveOriginal(e.target.checked)}
                        className="text-blue-600"
                      />
                      <span>Preserve original until migration is confirmed</span>
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Target Realm Info */}
            {targetRealm && (
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Target Realm: {targetRealm.name}</h4>
                  <p className="text-sm text-gray-600">
                    {targetRealm.description || 'No description available'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!targetRealmId || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-1 animate-spin" />
                    Starting Migration...
                  </>
                ) : (
                  <>
                    {migrationMode === 'copy' ? (
                      <Copy className="w-4 h-4 mr-1" />
                    ) : (
                      <Move className="w-4 h-4 mr-1" />
                    )}
                    Start Migration
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
