# Claude Code Feature Analysis and Index Generation Prompt

## Command
```bash
claude-code "Analyze all files in docs/ and source directories to create a comprehensive feature index with implementation progress tracking"
```

## Detailed Instructions for Claude

### Phase 1: Initial Analysis
Please analyze all documentation and source files in this project with the following approach:

1. **Scan all docs/ files** - Read through every document in the docs/ directory and subdirectories
2. **Identify feature documentation** - Extract all mentioned features, capabilities, and functionalities
3. **Scan source code** - Review implementation files to identify actual implemented features
4. **Extract TODOs and FIXMEs** - Collect all TODO comments and FIXME annotations from the codebase

### Phase 2: Feature Categorization
Organize the discovered features into these categories:
- **Core Features**: Essential functionality that defines the project
- **Secondary Features**: Supporting capabilities that enhance the core
- **Utility Features**: Helper functions and tools
- **Integration Features**: External service connections and APIs
- **UI/UX Features**: User interface and experience elements

### Phase 3: Create Feature Index
Generate a structured index file (`FEATURE_INDEX.md`) with this format:

```markdown
# Project Feature Index
Generated: [timestamp]

## Feature Overview

### Core Features
- [Feature Name]: Brief description
  - Location: `path/to/implementation`
  - Documentation: `docs/feature.md`
  - Status: ✅ Implemented | 🚧 Partial | ❌ Not Started

### [Other Categories...]

## Implementation Progress

### Completed Features ✅
| Feature | Files | Documentation | Tests |
|---------|-------|---------------|-------|
| [name]  | [files] | [docs] | [test status] |

### In Progress 🚧
| Feature | Files | Completion % | Blockers/TODOs |
|---------|-------|--------------|----------------|
| [name]  | [files] | [%] | [list of todos] |

### Planned Features ❌
| Feature | Documentation | Priority | Dependencies |
|---------|---------------|----------|--------------|
| [name]  | [docs] | High/Med/Low | [deps] |

## TODO Inheritance Tree
### From Documentation
- [ ] TODO: [description] (from: docs/file.md:line)

### From Source Code
- [ ] TODO: [description] (from: src/file.js:line)
- [ ] FIXME: [description] (from: src/file.py:line)

## Feature Dependencies Graph
```
Feature A
├── Feature B (implemented)
├── Feature C (partial)
│   ├── Feature D (planned)
│   └── Feature E (implemented)
└── Feature F (planned)
```

## Quick Statistics
- Total Features Documented: [n]
- Features Implemented: [n] ([%])
- Features In Progress: [n] ([%])
- Features Planned: [n] ([%])
- Total TODOs: [n]
- Critical FIXMEs: [n]
```

### Phase 4: Create Progress Tracking
Additionally, create a `PROGRESS.md` file:

```markdown
# Implementation Progress Tracker

## Current Sprint Focus
- [ ] Feature currently being worked on
- [ ] Next priority item

## Completed This Week
- [x] Feature completed with reference

## Blockers
1. [Blocker description and affected features]

## Technical Debt
- Items that need refactoring
- Performance optimizations needed
- Documentation gaps
```

### Phase 5: Analysis Output Requirements

1. **Be exhaustive** - Don't skip files, even if they seem unimportant
2. **Cross-reference** - Link features between docs and implementation
3. **Identify gaps** - Highlight features documented but not implemented
4. **Find orphans** - Identify implemented features lacking documentation
5. **Priority inference** - Based on TODO comments and code structure, infer priority
6. **Version awareness** - Note if features are version-specific

### Special Instructions

- If you encounter configuration files (`.json`, `.yaml`, `.toml`), analyze them for feature flags
- Check test files to determine feature test coverage
- Look for deprecated features and mark them accordingly
- Identify external dependencies that enable features
- Note any feature flags or conditional compilations

### Output Format

Please create both files (`FEATURE_INDEX.md` and `PROGRESS.md`) and provide a summary of:
1. Total number of files analyzed
2. Key insights discovered
3. Recommended next steps for development
4. Any critical issues or inconsistencies found

Start by listing all files you'll analyze, then proceed with the systematic analysis.