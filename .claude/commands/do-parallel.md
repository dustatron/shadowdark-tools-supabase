---
name: do-parallel
description: Execute plan using parallel agents with orchestration, documentation, and validation
---

You are now in parallel execution mode. Your task is to execute the current plan using an orchestrator pattern with parallel agent delegation.

<execution-strategy>

## Core Principles

1. **Orchestrator Pattern**: You act as the orchestrator, delegating work to specialized agents
2. **Maximum Parallelization**: Launch all independent agents simultaneously in a single message with multiple Task tool calls
3. **Continuous Documentation**: Run a documentation agent in parallel to track progress
4. **Validation Layer**: Run a validation agent in parallel to verify completed work

## Execution Steps

### Step 1: Analyze the Plan

- Review the current plan and identify discrete, parallelizable tasks
- Determine which specialized agents are needed (react-programmer, general-purpose, Explore, etc.)
- Identify task dependencies to understand what can run in parallel vs sequentially

### Step 2: Launch Parallel Agent Squad

In a SINGLE message, launch multiple agents in parallel:

**Required Agents:**

1. **Task Execution Agents** (1-N based on plan complexity)
   - Select appropriate agent types for each task
   - Provide clear, autonomous instructions
   - Specify what artifacts/results to return

2. **Documentation Agent** (ALWAYS REQUIRED)
   - Agent type: general-purpose
   - Task: Monitor progress and maintain real-time documentation
   - Deliverable: Updated progress log with timestamps, completions, and blockers

3. **Validation Agent** (ALWAYS REQUIRED)
   - Agent type: general-purpose
   - Task: Continuously validate completed work against requirements
   - Deliverable: Validation report with pass/fail status and issues found

**Example parallel launch:**

```
Launch 5 agents in parallel:
1. Task: [react-programmer] Implement user authentication component
2. Task: [general-purpose] Set up API endpoints for auth
3. Task: [Explore] Research existing auth patterns in codebase
4. Task: [general-purpose] Document all progress and maintain TODO list
5. Task: [general-purpose] Validate implementations against requirements
```

### Step 3: Monitor and Coordinate

- Wait for all agents to complete
- Review outputs from all agents
- Identify any blockers or failures
- Coordinate any sequential work that depends on parallel results

### Step 4: Synthesize Results

- Combine outputs from all execution agents
- Review documentation agent's progress log
- Review validation agent's findings
- Address any validation failures
- Provide comprehensive summary to user

## Agent Communication Protocol

### For Task Execution Agents:

```
Execute [specific task] autonomously.

Requirements:
- [List specific requirements]
- [Expected outputs]
- [Quality criteria]

Return:
- Summary of work completed
- Files created/modified with paths
- Any blockers encountered
- Status: Complete/Partial/Blocked
```

### For Documentation Agent:

```
Monitor and document the parallel execution of this plan:
[Insert plan here]

Maintain a real-time log including:
- Timestamp of each major milestone
- Tasks completed vs in-progress vs blocked
- Key decisions made
- Files modified
- Any issues encountered

Return:
- Comprehensive progress log
- Updated TODO list reflecting current state
- Timeline of execution
```

### For Validation Agent:

```
Validate all work completed against these requirements:
[Insert requirements/acceptance criteria]

For each deliverable:
- Verify functionality works as expected
- Check code quality and best practices
- Ensure tests pass (if applicable)
- Confirm documentation is updated
- Validate against original requirements

Return:
- Validation report with pass/fail for each item
- List of issues found with severity
- Recommendations for fixes
```

## Critical Rules

1. **ALWAYS launch agents in parallel when possible** - Use a single message with multiple Task tool calls
2. **NEVER proceed without documentation and validation agents** - These are mandatory
3. **Wait for all agents before proceeding** - Don't make assumptions about incomplete work
4. **Surface all validation failures** - User must be informed of any issues
5. **Provide comprehensive summary** - User should understand what was done, what's validated, and what's next

</execution-strategy>

<task>
Analyze the current context and plan, then execute using the parallel orchestrator pattern described above. Launch all agents in parallel, coordinate their work, and provide a comprehensive summary of results including progress documentation and validation findings.
</task>
