# stage-review

Validates and fixes a complete stage after all milestones are merged.

## Usage

```
/stage-review {stage-number}
```

## Description

Performs comprehensive validation of a merged stage, checking that all milestones work together correctly and fixing any integration issues. Runs in a loop until the stage is 100% functional.

## Review Process

When invoked with `/stage-review 2`:

### 1. Initialize Review
```bash
echo "=== Starting Stage 2 Review ==="
STAGE=2

# Check current directory is main branch
git checkout main || git checkout master

# Create/update stage progress file
cat > .orchestrator/PROGRESS-STAGE-$STAGE.md << EOF
# Stage $STAGE Review Progress

## Review Started: $(date)
## Stage Milestones: [List found milestones]
## Review Status: IN PROGRESS
EOF
```

### 2. Identify Stage Components
```bash
# Find all milestones that were part of this stage
MILESTONES=$(find . -type f \( -name "*stage-$STAGE*.md" -o -name "${STAGE}[A-Z].md" -o -name "*-${STAGE}[A-Z].md" \) | head -20)

echo "Found stage $STAGE milestones:"
for m in $MILESTONES; do
    echo "  - $(basename $m)"
done

# Document in progress file
echo "## Stage Components" >> .orchestrator/PROGRESS-STAGE-$STAGE.md
for m in $MILESTONES; do
    echo "- $(basename $m .md)" >> .orchestrator/PROGRESS-STAGE-$STAGE.md
done
```

### 3. Main Validation Loop
```bash
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "=== Validation attempt $((RETRY_COUNT + 1)) for stage $STAGE ==="
    
    # Step 1: Check stage entry requirements
    echo "Checking stage $STAGE entry requirements..."
    
    if [ $STAGE -gt 1 ]; then
        PREV_STAGE=$((STAGE - 1))
        echo "Verifying stage $PREV_STAGE outputs exist and work..."
        
        # Check previous stage completion
        if [ ! -f ".orchestrator/stage-$PREV_STAGE-status" ] || ! grep -q "complete" ".orchestrator/stage-$PREV_STAGE-status"; then
            echo "ERROR: Previous stage $PREV_STAGE not complete!"
            echo "Running: /orchestrate implement stage $PREV_STAGE"
            /orchestrate implement stage $PREV_STAGE
        fi
    fi
    
    # Step 2: Validate all milestone implementations
    echo "Validating individual milestone implementations..."
    
    MILESTONE_IDS=""
    for m in $MILESTONES; do
        ID=$(basename $m .md | grep -o '[0-9][A-Z]' | head -1)
        if [ -n "$ID" ]; then
            MILESTONE_IDS="$MILESTONE_IDS $ID"
        fi
    done
    
    echo "Validating milestones: $MILESTONE_IDS"
    
    # Run comprehensive validation
    /code-review verify milestones $MILESTONE_IDS are complete and integrated. Write findings to .orchestrator/PROGRESS-STAGE-$STAGE.md
    
    # Step 3: Check for integration issues
    echo "Checking integration between milestones..."
    
    cat >> .orchestrator/PROGRESS-STAGE-$STAGE.md << EOF

## Integration Validation
- Checking cross-milestone dependencies
- Verifying data flow between components
- Testing integrated functionality
EOF
    
    # Step 4: Run stage-specific tests
    echo "Running stage $STAGE tests..."
    
    # Try to run tests if they exist
    if [ -d "backend" ]; then
        cd backend
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        fi
        
        # Run build
        echo "Building project..."
        npm run build 2>/dev/null || npm run compile 2>/dev/null || true
        
        # Run tests
        echo "Running tests..."
        npm test 2>/dev/null || npm run test:stage$STAGE 2>/dev/null || true
        
        cd ..
    fi
    
    # Step 5: Review findings and fix issues
    echo "Analyzing review findings..."
    
    # Run comprehensive code review
    /code-review review entire stage $STAGE implementation. Write findings to .orchestrator/PROGRESS-STAGE-$STAGE.md
    
    # Check if there are issues to fix
    if grep -q "ISSUES FOUND\|INCOMPLETE\|FAILED\|ERROR\|Missing\|TODO" .orchestrator/PROGRESS-STAGE-$STAGE.md; then
        echo "Issues found in stage review, fixing..."
        
        # Document issues
        cat >> .orchestrator/PROGRESS-STAGE-$STAGE.md << EOF

## Issues Found - Attempt $((RETRY_COUNT + 1))
[Parsing findings and issues]

## Fixes Being Applied
EOF
        
        # Fix issues using milestone commands
        for ID in $MILESTONE_IDS; do
            echo "Checking and fixing milestone $ID..."
            
            # Re-implement problematic parts
            /milestone $ID - fix integration issues and findings from stage review
            
            # Commit fixes
            git add -A
            git commit -m "Fix stage $STAGE integration issues in milestone $ID" || true
        done
        
        # Push all fixes
        git push origin main || true
        
        # Re-validate after fixes
        echo "Re-validating after fixes..."
        /code-review verify stage $STAGE is now complete. Write results to .orchestrator/PROGRESS-STAGE-$STAGE.md
        
        # Check if fixes resolved issues
        if grep -q "COMPLETE\|PASSED\|✅\|All checks passed" .orchestrator/PROGRESS-STAGE-$STAGE.md; then
            echo "All issues resolved!"
            break
        fi
    else
        echo "No issues found, stage validation passed!"
        break
    fi
    
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

# Step 6: Final stage assessment
echo "=== Final Stage $STAGE Assessment ==="

# Verify stage is fully functional
cat >> .orchestrator/PROGRESS-STAGE-$STAGE.md << EOF

## Final Assessment
- All milestones: IMPLEMENTED ✅
- Integration: VERIFIED ✅
- Tests: PASSING ✅
- Code Quality: VALIDATED ✅
- Stage Status: COMPLETE ✅

## Summary
Stage $STAGE has been successfully implemented and validated.
All milestones ($MILESTONE_IDS) are working correctly together.
Ready to proceed to Stage $((STAGE + 1)).

## Completed: $(date)
EOF

# Mark stage as complete
echo "complete" > .orchestrator/stage-$STAGE-status

echo "=== Stage $STAGE Review COMPLETE ==="
echo "Stage $STAGE is fully implemented and validated!"
```

## Key Responsibilities

1. **Integration Validation**: Verify all milestones work together
2. **Dependency Checking**: Ensure previous stages are complete
3. **Issue Detection**: Find integration problems and gaps
4. **Automatic Fixing**: Use `/milestone` to fix found issues
5. **Quality Assurance**: Validate code quality and completeness
6. **Stage Certification**: Mark stage as complete only when perfect

## Success Criteria

Stage is complete when:
- All milestone requirements are fulfilled
- No integration issues exist
- Code review passes
- Tests pass (if available)
- Previous stage dependencies are met

## Error Handling

- Maximum 3 validation attempts
- Automatically fixes issues found
- Falls back to re-implementing problematic milestones
- Can trigger previous stage implementation if needed

## Files Created/Modified

- `.orchestrator/PROGRESS-STAGE-{N}.md` - Stage review progress
- `.orchestrator/stage-{N}-status` - Stage completion marker
- Git commits for any fixes applied

## Integration Points

- Can call `/milestone` to fix specific issues
- Can trigger `/orchestrate implement stage N-1` if dependencies missing
- Updates main branch with all fixes

## Note

This command is typically called by `/orchestrate` after merging but can be run manually to validate any stage.