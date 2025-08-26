'use client';

import React from 'react';
import { StageCard } from './stage-card';
import { ChevronRight } from 'lucide-react';
import {
  ProcessingStage,
  StageInfo,
  WORKFLOW_ORDER,
  STAGE_CONFIG
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
      
      {/* Horizontal Workflow */}
      <div className="flex items-stretch overflow-x-auto pb-4 space-x-4 pl-4">
        {WORKFLOW_ORDER.map((stage, index) => {
          const stageInfo = stageMap.get(stage);
          const isExecuting = executingStage === stage;
          const status = stageInfo?.status || 'PENDING';
          const isCurrentStage = status === 'RUNNING' || (status === 'PENDING' && index === 0) ||
                                (status === 'PENDING' && WORKFLOW_ORDER.slice(0, index).every(s => {
                                  const prevStage = stageMap.get(s);
                                  return prevStage?.status === 'COMPLETED' || prevStage?.status === 'SKIPPED';
                                }));

          return (
            <div key={stage} className="flex items-center">
              {/* Stage Column */}
              <div className={`
                flex flex-col items-center transition-all duration-300
                ${isCurrentStage ? 'min-w-[240px] scale-110 z-10' : 'min-w-[80px] scale-95 opacity-80'}
              `}>
                {isCurrentStage ? (
                  // Current stage - full card
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
                ) : (
                  // Past/Future stages - compact vertical display
                  <div className={`
                    w-20 h-52 border-2 rounded-xl flex flex-col items-center justify-between p-3 transition-all duration-300 hover:scale-105 cursor-pointer shadow-sm
                    ${status === 'COMPLETED' ? 'bg-gradient-to-b from-green-50 to-green-100 border-green-300 hover:shadow-green-200' :
                      status === 'FAILED' ? 'bg-gradient-to-b from-red-50 to-red-100 border-red-300 hover:shadow-red-200' :
                      status === 'SKIPPED' ? 'bg-gradient-to-b from-gray-50 to-gray-100 border-gray-300 hover:shadow-gray-200' :
                      'bg-gradient-to-b from-blue-50 to-blue-100 border-blue-200 hover:shadow-blue-200'}
                  `}>
                    {/* Stage Icon */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm
                      ${status === 'COMPLETED' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                        status === 'FAILED' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                        status === 'SKIPPED' ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        'bg-gradient-to-br from-blue-400 to-blue-500'}
                    `}>
                      {React.createElement(STAGE_CONFIG[stage].icon, { className: 'w-5 h-5' })}
                    </div>

                    {/* Vertical Text Container */}
                    <div className="flex-1 flex items-center justify-center">
                      <div className="transform -rotate-90 text-xs font-semibold text-gray-700 text-center leading-tight whitespace-nowrap tracking-wide">
                        {STAGE_CONFIG[stage].name.toUpperCase()}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className={`
                      w-3 h-3 rounded-full shadow-sm
                      ${status === 'COMPLETED' ? 'bg-green-500' :
                        status === 'FAILED' ? 'bg-red-500' :
                        status === 'SKIPPED' ? 'bg-gray-400' :
                        'bg-blue-400'}
                    `} />
                  </div>
                )}
              </div>

              {/* Workflow Arrow */}
              {index < WORKFLOW_ORDER.length - 1 && (
                <div className="flex items-center justify-center mx-2">
                  <ChevronRight className={`
                    w-6 h-6 transition-colors
                    ${status === 'COMPLETED' ? 'text-green-500' : 'text-gray-400'}
                  `} />
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
