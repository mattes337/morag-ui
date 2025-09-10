# worktree-implement

Implements a single milestone in its worktree with continuous retry until complete.

## Usage

```
/worktree-implement {milestone-id}
```

## Description

Implements a specific milestone completely in its designated worktree. This command runs in a continuous loop until the milestone is 100% implemented with all code review findings resolved.

## Implementation Loop

When invoked with `/worktree-implement 2A`:

### 1. Navigate to Worktree
```bash
cd .worktrees/wt-2A
if [ ! -d ".worktrees/wt-2A" ]; then
    echo "ERROR: Worktree not found"
    exit 1
fi
```

### 2. Check Existing Progress
```bash
if [ -f "../../.orchestrator/PROGRESS-2A.md" ]; then
    cat ../../.orchestrator/PROGRESS-2A.md
    # Understand what's already done and what's pending
fi
```

### 3. Main Implementation Loop
```bash
MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "=== Implementation attempt $((RETRY_COUNT + 1)) for milestone 2A ==="
    
    # Step 1: Implement the milestone
    echo "Implementing milestone 2A..."
    /milestone 2A
    
    # Step 2: Commit changes
    git add -A
    git commit -m "Implement milestone 2A - attempt $((RETRY_COUNT + 1))" || true
    git push -u origin stage-*-2A 2>/dev/null || true
    
    # Step 3: Document progress
    cat > ../../.orchestrator/PROGRESS-2A.md << EOF
# Milestone 2A Progress

## Implementation Status
- Implementation attempt: $((RETRY_COUNT + 1))
- Last updated: $(date)

## Completed Items
[Document what has been implemented]

## Pending Items
[Document what still needs work]
EOF
    
    # Step 4: Run code review
    echo "Running code review..."
    /code-review write findings to ../../.orchestrator/PROGRESS-2A.md
    
    # Step 5: Check if there are findings to fix
    if grep -q "## Code Review Findings" ../../.orchestrator/PROGRESS-2A.md; then
        FINDINGS=$(grep -A 20 "## Code Review Findings" ../../.orchestrator/PROGRESS-2A.md)
        
        if [ -n "$FINDINGS" ] && ! echo "$FINDINGS" | grep -q "No issues found\|All checks passed"; then
            echo "Code review found issues, implementing fixes..."
            
            # Fix the findings
            /milestone 2A - fix all issues from code review findings in PROGRESS-2A.md
            
            # Commit fixes
            git add -A
            git commit -m "Fix code review findings for milestone 2A" || true
            git push || true
            
            # Re-run code review
            /code-review write findings to ../../.orchestrator/PROGRESS-2A.md
            
            # Check again
            FINDINGS=$(grep -A 20 "## Code Review Findings" ../../.orchestrator/PROGRESS-2A.md)
            if echo "$FINDINGS" | grep -q "No issues found\|All checks passed\|Clean\|✅"; then
                echo "All code review findings resolved!"
                break
            fi
        else
            echo "Code review passed!"
            break
        fi
    else
        echo "No code review findings section found, adding one..."
        echo "## Code Review Findings" >> ../../.orchestrator/PROGRESS-2A.md
        echo "Running code review again..."
        /code-review append findings to ../../.orchestrator/PROGRESS-2A.md
    fi
    
    # Step 6: Validate completeness
    echo "Validating implementation completeness..."
    
    # Check if all milestone requirements are met
    /code-review verify milestone 2A is complete. Respond with: COMPLETE or INCOMPLETE
    
    # Parse the response (this would be from the code-review output)
    # For now, we check our progress file
    if grep -q "INCOMPLETE" ../../.orchestrator/PROGRESS-2A.md; then
        echo "Implementation incomplete, continuing..."
        RETRY_COUNT=$((RETRY_COUNT + 1))
        continue
    fi
    
    # If we get here, implementation is complete
    echo "✅ Milestone 2A implementation complete!"
    break
done

# Step 7: Final validation
echo "Running final validation..."

# Ensure everything is committed
git add -A
git commit -m "Final milestone 2A implementation" || true
git push || true

# Update progress file with completion
cat >> ../../.orchestrator/PROGRESS-2A.md << EOF

## Final Status
- Status: COMPLETE ✅
- Completed at: $(date)
- Code review: PASSED
- All requirements: IMPLEMENTED
EOF

# Mark milestone as complete
echo "complete" > ../../.orchestrator/milestone-2A-status

echo "=== Milestone 2A successfully implemented ==="
```

## Key Responsibilities

1. **Complete Implementation**: Use `/milestone` command to implement all requirements
2. **Progress Tracking**: Maintain `PROGRESS-{ID}.md` with current state
3. **Code Review Integration**: Run code review and fix all findings
4. **Continuous Retry**: Loop until milestone is 100% complete
5. **Git Management**: Commit and push changes regularly
6. **Status Updates**: Update status file when complete

## Success Criteria

The milestone is only considered complete when:
- All milestone requirements are implemented
- Code review finds no issues (or all issues are fixed)
- PROGRESS file shows no pending items
- Implementation is validated as complete

## Error Handling

- Maximum 5 retry attempts to prevent infinite loops
- Each attempt builds on previous work (reads PROGRESS.md)
- Commits frequently to preserve progress
- Clear logging of what's being done

## Files Created/Modified

- `../../.orchestrator/PROGRESS-{ID}.md` - Progress tracking
- `../../.orchestrator/milestone-{ID}-status` - Completion status
- Git commits in worktree branch

## Note

This command is typically called by `/orchestrate` but can be run manually for debugging.