import { useCallback, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Document } from '../../types';
import { BaseControllerState, ControllerHook } from './types';
import { useBaseController } from './base';

interface DocumentDetailState extends BaseControllerState {
  document: Document | null;
  documentId: string;
}

interface DocumentDetailActions {
  loadDocument: () => Promise<void>;
  refreshDocument: () => Promise<void>;
  handleBack: () => void;
  handleReingest: () => Promise<void>;
  handleSupersede: () => void;
  handleDelete: () => Promise<void>;
  handleDocumentUpdate: () => Promise<void>;
}

export function useDocumentDetailController(
  documentId: string
): ControllerHook<DocumentDetailState, DocumentDetailActions> {
  const {
    selectedDocument,
    setSelectedDocument,
    setShowSupersedeDocumentDialog,
    setDocumentToSupersede,
    updateDocument,
    deleteDocument,
  } = useApp();

  const initialState: DocumentDetailState = {
    isLoading: true,
    error: null,
    isInitialized: false,
    document: null,
    documentId
  };

  const {
    state,
    setState,
    safeSetState,
    logger,
    navigationActions,
    commonActions,
    isCleanedUp
  } = useBaseController('DocumentDetailController', initialState);

  // Log state changes for document
  useEffect(() => {
    logger.info('Document state effect triggered', {
      hasDocument: !!state.document,
      documentId: state.document?.id,
      documentName: state.document?.name
    });

    if (state.document) {
      logger.info('Document state updated', {
        id: state.document.id,
        name: state.document.name,
        state: state.document.state,
        currentStage: state.document.currentStage,
        stageStatus: state.document.stageStatus,
        processingMode: state.document.processingMode,
        isProcessingPaused: state.document.isProcessingPaused
      });
    } else {
      logger.warn('Document state is null/undefined');
    }
  }, [state.document, logger]);

  // Load document from API
  const loadDocumentFromAPI = useCallback(async (): Promise<Document | null> => {
    logger.info('Loading document from API', { documentId });
    
    const response = await fetch(`/api/documents/${documentId}/complete`);
    
    if (!response.ok) {
      if (response.status === 404) {
        logger.warn('Document not found (404)', { documentId });
        throw new Error('Document not found');
      }
      logger.error('API fetch failed', { 
        status: response.status, 
        statusText: response.statusText,
        documentId 
      });
      throw new Error(`Failed to load document: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    const docData = responseData.document;

    if (!docData || !docData.id) {
      logger.error('Invalid document data received', { responseData });
      throw new Error('Invalid document data received from server');
    }

    // Store complete response data for DocumentDetailView
    (window as any).__documentCompleteData = {
      documentId,
      files: responseData.files || [],
      pipelineStatus: responseData.pipelineStatus,
      executionStats: responseData.executionStats,
      isProcessing: responseData.isProcessing || false
    };

    const formattedDoc: Document = {
      id: docData.id,
      name: docData.name,
      type: docData.type,
      subType: docData.subType,
      state: (docData.state || 'pending').toLowerCase() as Document['state'],
      version: docData.version || 1,
      chunks: docData.chunks || 0,
      quality: docData.quality || 0,
      uploadDate: docData.uploadDate
        ? new Date(docData.uploadDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      processingMode: docData.processingMode || 'AUTOMATIC',
      markdown: docData.markdown,
      metadata: docData.metadata,
      currentStage: docData.currentStage,
      stageStatus: docData.stageStatus,
      lastStageError: docData.lastStageError,
      isProcessingPaused: docData.isProcessingPaused,
      nextScheduledStage: docData.nextScheduledStage,
      scheduledAt: docData.scheduledAt,
    };

    logger.info('Document loaded successfully from API', {
      name: formattedDoc.name,
      id: formattedDoc.id,
      state: formattedDoc.state,
      currentStage: formattedDoc.currentStage,
      stageStatus: formattedDoc.stageStatus,
      processingMode: formattedDoc.processingMode,
      isProcessingPaused: formattedDoc.isProcessingPaused
    });

    return formattedDoc;
  }, [documentId, logger]);

  // Create async actions with proper error handling
  const loadDocument = useCallback(async () => {
    try {
      logger.trace('Async action start: loadDocument');
      commonActions.setLoading(true);
      commonActions.setError(null);

      const document = await loadDocumentFromAPI();
      if (document) {
        logger.info('Setting document in state', { documentId: document.id, documentName: document.name });
        logger.info('About to call setState', { isCleanedUp: isCleanedUp });
        setState(prev => {
          logger.info('State update - before', { hasDocument: !!prev.document, documentId: prev.document?.id, prevState: prev });
          const newState = { ...prev, document };
          logger.info('State update - after', { hasDocument: !!newState.document, documentId: newState.document?.id, newState });
          return newState;
        }, 'loadDocument');
        logger.info('setState called successfully');
        logger.trace('Async action success: loadDocument');
      } else {
        logger.warn('No document returned from API');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Async action failed: loadDocument', { error: errorMessage });
      commonActions.setError(errorMessage);
    } finally {
      commonActions.setLoading(false);
    }
  }, [logger, commonActions, loadDocumentFromAPI, safeSetState]);

  const refreshDocument = useCallback(async () => {
    try {
      logger.trace('Async action start: refreshDocument');
      commonActions.setLoading(true);
      commonActions.setError(null);

      const document = await loadDocumentFromAPI();
      if (document) {
        safeSetState(prev => ({ ...prev, document }), 'refreshDocument');
        logger.trace('Async action success: refreshDocument');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Async action failed: refreshDocument', { error: errorMessage });
      commonActions.setError(errorMessage);
    } finally {
      commonActions.setLoading(false);
    }
  }, [logger, commonActions, loadDocumentFromAPI, safeSetState]);

  const handleReingest = useCallback(async () => {
    if (!state.document) return;

    try {
      logger.trace('Async action start: handleReingest');
      commonActions.setLoading(true);
      commonActions.setError(null);

      logger.info('Reingesting document', { documentName: state.document.name });
      await updateDocument(state.document.id, { state: 'ingesting' });
      await refreshDocument();

      logger.trace('Async action success: handleReingest');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Async action failed: handleReingest', { error: errorMessage });
      commonActions.setError(errorMessage);
    } finally {
      commonActions.setLoading(false);
    }
  }, [state.document, logger, commonActions, updateDocument, refreshDocument]);

  const handleDelete = useCallback(async () => {
    if (!state.document) return;

    try {
      logger.trace('Async action start: handleDelete');
      commonActions.setLoading(true);
      commonActions.setError(null);

      logger.info('Deleting document', { documentName: state.document.name });
      await deleteDocument(state.document.id);
      navigationActions.navigateTo('/documents');

      logger.trace('Async action success: handleDelete');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Async action failed: handleDelete', { error: errorMessage });
      commonActions.setError(errorMessage);
    } finally {
      commonActions.setLoading(false);
    }
  }, [state.document, logger, commonActions, deleteDocument, navigationActions]);

  // Non-async actions
  const handleBack = useCallback(() => {
    logger.trace('Handling back navigation');
    setSelectedDocument(null);
    navigationActions.navigateTo('/documents');
  }, [logger, setSelectedDocument, navigationActions]);

  const handleSupersede = useCallback(() => {
    if (!state.document) return;
    
    logger.trace('Opening supersede dialog', { documentName: state.document.name });
    setDocumentToSupersede(state.document);
    setShowSupersedeDocumentDialog(true);
  }, [state.document, logger, setDocumentToSupersede, setShowSupersedeDocumentDialog]);

  const handleDocumentUpdate = useCallback(async () => {
    logger.info('Refreshing document due to stage completion');
    // Use a more gentle refresh that doesn't cause page reload
    await refreshDocument();
  }, [logger, refreshDocument]);

  // Initialize controller
  useEffect(() => {
    if (!state.isInitialized) {
      logger.info('Initializing DocumentDetailController', { documentId });
      safeSetState(prev => ({ ...prev, isInitialized: true }), 'initialize');
      loadDocument();
    }
  }, [state.isInitialized, documentId, logger, safeSetState, loadDocument]);

  // Sync with app context
  useEffect(() => {
    if (state.document && (!selectedDocument || selectedDocument.id !== state.document.id)) {
      logger.trace('Syncing document with app context');
      setSelectedDocument(state.document);
    }
  }, [state.document, selectedDocument, setSelectedDocument, logger]);

  const actions: DocumentDetailActions = {
    loadDocument,
    refreshDocument,
    handleBack,
    handleReingest,
    handleSupersede,
    handleDelete,
    handleDocumentUpdate
  };

  return {
    state,
    actions,
    logger
  };
}
