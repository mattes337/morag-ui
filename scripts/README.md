# Document Processing Testing Scripts

This directory contains automated testing scripts for the document processing pipeline. These scripts enable comprehensive testing of document creation, job processing, and pipeline validation.

## Overview

The testing framework consists of four main scripts:

1. **`create-test-documents.js`** - Creates test documents of different types
2. **`run-background-jobs.js`** - Executes background jobs and processes pending jobs
3. **`cleanup-test-data.js`** - Cleans up test data and resets the database
4. **`test-processing-pipeline.js`** - Orchestrates the complete testing workflow

## Prerequisites

1. **Database Setup**:
   ```bash
   # Ensure database is running and accessible
   npm run db:push
   ```

2. **Dependencies**:
   ```bash
   npm install
   ```

**Note**: No API key setup required! The scripts automatically use direct database access for local testing.

## Quick Start

### Full Pipeline Test
```bash
# Run complete pipeline test (recommended)
npm run test:pipeline

# Run pipeline test for specific document type
npm run test:pipeline:youtube
npm run test:pipeline:website
npm run test:pipeline:document
```

### Individual Script Usage

#### 1. Create Test Documents
```bash
# Create all document types
npm run test:create-docs:all

# Create specific document type
npm run test:create-docs -- --type=youtube --url=https://youtube.com/watch?v=xyz
npm run test:create-docs -- --type=website --url=https://example.com
npm run test:create-docs -- --type=document --file=./test.pdf
```

#### 2. Run Background Jobs
```bash
# Process all pending jobs once
npm run test:run-jobs

# Watch and continuously process jobs
npm run test:run-jobs:watch

# Process jobs for specific document
npm run test:run-jobs -- --document=doc-id-here

# Process jobs for specific stage
npm run test:run-jobs -- --stage=CHUNKER
```

#### 3. Clean Up Test Data
```bash
# Clean up with confirmation prompt
npm run test:cleanup

# Force cleanup without confirmation
npm run test:cleanup:force

# Clean only documents (keep jobs)
npm run test:cleanup -- --documents-only

# Clean only jobs (keep documents)
npm run test:cleanup -- --jobs-only

# Full database reset
npm run test:cleanup -- --full-reset
```

## Document Types Supported

The testing framework supports these document types:

- **`document`** - PDF, Word, Excel files
- **`youtube`** - YouTube videos (requires URL)
- **`website`** - Web pages (requires URL)
- **`audio`** - Audio files (MP3, WAV, etc.)
- **`video`** - Video files (MP4, AVI, etc.)

## Processing Stages

The pipeline processes documents through these stages:

1. **`MARKDOWN_CONVERSION`** - Convert source to markdown
2. **`MARKDOWN_OPTIMIZER`** - Optimize and clean markdown
3. **`CHUNKER`** - Split into chunks
4. **`FACT_GENERATOR`** - Extract facts and entities
5. **`INGESTOR`** - Store in vector/graph databases

## Advanced Usage

### Pipeline Testing Options

```bash
# Test specific document type
node scripts/test-processing-pipeline.js --type=youtube

# Test specific stage only
node scripts/test-processing-pipeline.js --stage=chunker

# Continue on errors (don't fail fast)
node scripts/test-processing-pipeline.js --continue-on-error

# Skip cleanup before/after test
node scripts/test-processing-pipeline.js --no-cleanup-before --no-cleanup
```

### Job Processing Options

```bash
# Limit number of jobs to process
node scripts/run-background-jobs.js --max=5

# Fail fast on first error
node scripts/run-background-jobs.js --failFast

# Process jobs for multiple documents
node scripts/run-background-jobs.js --document=doc1,doc2,doc3
```

### Document Creation Options

```bash
# Create with custom name
node scripts/create-test-documents.js --type=document --name="My Test Doc" --file=./custom.pdf

# Create YouTube video with custom URL
node scripts/create-test-documents.js --type=youtube --url=https://youtube.com/watch?v=custom

# Create website document
node scripts/create-test-documents.js --type=website --url=https://custom-site.com
```

## Testing Workflow

### Automated Testing (Recommended)
```bash
# Full automated test - creates docs, processes all stages, validates output
npm run test:pipeline
```

### Manual Testing
```bash
# 1. Clean database
npm run test:cleanup:force

# 2. Create test documents
npm run test:create-docs:all

# 3. Process each stage manually
npm run test:run-jobs -- --stage=MARKDOWN_CONVERSION
npm run test:run-jobs -- --stage=MARKDOWN_OPTIMIZER
npm run test:run-jobs -- --stage=CHUNKER
npm run test:run-jobs -- --stage=FACT_GENERATOR
npm run test:run-jobs -- --stage=INGESTOR

# 4. Clean up
npm run test:cleanup:force
```

### Continuous Testing
```bash
# Start job watcher in background
npm run test:run-jobs:watch &

# Create documents in another terminal
npm run test:create-docs:all

# Jobs will be processed automatically
# Stop watcher with Ctrl+C
```

## Validation and Output

The pipeline test validates:

- **Document Creation**: Verifies documents are created successfully
- **Stage Processing**: Ensures each stage completes without errors
- **Output Validation**: Checks expected outputs for each stage:
  - `MARKDOWN_CONVERSION`: Document has markdown content
  - `MARKDOWN_OPTIMIZER`: Optimized markdown content exists
  - `CHUNKER`: Document chunks are created
  - `FACT_GENERATOR`: Facts and entities are extracted
  - `INGESTOR`: Data is properly stored

## Troubleshooting

### Common Issues

1. **API Key Not Found**:
   ```bash
   export TEST_API_KEY="your_api_key_here"
   ```

2. **Database Connection Issues**:
   ```bash
   npm run db:push
   npm run db:migrate
   ```

3. **Missing Test Files**:
   The scripts automatically create sample test files in `./test-files/`

4. **Permission Errors**:
   Ensure the scripts have execute permissions:
   ```bash
   chmod +x scripts/*.js
   ```

### Debug Mode

Add debug logging by setting:
```bash
export DEBUG=true
node scripts/test-processing-pipeline.js
```

## Integration with CI/CD

Add to your CI pipeline:

```yaml
# .github/workflows/test-pipeline.yml
- name: Test Document Processing Pipeline
  run: |
    export TEST_API_KEY="${{ secrets.TEST_API_KEY }}"
    npm run test:pipeline
```

## File Structure

```
scripts/
├── README.md                      # This file
├── create-test-documents.js       # Document creation
├── run-background-jobs.js         # Job processing
├── cleanup-test-data.js          # Database cleanup
├── test-processing-pipeline.js   # Full pipeline orchestration
└── test-files/                   # Auto-generated test files
    ├── sample.pdf
    ├── sample.mp3
    └── sample.mp4
```

## Contributing

When adding new document types or processing stages:

1. Update `TEST_DOCUMENTS` in `create-test-documents.js`
2. Add stage validation logic in `test-processing-pipeline.js`
3. Update this README with new options
4. Add corresponding npm scripts to `package.json`
