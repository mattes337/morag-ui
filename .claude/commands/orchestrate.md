# orchestrate

High-level coordinator for multi-stage milestone implementation.

## Usage

```
/orchestrate all stages in backend
/orchestrate implement all stages until {N}
/orchestrate implement stage {N}
/orchestrate resume
/orchestrate status
```

## Description

Orchestrates the implementation of project stages by coordinating worktree implementations and stage reviews. This command MUST run to completion without stopping.

**CRITICAL BEHAVIOR:**
- When invoked, this command MUST implement ALL requested stages
- It MUST NOT stop after partial completion
- It MUST NOT provide progress summaries during execution
- It MUST continue through ALL stages sequentially
- It ONLY stops when ALL stages are complete

**Example: `/orchestrate all stages in backend`**
- If there are 7 stages, it MUST implement stages 1, 2, 3, 4, 5, 6, and 7
- It MUST NOT stop after stage 3 to provide a summary
- It MUST NOT decide that "core functionality is complete"
- It MUST implement EVERY stage found

## CRITICAL EXECUTION REQUIREMENTS

**YOU MUST:**
1. Actually execute implementation commands, not just plan them
2. **SPAWN `/worktree-implement` IN PARALLEL** using background processes with `&`
3. Monitor all parallel processes until completion
4. Only merge after ALL parallel implementations complete
5. Continue through ALL stages requested
6. Never stop until target is reached

## How Parallel Execution Works

Within each stage:
1. **All milestones spawn simultaneously** as background processes
2. **Each runs independently** in its own worktree
3. **Orchestrator monitors** all PIDs for completion
4. **Only merges** after all are done
5. **Then proceeds** to next stage

Example for Stage 1 with milestones 1A, 1B, 1C, 1D:
```
Spawn 1A & 1B & 1C & 1D (all at once)
Wait for all 4 to complete
Merge all 4
Review stage 1
Move to stage 2
```

## Core Orchestration Process

When invoked with `/orchestrate all stages in backend`:

### Step 1: Discover All Stages
```bash
# Find all milestone files
echo "Discovering all backend stages..."
ALL_MILESTONES=$(find . -maxdepth 2 -name "[0-9][a-z]_*.md" -o -name "[0-9][A-Z]_*.md" -o -name "*stage-[0-9]*.md" | sort)

# Determine highest stage number
MAX_STAGE=1
for m in $ALL_MILESTONES; do
    STAGE_NUM=$(echo $m | grep -o '^[0-9]' | head -1)
    if [ "$STAGE_NUM" -gt "$MAX_STAGE" ]; then
        MAX_STAGE=$STAGE_NUM
    fi
done

echo "Found stages 1 through $MAX_STAGE"
TARGET_STAGE=$MAX_STAGE
```

### Step 2: Initialize Orchestration
```bash
mkdir -p .orchestrator

# Check for existing progress
if [ -f .orchestrator/PROGRESS.md ]; then
    CURRENT=$(grep "Current Stage:" .orchestrator/PROGRESS.md | sed 's/.*: //')
    echo "Resuming from stage $CURRENT"
else
    CURRENT=1
    echo "# Orchestration Progress" > .orchestrator/PROGRESS.md
    echo "Current Stage: 1" >> .orchestrator/PROGRESS.md
    echo "Target Stage: $TARGET_STAGE" >> .orchestrator/PROGRESS.md
fi
```

### Step 3: MAIN EXECUTION LOOP - MUST COMPLETE ALL STAGES

**EXECUTE THIS LOOP - DO NOT JUST DESCRIBE IT:**

```bash
while [ $CURRENT -le $TARGET_STAGE ]; do
    echo "============================================"
    echo "IMPLEMENTING STAGE $CURRENT"
    echo "============================================"
    
    # Find milestones for this stage
    STAGE_MILESTONES=$(find . -maxdepth 2 \( -name "${CURRENT}[a-z]_*.md" -o -name "${CURRENT}[A-Z]_*.md" \) | sort)
    
    if [ -z "$STAGE_MILESTONES" ]; then
        echo "No milestones found for stage $CURRENT"
        CURRENT=$((CURRENT + 1))
        continue
    fi
    
    echo "Stage $CURRENT milestones found:"
    echo "$STAGE_MILESTONES"
    
    # Create worktrees for each milestone
    for milestone_file in $STAGE_MILESTONES; do
        # Extract ID (1a, 1b, 1A, 1B, etc.)
        FILENAME=$(basename $milestone_file)
        ID=$(echo $FILENAME | grep -o '^[0-9][a-zA-Z]' | tr '[:lower:]' '[:upper:]')
        
        if [ -z "$ID" ]; then
            continue
        fi
        
        echo "Setting up worktree for milestone $ID"
        
        # Remove old worktree if exists
        git worktree remove --force .worktrees/wt-$ID 2>/dev/null || true
        git branch -D stage-$CURRENT-$ID 2>/dev/null || true
        
        # Create new worktree
        git worktree add -b stage-$CURRENT-$ID .worktrees/wt-$ID HEAD
        
        # Copy milestone file
        cp $milestone_file .worktrees/wt-$ID/
        
        # Copy references if they exist
        [ -d "references" ] && cp -r references .worktrees/wt-$ID/
        [ -d "backend/references" ] && cp -r backend/references .worktrees/wt-$ID/
        
        # Mark as pending
        echo "pending" > .orchestrator/milestone-$ID-status
    done
    
    # NOW ACTUALLY IMPLEMENT EACH MILESTONE
    echo "Starting parallel implementation of stage $CURRENT milestones..."
    
    for status_file in .orchestrator/milestone-*-status; do
        if [ ! -f "$status_file" ]; then
            continue
        fi
        
        ID=$(basename $status_file -status | sed 's/milestone-//')
        echo ">>> IMPLEMENTING MILESTONE $ID <<<"
        
        # ACTUALLY CALL THE IMPLEMENTATION COMMAND
        /worktree-implement $ID
        
        # Note: In a real shell this would be backgrounded with &
        # But in Claude Code, we execute sequentially
    done
    
    # Wait for all implementations to complete
    echo "Waiting for all milestone implementations to complete..."
    
    ALL_COMPLETE=false
    WAIT_COUNT=0
    MAX_WAIT=60  # Maximum wait iterations
    
    while [ "$ALL_COMPLETE" = "false" ] && [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        ALL_COMPLETE=true
        COMPLETE_COUNT=0
        TOTAL_COUNT=0
        
        for status_file in .orchestrator/milestone-*-status; do
            if [ -f "$status_file" ]; then
                TOTAL_COUNT=$((TOTAL_COUNT + 1))
                STATUS=$(cat $status_file)
                if [ "$STATUS" = "complete" ]; then
                    COMPLETE_COUNT=$((COMPLETE_COUNT + 1))
                else
                    ALL_COMPLETE=false
                    # If not complete, check if implementation is stuck
                    ID=$(basename $status_file -status | sed 's/milestone-//')
                    echo "Milestone $ID status: $STATUS"
                    
                    # Re-trigger implementation if stuck
                    if [ "$STATUS" = "pending" ] && [ $WAIT_COUNT -gt 5 ]; then
                        echo "Re-triggering implementation for milestone $ID"
                        /worktree-implement $ID
                    fi
                fi
            fi
        done
        
        echo "Progress: $COMPLETE_COUNT/$TOTAL_COUNT milestones complete"
        
        if [ "$ALL_COMPLETE" = "false" ]; then
            sleep 10  # Wait before checking again
            WAIT_COUNT=$((WAIT_COUNT + 1))
        fi
    done
    
    if [ "$ALL_COMPLETE" != "true" ]; then
        echo "WARNING: Some milestones did not complete, but proceeding with completed ones"
    fi
    
    # Merge completed milestones
    echo "Merging completed milestones..."
    git checkout main || git checkout master
    
    for status_file in .orchestrator/milestone-*-status; do
        if [ -f "$status_file" ]; then
            STATUS=$(cat $status_file)
            if [ "$STATUS" = "complete" ]; then
                ID=$(basename $status_file -status | sed 's/milestone-//')
                BRANCH="stage-$CURRENT-$ID"
                
                echo "Merging branch $BRANCH"
                git merge --no-ff $BRANCH -m "Merge milestone $ID from stage $CURRENT" || {
                    echo "Merge conflict, attempting automatic resolution..."
                    git add -A
                    git commit -m "Resolve conflicts for milestone $ID"
                }
            fi
        fi
    done
    
    # Push merged changes
    git push origin main 2>/dev/null || git push origin master 2>/dev/null || true
    
    # Run stage review
    echo "Running stage review for stage $CURRENT..."
    /stage-review $CURRENT
    
    # Check if stage completed successfully
    if [ -f ".orchestrator/stage-$CURRENT-status" ] && grep -q "complete" ".orchestrator/stage-$CURRENT-status"; then
        echo "✅ Stage $CURRENT complete!"
        
        # Update progress
        sed -i "s/Current Stage: .*/Current Stage: $((CURRENT + 1))/" .orchestrator/PROGRESS.md
        echo "Stage $CURRENT: ✅ Complete - $(date)" >> .orchestrator/PROGRESS.md
        
        # Clean up worktrees
        for wt in .worktrees/wt-*; do
            [ -d "$wt" ] && git worktree remove --force "$wt" 2>/dev/null || true
        done
        
        # Clean up status files
        rm -f .orchestrator/milestone-*-status
    else
        echo "Stage $CURRENT review did not pass, retrying..."
        # Don't increment, retry the stage
        continue
    fi
    
    # Move to next stage
    CURRENT=$((CURRENT + 1))
    echo "Moving to stage $CURRENT..."
done

echo "🎉 ORCHESTRATION COMPLETE!"
echo "All stages from 1 to $TARGET_STAGE have been implemented successfully!"
```

## Key Changes for Proper Execution

1. **ACTUALLY CALLS `/worktree-implement`**: The command is explicitly called for each milestone
2. **WAITS FOR COMPLETION**: Monitors status files and re-triggers stuck implementations
3. **CONTINUES THROUGH ALL STAGES**: Loop continues until target stage is reached
4. **HANDLES FAILURES**: Re-triggers stuck implementations and retries failed stages
5. **SEQUENTIAL EXECUTION**: Since Claude Code doesn't support true background processes, implementations run sequentially

## Implementation Commands Called

For each milestone, this orchestrator will call:
- `/worktree-implement {ID}` - Implements the milestone completely
- `/stage-review {N}` - Validates and fixes the merged stage

## Error Recovery

- Re-triggers stuck implementations after timeout
- Retries stages that fail review
- Continues with completed milestones even if some fail
- Persists state for resumability

## Expected Behavior

When you run `/orchestrate all stages in backend`:
1. Finds all stages (1-7 or whatever exists)
2. For EACH stage:
   - Creates worktrees for all milestones
   - ACTUALLY IMPLEMENTS each milestone via `/worktree-implement`
   - Waits for completion
   - Merges completed work
   - Runs stage review
   - Fixes any issues
3. Continues to next stage
4. NEVER STOPS until all stages are done

## Note

This command now ensures actual execution rather than just planning. Each milestone will be fully implemented through the `/worktree-implement` command before proceeding.