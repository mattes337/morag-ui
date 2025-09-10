# Claude Code Parallel Task Selection and Implementation Planning

## Command
```bash
claude-code "Analyze FEATURE_INDEX.md and PROGRESS.md to identify parallelizable tasks, create parallel and integration phases, and generate SPRINT.md for autonomous implementation"
```

## Detailed Instructions for Claude

### Phase 1: Analysis and Task Discovery

Read and analyze the following files:
1. **FEATURE_INDEX.md** - Extract all features with status 🚧 (partial) or ❌ (not started)
2. **PROGRESS.md** - Identify current blockers and sprint focus
3. **Source files** - Quick scan for existing interfaces and dependencies

### Phase 2: Dependency Analysis

For each candidate feature/task:
1. **Identify dependencies**: What other features must exist first?
2. **Identify shared resources**: What files/modules will be modified?
3. **Assess isolation level**: Can this be implemented in isolation?
4. **Estimate complexity**: Simple (1-2 files), Medium (3-5 files), Complex (6+ files)

### Phase 3: Parallelization Strategy

Categorize tasks into:
- **Fully Independent**: No dependencies, different files, can run simultaneously
- **Resource Independent**: Same dependencies but different files/modules
- **Logically Independent**: Different business logic, minimal interface overlap
- **Integration Required**: Needs other features or modifies shared interfaces

### Phase 4: Generate SPRINT.md

Create the following structured file optimized for Claude Code autonomous execution:

```markdown
# ACTIVE IMPLEMENTATION PLAN
Generated: [timestamp]
Execution Mode: Parallel-First Strategy
Claude Code Compatible: v1.0

## 🚀 PARALLEL PHASE (All tasks can run simultaneously)
Duration Estimate: [time]
Parallelization Factor: [n] tasks

### Task Group A: Independent Features
#### Task A1: [Feature Name]
**Priority**: HIGH | MEDIUM | LOW
**Complexity**: SIMPLE | MEDIUM | COMPLEX
**Files to Create/Modify**:
```
- src/feature/new_file.py [CREATE]
- src/utils/helper.py [MODIFY: lines 45-67]
- tests/test_feature.py [CREATE]
```
**Implementation Instructions**:
```python
# Explicit implementation blueprint
1. Create class FeatureName with methods:
   - __init__(self, config: dict)
   - process(self, data: Any) -> Result
   - validate(self, input: Any) -> bool

2. Integration points:
   - Import from: src.core.base
   - Export as: src.feature.FeatureName
   - Register in: src.registry.features

3. Test requirements:
   - Unit test for process method
   - Edge case for empty input
   - Performance test for >1000 items
```
**Success Criteria**:
- [ ] All tests pass
- [ ] No existing tests broken
- [ ] Documentation updated
**No Dependencies on Other Active Tasks** ✓

#### Task A2: [Another Feature]
[Similar structure...]

### Task Group B: Utility Implementations
[Similar structure for utility tasks...]

### Task Group C: Documentation and Tests
[Similar structure for doc/test tasks...]

## 🔧 INTEGRATION PHASE (Sequential execution required)
Duration Estimate: [time]
Must Start After: All Parallel Phase tasks complete

### Integration Task 1: Connect Features
**Dependencies**: Task A1, Task A2
**Files to Modify**:
```
- src/core/orchestrator.py [MODIFY: Add feature routing]
- src/config/features.yaml [MODIFY: Add feature flags]
```
**Integration Steps**:
```python
1. In orchestrator.py:
   - Import both features
   - Add to feature_map dictionary
   - Create routing logic:
     ```python
     if config.features.a1_enabled:
         result = FeatureA1().process(data)
         data = FeatureA2().enhance(result)
     ```

2. Update configuration:
   - Add feature flags
   - Set default values
   - Document parameters
```

### Integration Task 2: API Endpoints
[Similar structure...]

### Integration Task 3: Final Validation
**Run After**: All integration tasks
**Validation Steps**:
```bash
1. Run full test suite: pytest tests/
2. Run integration tests: pytest tests/integration/
3. Check feature flags: python scripts/validate_features.py
4. Performance benchmark: python scripts/benchmark.py
```

## 📊 EXECUTION METRICS
**Parallel Efficiency Score**: [n]% (higher is better)
**Estimated Time Savings**: [n] hours via parallelization
**Risk Assessment**: LOW | MEDIUM | HIGH

## 🤖 CLAUDE CODE EXECUTION COMMANDS

### Parallel Execution (run each in separate terminal/instance):
```bash
# Terminal 1
claude-code "Implement Task A1 from SPRINT.md following the exact specifications"

# Terminal 2  
claude-code "Implement Task A2 from SPRINT.md following the exact specifications"

# Terminal 3
claude-code "Implement Task Group B from SPRINT.md"
```

### Integration Execution (run sequentially):
```bash
# After all parallel tasks complete
claude-code "Execute Integration Phase from SPRINT.md in sequence"
```

## 🎯 IMPLEMENTATION RULES FOR CLAUDE CODE

1. **File Operations**:
   - Always check if file exists before CREATE operation
   - Use git diff format for MODIFY operations
   - Create backup before modifying critical files

2. **Code Style**:
   - Follow existing project conventions
   - Add type hints to all new Python functions
   - Include docstrings for public methods

3. **Testing**:
   - Write test first (TDD) when CREATE new feature
   - Run existing tests after MODIFY operations
   - Add integration test after feature complete

4. **Error Handling**:
   - Wrap all I/O operations in try-except
   - Log errors with context
   - Graceful degradation for missing features

5. **Progress Tracking**:
   - Update PROGRESS.md after each task
   - Mark completed items in this file
   - Create git commits with format: "feat(parallel): [Task ID] description"

## 📈 PROGRESS TRACKER
[This section updates automatically]

### Parallel Phase Status
- [ ] Task A1: Not Started
- [ ] Task A2: Not Started
- [ ] Task Group B: Not Started
- [ ] Task Group C: Not Started

### Integration Phase Status
- [ ] Integration Task 1: Waiting
- [ ] Integration Task 2: Waiting
- [ ] Integration Task 3: Waiting

## 🚨 FALLBACK PLAN

If parallel execution encounters conflicts:
1. Check git status for unexpected changes
2. Run conflict_resolver.py script
3. Fall back to sequential execution for conflicting tasks
4. Document conflict in CONFLICTS.md

## 💡 OPTIMIZATION NOTES

- Tasks in Group A have zero file overlap
- Tasks in Group B share read-only dependencies
- Integration Phase estimated at 30% of total time
- Parallel phase can reduce total time by 65%

---
END OF ACTIVE IMPLEMENTATION PLAN
```

### Phase 5: Validation and Optimization

Before finalizing SPRINT.md:
1. **Verify true parallelization**: No two parallel tasks modify same file
2. **Check dependency graph**: Ensure no circular dependencies
3. **Validate file paths**: All referenced files exist or are marked CREATE
4. **Test command compatibility**: Commands work with Claude Code syntax
5. **Resource estimation**: Memory/CPU requirements for parallel execution

### Phase 6: Output Summary

Provide a summary including:
1. Number of parallel tasks identified
2. Parallelization efficiency percentage
3. Estimated time savings
4. Risk factors and mitigation strategies
5. Recommended execution order for maximum efficiency

### Special Considerations for Claude Code Compatibility

- Use explicit file paths (no wildcards)
- Provide concrete implementation details (not abstractions)
- Include exact line numbers for modifications
- Use standard Python/JavaScript syntax in examples
- Avoid complex regex or shell operations
- Provide rollback instructions for each task

### Error Prevention

Include in each task:
- Pre-conditions check
- Post-conditions validation  
- Rollback procedures
- Conflict detection
- Integration test commands

This SPRINT.md file should be immediately executable by Claude Code without additional interpretation needed.