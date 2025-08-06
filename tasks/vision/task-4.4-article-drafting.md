# Task 3.4: Article Drafting System

**Phase**: 3 - Blog Authoring System
**Status**: ❌ Not Started
**Priority**: Medium
**Estimated Effort**: 4-5 days

## Overview

Implement an automated article drafting system that takes approved blog ideas and generates initial article drafts using AI. The system should create well-structured, coherent articles based on the source content and idea specifications, providing a solid foundation for human editing and refinement.

## Current State Analysis

### Existing Implementation
- No article drafting capabilities
- No AI-powered content generation
- No structured article creation workflow
- No draft management system

### Gap Analysis
- ❌ No automated article generation
- ❌ No content structuring algorithms
- ❌ No source content integration
- ❌ No draft quality assessment
- ❌ No iterative draft improvement

## Requirements

### Functional Requirements
1. **Automated Drafting**: Generate article drafts from approved ideas
2. **Content Integration**: Incorporate relevant source content and references
3. **Structure Generation**: Create well-organized article structure with sections
4. **Quality Assessment**: Evaluate draft quality and completeness
5. **Iterative Improvement**: Allow refinement and regeneration of drafts
6. **Multiple Formats**: Support different article formats and styles
7. **Source Attribution**: Properly cite and reference source materials
8. **SEO Optimization**: Generate SEO-friendly content with proper keywords

### Technical Requirements
1. **AI Integration**: LLM integration for content generation
2. **Template System**: Configurable article templates
3. **Content Processing**: Efficient processing of source materials
4. **Quality Metrics**: Automated quality scoring
5. **Version Control**: Track draft versions and changes
6. **Performance**: Generate drafts within reasonable time limits

## Architecture Design

### Article Drafting Engine
```typescript
interface ArticleDraftingEngine {
  generateDraft(idea: BlogIdea, config: DraftingConfig): Promise<ArticleDraft>;
  improveDraft(draft: ArticleDraft, feedback: DraftFeedback): Promise<ArticleDraft>;
  assessDraftQuality(draft: ArticleDraft): Promise<QualityAssessment>;
  generateOutline(idea: BlogIdea): Promise<ArticleOutline>;
  expandSection(section: ArticleSection, context: string): Promise<string>;
}

interface DraftingConfig {
  targetWordCount: number;
  writingStyle: WritingStyle;
  targetAudience: string;
  includeIntroduction: boolean;
  includeConclusion: boolean;
  maxSections: number;
  citationStyle: CitationStyle;
  seoOptimization: boolean;
}

interface ArticleDraft {
  id: string;
  ideaId: string;
  title: string;
  content: string;
  outline: ArticleOutline;
  wordCount: number;
  readingTime: number;
  qualityScore: number;
  seoScore: number;
  citations: Citation[];
  version: number;
  status: DraftStatus;
}
```

## Implementation Plan

### Step 1: Content Analysis and Outline Generation
```typescript
export class ArticleOutlineGenerator {
  async generateOutline(idea: BlogIdea): Promise<ArticleOutline> {
    // Analyze source content to understand key topics
    const sourceAnalysis = await this.analyzeSourceContent(idea.sourceReferences);
    
    // Generate article structure based on idea and sources
    const prompt = this.buildOutlinePrompt(idea, sourceAnalysis);
    const outlineResponse = await this.llmService.generateOutline(prompt);
    
    return {
      title: idea.title,
      introduction: outlineResponse.introduction,
      sections: outlineResponse.sections,
      conclusion: outlineResponse.conclusion,
      estimatedWordCount: this.calculateWordCount(outlineResponse),
      keyPoints: outlineResponse.keyPoints,
    };
  }

  private async analyzeSourceContent(sourceRefs: SourceReference[]): Promise<SourceAnalysis> {
    const contentAnalysis: SourceAnalysis = {
      keyTopics: [],
      mainPoints: [],
      supportingEvidence: [],
      quotes: [],
      statistics: [],
    };

    for (const ref of sourceRefs) {
      const content = await this.extractSourceContent(ref);
      const analysis = await this.llmService.analyzeContent(content, {
        extractKeyTopics: true,
        identifyMainPoints: true,
        findSupportingEvidence: true,
        extractQuotes: true,
        findStatistics: true,
      });

      contentAnalysis.keyTopics.push(...analysis.keyTopics);
      contentAnalysis.mainPoints.push(...analysis.mainPoints);
      contentAnalysis.supportingEvidence.push(...analysis.supportingEvidence);
      contentAnalysis.quotes.push(...analysis.quotes);
      contentAnalysis.statistics.push(...analysis.statistics);
    }

    return this.deduplicateAndRank(contentAnalysis);
  }

  private buildOutlinePrompt(idea: BlogIdea, analysis: SourceAnalysis): string {
    return `
      Create a detailed article outline for the following blog idea:
      
      Title: ${idea.title}
      Description: ${idea.description}
      Target Audience: ${idea.targetAudience}
      Estimated Reading Time: ${idea.estimatedReadTime} minutes
      
      Key Topics from Source Material:
      ${analysis.keyTopics.map(topic => `- ${topic}`).join('\n')}
      
      Main Points to Cover:
      ${analysis.mainPoints.map(point => `- ${point}`).join('\n')}
      
      Supporting Evidence Available:
      ${analysis.supportingEvidence.map(evidence => `- ${evidence}`).join('\n')}
      
      Requirements:
      - Create a compelling introduction that hooks the reader
      - Organize content into 3-7 logical sections
      - Include a strong conclusion with key takeaways
      - Ensure smooth flow between sections
      - Incorporate the available evidence and supporting material
      - Target word count: ${this.calculateTargetWordCount(idea.estimatedReadTime)}
      
      Generate a structured outline with:
      1. Introduction (hook, context, preview)
      2. Main sections (title, key points, supporting evidence)
      3. Conclusion (summary, call to action)
    `;
  }
}
```

### Step 2: Draft Content Generation
```typescript
export class ArticleContentGenerator {
  async generateDraft(
    idea: BlogIdea, 
    outline: ArticleOutline, 
    config: DraftingConfig
  ): Promise<ArticleDraft> {
    const sections: ArticleSection[] = [];
    
    // Generate introduction
    const introduction = await this.generateIntroduction(idea, outline, config);
    sections.push(introduction);
    
    // Generate main content sections
    for (const outlineSection of outline.sections) {
      const section = await this.generateSection(outlineSection, idea, config);
      sections.push(section);
    }
    
    // Generate conclusion
    const conclusion = await this.generateConclusion(idea, outline, sections, config);
    sections.push(conclusion);
    
    // Combine sections into full article
    const fullContent = this.combineSections(sections);
    
    // Generate citations and references
    const citations = await this.generateCitations(idea.sourceReferences, sections);
    
    // Calculate metrics
    const wordCount = this.countWords(fullContent);
    const readingTime = this.calculateReadingTime(wordCount);
    
    return {
      id: generateId(),
      ideaId: idea.id,
      title: idea.title,
      content: fullContent,
      outline,
      wordCount,
      readingTime,
      qualityScore: 0, // Will be calculated separately
      seoScore: 0, // Will be calculated separately
      citations,
      version: 1,
      status: 'DRAFT',
    };
  }

  private async generateSection(
    outlineSection: OutlineSection,
    idea: BlogIdea,
    config: DraftingConfig
  ): Promise<ArticleSection> {
    const prompt = this.buildSectionPrompt(outlineSection, idea, config);
    
    const sectionContent = await this.llmService.generateContent(prompt, {
      maxTokens: this.calculateSectionTokens(outlineSection.estimatedWordCount),
      temperature: config.creativity || 0.7,
      style: config.writingStyle,
    });

    return {
      title: outlineSection.title,
      content: sectionContent,
      wordCount: this.countWords(sectionContent),
      keyPoints: outlineSection.keyPoints,
      sources: this.identifyUsedSources(sectionContent, idea.sourceReferences),
    };
  }

  private buildSectionPrompt(
    section: OutlineSection,
    idea: BlogIdea,
    config: DraftingConfig
  ): string {
    return `
      Write a detailed section for a blog article with the following specifications:
      
      Article Title: ${idea.title}
      Section Title: ${section.title}
      Target Audience: ${config.targetAudience}
      Writing Style: ${config.writingStyle}
      
      Section Objectives:
      ${section.keyPoints.map(point => `- ${point}`).join('\n')}
      
      Key Information to Include:
      ${section.supportingEvidence.map(evidence => `- ${evidence}`).join('\n')}
      
      Requirements:
      - Write ${section.estimatedWordCount} words approximately
      - Use clear, engaging language appropriate for ${config.targetAudience}
      - Include specific examples and evidence where relevant
      - Maintain a ${config.writingStyle} tone
      - Ensure smooth transitions and logical flow
      - Include relevant keywords naturally for SEO
      
      Generate compelling, informative content that thoroughly covers the section objectives.
    `;
  }

  private async generateIntroduction(
    idea: BlogIdea,
    outline: ArticleOutline,
    config: DraftingConfig
  ): Promise<ArticleSection> {
    const prompt = `
      Write an engaging introduction for a blog article:
      
      Title: ${idea.title}
      Description: ${idea.description}
      Target Audience: ${config.targetAudience}
      
      Article Preview:
      ${outline.sections.map(s => `- ${s.title}`).join('\n')}
      
      Requirements:
      - Hook the reader with an interesting opening
      - Provide context and background
      - Preview what the article will cover
      - Be approximately 150-200 words
      - Match the ${config.writingStyle} style
      
      Create an introduction that makes readers want to continue reading.
    `;

    const content = await this.llmService.generateContent(prompt);
    
    return {
      title: 'Introduction',
      content,
      wordCount: this.countWords(content),
      keyPoints: ['Hook reader', 'Provide context', 'Preview content'],
      sources: [],
    };
  }
}
```

### Step 3: Quality Assessment System
```typescript
export class DraftQualityAssessor {
  async assessDraft(draft: ArticleDraft): Promise<QualityAssessment> {
    const assessments = await Promise.all([
      this.assessContentQuality(draft),
      this.assessStructure(draft),
      this.assessReadability(draft),
      this.assessSEOOptimization(draft),
      this.assessSourceIntegration(draft),
    ]);

    const overallScore = this.calculateOverallScore(assessments);
    
    return {
      overallScore,
      contentQuality: assessments[0],
      structure: assessments[1],
      readability: assessments[2],
      seoOptimization: assessments[3],
      sourceIntegration: assessments[4],
      recommendations: this.generateRecommendations(assessments),
      strengths: this.identifyStrengths(assessments),
      weaknesses: this.identifyWeaknesses(assessments),
    };
  }

  private async assessContentQuality(draft: ArticleDraft): Promise<QualityMetric> {
    const prompt = `
      Assess the content quality of this article draft:
      
      Title: ${draft.title}
      Content: ${draft.content}
      
      Evaluate on a scale of 1-10:
      - Accuracy and factual correctness
      - Depth and comprehensiveness
      - Originality and uniqueness
      - Value to the target audience
      - Clarity and coherence
      
      Provide a score and brief explanation.
    `;

    const assessment = await this.llmService.assessContent(prompt);
    
    return {
      score: assessment.score,
      explanation: assessment.explanation,
      suggestions: assessment.suggestions,
    };
  }

  private async assessReadability(draft: ArticleDraft): Promise<QualityMetric> {
    // Calculate readability metrics
    const fleschScore = this.calculateFleschReadingEase(draft.content);
    const avgSentenceLength = this.calculateAverageSentenceLength(draft.content);
    const avgWordsPerParagraph = this.calculateAverageWordsPerParagraph(draft.content);
    
    // Assess paragraph structure
    const paragraphs = draft.content.split('\n\n');
    const paragraphLengths = paragraphs.map(p => this.countWords(p));
    
    let score = 10;
    const issues: string[] = [];
    
    if (fleschScore < 60) {
      score -= 2;
      issues.push('Text may be too complex for general audience');
    }
    
    if (avgSentenceLength > 20) {
      score -= 1;
      issues.push('Sentences are too long on average');
    }
    
    if (Math.max(...paragraphLengths) > 150) {
      score -= 1;
      issues.push('Some paragraphs are too long');
    }

    return {
      score: Math.max(1, score),
      explanation: `Flesch Reading Ease: ${fleschScore}, Avg Sentence Length: ${avgSentenceLength}`,
      suggestions: issues,
    };
  }

  private async assessSEOOptimization(draft: ArticleDraft): Promise<QualityMetric> {
    // Extract potential keywords from title and content
    const titleKeywords = this.extractKeywords(draft.title);
    const contentKeywords = this.extractKeywords(draft.content);
    
    // Check keyword density and distribution
    const keywordDensity = this.calculateKeywordDensity(draft.content, titleKeywords);
    const hasMetaDescription = draft.content.includes('meta description') || draft.outline.introduction;
    const hasHeaders = this.countHeaders(draft.content);
    
    let score = 10;
    const suggestions: string[] = [];
    
    if (keywordDensity < 0.5 || keywordDensity > 3) {
      score -= 2;
      suggestions.push('Optimize keyword density (aim for 1-2%)');
    }
    
    if (hasHeaders < 3) {
      score -= 1;
      suggestions.push('Add more headers for better structure');
    }
    
    if (draft.wordCount < 300) {
      score -= 2;
      suggestions.push('Article may be too short for good SEO');
    }

    return {
      score: Math.max(1, score),
      explanation: `Keyword density: ${keywordDensity.toFixed(1)}%, Headers: ${hasHeaders}`,
      suggestions,
    };
  }
}
```

### Step 4: Draft Improvement System
```typescript
export class DraftImprovementEngine {
  async improveDraft(
    draft: ArticleDraft,
    feedback: DraftFeedback
  ): Promise<ArticleDraft> {
    const improvements: DraftImprovement[] = [];
    
    // Apply specific improvements based on feedback
    if (feedback.improveIntroduction) {
      const newIntro = await this.improveIntroduction(draft, feedback);
      improvements.push({ type: 'introduction', content: newIntro });
    }
    
    if (feedback.expandSections?.length > 0) {
      for (const sectionTitle of feedback.expandSections) {
        const expandedSection = await this.expandSection(draft, sectionTitle, feedback);
        improvements.push({ type: 'section', title: sectionTitle, content: expandedSection });
      }
    }
    
    if (feedback.improveConclusion) {
      const newConclusion = await this.improveConclusion(draft, feedback);
      improvements.push({ type: 'conclusion', content: newConclusion });
    }
    
    if (feedback.enhanceSEO) {
      const seoImprovements = await this.enhanceSEO(draft, feedback);
      improvements.push(...seoImprovements);
    }
    
    // Apply improvements to create new draft version
    const improvedContent = await this.applyImprovements(draft.content, improvements);
    
    return {
      ...draft,
      content: improvedContent,
      version: draft.version + 1,
      wordCount: this.countWords(improvedContent),
      readingTime: this.calculateReadingTime(this.countWords(improvedContent)),
    };
  }

  private async improveIntroduction(
    draft: ArticleDraft,
    feedback: DraftFeedback
  ): Promise<string> {
    const prompt = `
      Improve the introduction of this article based on the feedback:
      
      Current Introduction: ${this.extractIntroduction(draft.content)}
      
      Feedback: ${feedback.introductionFeedback}
      
      Requirements:
      - Make it more engaging and compelling
      - Better hook for the target audience
      - Clearer preview of article content
      - Maintain the same approximate length
      
      Generate an improved introduction.
    `;

    return await this.llmService.generateContent(prompt);
  }

  private async expandSection(
    draft: ArticleDraft,
    sectionTitle: string,
    feedback: DraftFeedback
  ): Promise<string> {
    const currentSection = this.extractSection(draft.content, sectionTitle);
    
    const prompt = `
      Expand and improve this article section:
      
      Section Title: ${sectionTitle}
      Current Content: ${currentSection}
      
      Expansion Requirements:
      - Add more depth and detail
      - Include additional examples or evidence
      - Improve clarity and flow
      - Increase word count by 30-50%
      
      Generate the expanded section content.
    `;

    return await this.llmService.generateContent(prompt);
  }
}
```

## API Endpoints

### Article Drafting APIs
```typescript
// Generate draft from idea
POST /api/blog/articles/generate-draft
{
  ideaId: string;
  config: DraftingConfig;
}

// Improve existing draft
POST /api/blog/articles/[id]/improve
{
  feedback: DraftFeedback;
}

// Assess draft quality
GET /api/blog/articles/[id]/quality-assessment

// Generate article outline
POST /api/blog/articles/generate-outline
{
  ideaId: string;
}
```

## Frontend Components

### DraftGenerationInterface
```typescript
const DraftGenerationInterface: React.FC<{ idea: BlogIdea }> = ({ idea }) => {
  const [config, setConfig] = useState<DraftingConfig>({
    targetWordCount: 1000,
    writingStyle: 'professional',
    targetAudience: idea.targetAudience || 'general',
    includeIntroduction: true,
    includeConclusion: true,
    maxSections: 5,
    citationStyle: 'apa',
    seoOptimization: true,
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState<ArticleDraft | null>(null);

  const handleGenerateDraft = async () => {
    setIsGenerating(true);
    try {
      const generatedDraft = await generateDraft(idea.id, config);
      setDraft(generatedDraft);
    } catch (error) {
      console.error('Failed to generate draft:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <DraftingConfigEditor config={config} onConfigChange={setConfig} />
      
      <Button onClick={handleGenerateDraft} disabled={isGenerating}>
        {isGenerating ? 'Generating Draft...' : 'Generate Article Draft'}
      </Button>
      
      {draft && (
        <DraftPreview 
          draft={draft} 
          onImprove={handleImproveDraft}
          onApprove={handleApproveDraft}
        />
      )}
    </div>
  );
};
```

## Testing Strategy

### Unit Tests
- Content generation algorithms
- Quality assessment metrics
- Draft improvement logic
- Citation generation

### Integration Tests
- End-to-end draft generation
- LLM integration
- Quality assessment accuracy
- Draft versioning

### Performance Tests
- Large content generation
- Concurrent draft requests
- Memory usage optimization

## Acceptance Criteria

- [ ] System generates coherent, well-structured article drafts
- [ ] Content integrates source materials appropriately
- [ ] Quality assessment provides meaningful feedback
- [ ] Draft improvement suggestions are actionable
- [ ] SEO optimization is effective
- [ ] Citations and references are properly formatted
- [ ] Performance is acceptable for typical article lengths
- [ ] Generated content requires minimal human editing

## Dependencies

- Task 3.1 (Blog Data Models) - Required for data structure
- Task 3.2 (Idea Management System) - Required for approved ideas
- LLM service integration
- Content analysis capabilities
- SEO optimization tools

## Success Metrics

- Generated drafts require <30% editing for publication
- Quality scores correlate with human assessment
- Draft generation time <2 minutes for typical articles
- User satisfaction with generated content quality
- Reduction in time from idea to publishable draft
