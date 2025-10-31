---
name: save-context
description: Generate a resume prompt to continue the ongoing project in a new conversation
---

Analyze the current project state and generate a comprehensive resume prompt that will allow continuation of this ongoing project in a new conversation.

<task>
Generate a ready-to-use resume prompt that captures:

1. **Current Project Overview**: Brief summary of what this project is about and its current state
2. **Recent Progress**: What has been accomplished recently (check git log, modified files, recent commits)
3. **Active Work**: What is currently in progress or was being worked on (check git status, uncommitted changes)
4. **Git Status**: Current branch, uncommitted changes, recent commits
5. **Key Files and Structure**: Important files, directories, and their purposes
6. **Configuration**: Key settings, slash commands, agents, and workflows being used
7. **Next Steps**: What needs to be done next based on the current state
8. **Important Context**: Any critical decisions, patterns, or conventions established

**CRITICAL**: Include a prominent note at the end that:

- The to-do list in the ongoing project likely needs to be updated to reflect the current state
- The master resume prompt in the ongoing project likely needs to be updated with new learnings and context

Format the output as a markdown code block that can be directly copied and pasted into a new conversation to seamlessly continue the work.
</task>
