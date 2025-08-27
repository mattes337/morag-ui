'use client';

import React from 'react';
import { UnifiedDocumentDialog } from './UnifiedDocumentDialog';
import { Document } from '../../types';

interface AddDocumentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'add' | 'supersede';
    documentToSupersede?: Document | null;
    initialMode?: 'easy' | 'expert';
    'data-oid'?: string;
    [key: string]: any;
}

export function AddDocumentDialog({
    isOpen,
    onClose,
    mode = 'add',
    documentToSupersede,
    initialMode = 'easy',
    ...props
}: AddDocumentDialogProps) {
    // For now, we'll use the unified dialog and ignore supersede mode
    // TODO: Implement supersede functionality in the unified dialog
    return (
        <UnifiedDocumentDialog
            isOpen={isOpen}
            onClose={onClose}
            initialMode={initialMode}
        />
    );
}
