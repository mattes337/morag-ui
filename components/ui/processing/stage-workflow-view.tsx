'use client';

import React from 'react';
import { StageCard } from './stage-card';
import { ChevronRight } from 'lucide-react';
import { 
  ProcessingStage, 
  StageInfo, 
  WORKFLOW_ORDER
} from './stage-config';

interface StageWorkflowViewProps {
  stages: StageInfo[];
  executingStage: ProcessingStage | null;
  onExecuteStage?: (stage: ProcessingStage) => Promise<void>;
  onExecuteChain?: (fromStage: ProcessingStage) => Promise<void>;
  onResetToStage?: (stage: ProcessingStage) => Promise<void>;
  isLoading?: boolean;
}

export function StageWorkflowView({
  stages,
  executingStage,
  onExecuteStage,
  onExecuteChain,
  onResetToStage,
  isLoading = false
}: StageWorkflowViewProps) {
  // Create a map of stages for quick lookup
  const stageMap = new Map(stages.map(stage => [stage.stage, stage]));

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Processing stages are executed in order. Optional stages can be skipped.
      </div>
      
      {/* Workflow Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {WORKFLOW_ORDER.map((stage, index) => {
          const stageInfo = stageMap.get(stage);
          const isExecuting = executingStage === stage;

          return (
            <div key={stage} className="relative">
              <StageCard
                stage={stage}
                stageInfo={stageInfo}
                stageMap={stageMap}
                isExecuting={isExecuting}
                onExecuteStage={onExecuteStage}
                onExecuteChain={onExecuteChain}
                onResetToStage={onResetToStage}
                isLoading={isLoading}
              />
              
              {/* Workflow Arrow */}
              {index < WORKFLOW_ORDER.length - 1 && (
                <div className="hidden xl:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Workflow Indicators */}
      <div className="xl:hidden flex items-center justify-center space-x-2 mt-6">
        {WORKFLOW_ORDER.map((stage, index) => {
          const stageInfo = stageMap.get(stage);
          const status = stageInfo?.status || 'PENDING';
          
          return (
            <React.Fragment key={stage}>
              <div className={`
                w-3 h-3 rounded-full
                ${status === 'COMPLETED' ? 'bg-green-500' : 
                  status === 'RUNNING' ? 'bg-blue-500' : 
                  status === 'FAILED' ? 'bg-red-500' : 
                  status === 'SKIPPED' ? 'bg-gray-400' : 'bg-gray-300'}
              `} />
              {index < WORKFLOW_ORDER.length - 1 && (
                <div className="w-4 h-0.5 bg-gray-300" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
