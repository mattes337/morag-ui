'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CheckCircle } from 'lucide-react';
import { QualityGatePreset, ProcessingTemplateService } from '@/lib/processing/templates';
import { FactGeneratorConfig } from '@/lib/services/moragService';

interface QualityGatePresetSelectorProps {
  selectedPreset?: QualityGatePreset;
  onPresetSelect: (preset: QualityGatePreset) => void;
  onApplyPreset?: (config: Partial<FactGeneratorConfig>) => void;
  currentConfig?: FactGeneratorConfig;
  className?: string;
}

export function QualityGatePresetSelector({
  selectedPreset,
  onPresetSelect,
  onApplyPreset,
  currentConfig,
  className = ''
}: QualityGatePresetSelectorProps) {
  const presets = ProcessingTemplateService.getQualityGatePresets();

  const handlePresetClick = (preset: QualityGatePreset) => {
    onPresetSelect(preset);
    if (onApplyPreset) {
      onApplyPreset(preset.config);
    }
  };

  const PresetCard = ({ preset }: { preset: QualityGatePreset }) => {
    const isSelected = selectedPreset?.id === preset.id;
    
    return (
      <Card 
        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
            : 'hover:border-gray-300'
        }`}
        onClick={() => handlePresetClick(preset)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{preset.icon}</span>
              <CardTitle className="text-sm font-medium">{preset.name}</CardTitle>
            </div>
            {isSelected && (
              <CheckCircle className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <CardDescription className="text-xs">
            {preset.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Min Confidence:</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {preset.config.min_confidence}
                </Badge>
              </div>
              <div>
                <span className="font-medium">Min Length:</span>
                <Badge variant="outline" className="ml-1 text-xs">
                  {preset.config.min_fact_length}
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1">
              {preset.config.strict_validation && (
                <Badge variant="secondary" className="text-xs">Strict</Badge>
              )}
              {preset.config.allow_vague_language && (
                <Badge variant="secondary" className="text-xs">Vague OK</Badge>
              )}
              {preset.config.require_entities && (
                <Badge variant="secondary" className="text-xs">Entities Required</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-base font-medium">Quality Gate Presets</Label>
        <p className="text-sm text-gray-600 mt-1">
          Choose a validation mode for fact extraction quality control
        </p>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {presets.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>
      
      {selectedPreset && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Selected Configuration:</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Min Confidence: <strong>{selectedPreset.config.min_confidence}</strong></div>
            <div>Min Fact Length: <strong>{selectedPreset.config.min_fact_length}</strong></div>
            <div>Strict Validation: <strong>{selectedPreset.config.strict_validation ? 'Yes' : 'No'}</strong></div>
            <div>Allow Vague Language: <strong>{selectedPreset.config.allow_vague_language ? 'Yes' : 'No'}</strong></div>
            <div>Require Entities: <strong>{selectedPreset.config.require_entities ? 'Yes' : 'No'}</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}
