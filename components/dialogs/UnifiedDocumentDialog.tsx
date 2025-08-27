'use client';

import React, { useState } from 'react';
import { EasyModeDocumentDialog } from './EasyModeDocumentDialog';
import { ExpertModeDocumentDialog } from './ExpertModeDocumentDialog';

interface UnifiedDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'easy' | 'expert';
}

export function UnifiedDocumentDialog({
  isOpen,
  onClose,
  initialMode = 'easy'
}: UnifiedDocumentDialogProps) {
  const [mode, setMode] = useState<'easy' | 'expert'>(initialMode);

  const handleSwitchToExpert = () => {
    setMode('expert');
  };

  const handleSwitchToEasy = () => {
    setMode('easy');
  };

  const handleClose = () => {
    setMode(initialMode); // Reset to initial mode when closing
    onClose();
  };

  if (mode === 'easy') {
    return (
      <EasyModeDocumentDialog
        isOpen={isOpen}
        onClose={handleClose}
        onSwitchToExpert={handleSwitchToExpert}
      />
    );
  }

  return (
    <ExpertModeDocumentDialog
      isOpen={isOpen}
      onClose={handleClose}
      onSwitchToEasy={handleSwitchToEasy}
    />
  );
}
