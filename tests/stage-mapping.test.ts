/**
 * Unit tests for stage mapping logic
 */

import { describe, it, expect } from '@jest/globals';

// Helper function to test stage status mapping (copied from DocumentDetailView logic)
function mapPipelineStatusToStageInfos(pipelineStatus: any) {
  const stages = ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'];
  
  return stages.map(stage => {
    const isCompleted = pipelineStatus?.completedStages?.includes(stage);
    const isFailed = pipelineStatus?.failedStages?.includes(stage);
    const isCurrent = pipelineStatus?.currentStage === stage;
    
    let status = 'PENDING';
    if (isCompleted) status = 'COMPLETED';
    else if (isFailed) status = 'FAILED';
    else if (isCurrent && pipelineStatus?.stageStatus === 'RUNNING') status = 'RUNNING';
    
    return {
      stage,
      status,
      progress: isCurrent ? pipelineStatus?.progress : (isCompleted ? 100 : 0)
    };
  });
}

describe('Stage Mapping Logic', () => {
  it('should map fresh document correctly', () => {
    const pipelineStatus = {
      currentStage: 'MARKDOWN_CONVERSION',
      stageStatus: 'PENDING',
      completedStages: [],
      failedStages: [],
      progress: 0
    };

    const stageInfos = mapPipelineStatusToStageInfos(pipelineStatus);
    
    expect(stageInfos).toHaveLength(5);
    expect(stageInfos[0]).toEqual({
      stage: 'MARKDOWN_CONVERSION',
      status: 'PENDING',
      progress: 0
    });
    expect(stageInfos[1]).toEqual({
      stage: 'MARKDOWN_OPTIMIZER',
      status: 'PENDING',
      progress: 0
    });
  });

  it('should map running document correctly', () => {
    const pipelineStatus = {
      currentStage: 'MARKDOWN_CONVERSION',
      stageStatus: 'RUNNING',
      completedStages: [],
      failedStages: [],
      progress: 25
    };

    const stageInfos = mapPipelineStatusToStageInfos(pipelineStatus);
    
    expect(stageInfos[0]).toEqual({
      stage: 'MARKDOWN_CONVERSION',
      status: 'RUNNING',
      progress: 25
    });
    expect(stageInfos[1]).toEqual({
      stage: 'MARKDOWN_OPTIMIZER',
      status: 'PENDING',
      progress: 0
    });
  });

  it('should map partially completed document correctly', () => {
    const pipelineStatus = {
      currentStage: 'CHUNKER',
      stageStatus: 'RUNNING',
      completedStages: ['MARKDOWN_CONVERSION'],
      failedStages: [],
      progress: 40
    };

    const stageInfos = mapPipelineStatusToStageInfos(pipelineStatus);
    
    expect(stageInfos[0]).toEqual({
      stage: 'MARKDOWN_CONVERSION',
      status: 'COMPLETED',
      progress: 100
    });
    expect(stageInfos[2]).toEqual({
      stage: 'CHUNKER',
      status: 'RUNNING',
      progress: 40
    });
    expect(stageInfos[3]).toEqual({
      stage: 'FACT_GENERATOR',
      status: 'PENDING',
      progress: 0
    });
  });

  it('should map failed document correctly', () => {
    const pipelineStatus = {
      currentStage: 'FACT_GENERATOR',
      stageStatus: 'FAILED',
      completedStages: ['MARKDOWN_CONVERSION', 'CHUNKER'],
      failedStages: ['FACT_GENERATOR'],
      progress: 60
    };

    const stageInfos = mapPipelineStatusToStageInfos(pipelineStatus);
    
    expect(stageInfos[0]).toEqual({
      stage: 'MARKDOWN_CONVERSION',
      status: 'COMPLETED',
      progress: 100
    });
    expect(stageInfos[2]).toEqual({
      stage: 'CHUNKER',
      status: 'COMPLETED',
      progress: 100
    });
    expect(stageInfos[3]).toEqual({
      stage: 'FACT_GENERATOR',
      status: 'FAILED',
      progress: 60
    });
    expect(stageInfos[4]).toEqual({
      stage: 'INGESTOR',
      status: 'PENDING',
      progress: 0
    });
  });

  it('should map fully completed document correctly', () => {
    const pipelineStatus = {
      currentStage: 'INGESTOR',
      stageStatus: 'COMPLETED',
      completedStages: ['MARKDOWN_CONVERSION', 'MARKDOWN_OPTIMIZER', 'CHUNKER', 'FACT_GENERATOR', 'INGESTOR'],
      failedStages: [],
      progress: 100
    };

    const stageInfos = mapPipelineStatusToStageInfos(pipelineStatus);
    
    stageInfos.forEach(stageInfo => {
      expect(stageInfo.status).toBe('COMPLETED');
      expect(stageInfo.progress).toBe(100);
    });
  });

  it('should handle missing pipeline status gracefully', () => {
    const stageInfos = mapPipelineStatusToStageInfos(null);
    
    expect(stageInfos).toHaveLength(5);
    stageInfos.forEach(stageInfo => {
      expect(stageInfo.status).toBe('PENDING');
      expect(stageInfo.progress).toBe(0);
    });
  });

  it('should handle empty pipeline status gracefully', () => {
    const stageInfos = mapPipelineStatusToStageInfos({});
    
    expect(stageInfos).toHaveLength(5);
    stageInfos.forEach(stageInfo => {
      expect(stageInfo.status).toBe('PENDING');
      expect(stageInfo.progress).toBe(0);
    });
  });
});
