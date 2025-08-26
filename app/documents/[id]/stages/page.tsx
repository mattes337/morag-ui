'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProcessingStage } from '@prisma/client';
import { useApp } from '@/contexts/AppContext';
import { useStageExecution } from '@/hooks/useStageExecution';
import { StageVisualizationView } from '@/components/views/StageVisualizationView';
import { StageExecutionDialog } from '@/components/dialogs/StageExecutionDialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  RefreshCw, 
  AlertCircle,
  FileText,
  Calendar,
  User,
  Database
} from 'lucide-react';

interface DocumentStagesPageProps {
  params: {
    id: string;
  };
}

export default function DocumentStagesPage() {
  const params = useParams();
  const router = useRouter();
  const { user, documents } = useApp();
  const {
    isExecuting,
    executionError,
    currentExecution,
    executeStage,
    executeChain,
    resetToStage,
    fetchPipelineStatus,
    fetchExecutions,
  } = useStageExecution();

  const [document, setDocument] = useState<any>(null);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<ProcessingStage | null>(null);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const documentId = params?.id as string;

  // Load document data
  useEffect(() => {
    const loadDocument = async () => {
      if (!documentId) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Try to find document in context first
        const contextDocument = documents.find(
          (doc) => doc.id === documentId || doc.id.toString() === documentId
        );

        if (contextDocument) {
          setDocument(contextDocument);
        } else {
          // Fetch from API if not in context
          const response = await fetch(`/api/documents/${documentId}`);
          if (!response.ok) {
            throw new Error(`Failed to load document: ${response.status}`);
          }
          const responseData = await response.json();
          const docData = responseData.document; // Extract document from the response

          if (!docData || !docData.id) {
            throw new Error('Invalid document data received from server');
          }

          setDocument(docData);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load document';
        setError(errorMessage);
        console.error('Error loading document:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId, documents]);

  // Load pipeline status and executions
  useEffect(() => {
    const loadStageData = async () => {
      if (!documentId) return;
      
      try {
        const [statusData, executionsData] = await Promise.all([
          fetchPipelineStatus(documentId),
          fetchExecutions(documentId),
        ]);
        
        setPipelineStatus(statusData);
        setExecutions(executionsData);
      } catch (err) {
        console.error('Error loading stage data:', err);
        // Don't set error here as document might still be valid
      }
    };

    if (document) {
      loadStageData();
    }
  }, [document, documentId, fetchPipelineStatus, fetchExecutions]);

  const handleRefresh = async () => {
    if (!documentId) return;
    
    try {
      setRefreshing(true);
      const [statusData, executionsData] = await Promise.all([
        fetchPipelineStatus(documentId),
        fetchExecutions(documentId),
      ]);
      
      setPipelineStatus(statusData);
      setExecutions(executionsData);
    } catch (err) {
      console.error('Error refreshing stage data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExecuteStage = (stage: ProcessingStage) => {
    setSelectedStage(stage);
    setShowExecutionDialog(true);
  };

  const handleExecuteChain = async (stages: ProcessingStage[]) => {
    try {
      await executeChain(documentId, stages);
      await handleRefresh();
    } catch (err) {
      console.error('Error executing chain:', err);
    }
  };

  const handleResetToStage = async (stage: ProcessingStage) => {
    try {
      await resetToStage(documentId, stage);
      await handleRefresh();
    } catch (err) {
      console.error('Error resetting to stage:', err);
    }
  };

  const handleStageExecution = async (stage: ProcessingStage, options: any) => {
    try {
      await executeStage(documentId, stage, options);
      // Add a small delay to allow backend processing to complete
      setTimeout(async () => {
        await handleRefresh();
      }, 1000);
    } catch (err) {
      console.error('Error executing stage:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner className="mb-4" />
          <p className="text-gray-600">Loading document stages...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // No document found
  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Document Not Found</h2>
          <p className="text-gray-600 mb-4">The requested document could not be found.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">Processing Stages</h1>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Document Info */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">{document.name}</h2>
                <Badge variant="secondary">{document.state || 'PROCESSING'}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Created by {document.user?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(document.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4" />
                  <span>Realm: {document.realm?.name || 'Unknown'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {executionError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {executionError}
          </AlertDescription>
        </Alert>
      )}

      {/* Stage Visualization */}
      {pipelineStatus ? (
        <StageVisualizationView
          documentId={documentId}
          pipelineStatus={pipelineStatus}
          executions={executions}
          onExecuteStage={handleExecuteStage}
          onExecuteChain={handleExecuteChain}
          onResetToStage={handleResetToStage}
          isLoading={isExecuting || refreshing}
        />
      ) : (
        <div className="bg-white rounded-lg border p-8">
          <div className="text-center">
            <LoadingSpinner className="mb-4" />
            <p className="text-gray-600">Loading pipeline status...</p>
          </div>
        </div>
      )}

      {/* Stage Execution Dialog */}
      <StageExecutionDialog
        open={showExecutionDialog}
        onOpenChange={setShowExecutionDialog}
        stage={selectedStage}
        documentId={documentId}
        onExecute={handleStageExecution}
        isExecuting={isExecuting}
      />
    </div>
  );
}