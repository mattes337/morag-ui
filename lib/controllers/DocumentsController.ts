import { useCallback } from 'react';
import { useApp } from '../../contexts/AppContext';
import { Document } from '../../types';
import { BaseControllerState, ControllerHook } from './types';
import { useBaseController } from './base';

interface DocumentsState extends BaseControllerState {
  documents: Document[];
  currentRealm: any;
}

interface DocumentsActions {
  handleBackToRealms: () => void;
  handlePromptDocument: (document: Document) => void;
  handleViewDocumentDetail: (document: Document) => void;
  handleAddDocument: () => void;
}

export function useDocumentsController(): ControllerHook<DocumentsState, DocumentsActions> {
  const { 
    documents, 
    currentRealm, 
    setSelectedDocument, 
    setShowAddDocumentDialog 
  } = useApp();

  const initialState: DocumentsState = {
    isLoading: false,
    error: null,
    isInitialized: true,
    documents,
    currentRealm
  };

  const {
    state,
    setState,
    logger,
    navigationActions
  } = useBaseController('DocumentsController', initialState);

  // Update state when app context changes
  const updateFromContext = useCallback(() => {
    setState(prev => ({
      ...prev,
      documents,
      currentRealm
    }), 'updateFromContext');
  }, [documents, currentRealm, setState]);

  // Keep state in sync with context
  if (state.documents !== documents || state.currentRealm !== currentRealm) {
    updateFromContext();
  }

  const handleBackToRealms = useCallback(() => {
    logger.trace('Navigating back to realms');
    navigationActions.navigateTo('/');
  }, [logger, navigationActions]);

  const handlePromptDocument = useCallback((document: Document) => {
    logger.trace('Prompting document', { documentId: document.id, documentName: document.name });
    setSelectedDocument(document);
    navigationActions.navigateTo('/prompt');
  }, [logger, setSelectedDocument, navigationActions]);

  const handleViewDocumentDetail = useCallback((document: Document) => {
    logger.trace('Viewing document detail', { documentId: document.id, documentName: document.name });
    setSelectedDocument(document);
    navigationActions.navigateTo(`/documents/${document.id}`);
  }, [logger, setSelectedDocument, navigationActions]);

  const handleAddDocument = useCallback(() => {
    logger.trace('Opening add document dialog');
    setShowAddDocumentDialog(true);
  }, [logger, setShowAddDocumentDialog]);

  const actions: DocumentsActions = {
    handleBackToRealms,
    handlePromptDocument,
    handleViewDocumentDetail,
    handleAddDocument
  };

  return {
    state,
    actions,
    logger
  };
}
