---
name: mantine-ui-specialist
description: DEPRECATED - This agent is no longer used. The project has migrated to shadcn/ui. Please use the react-developer agent instead.
model: sonnet
color: red
---

# DEPRECATED AGENT

This agent is **deprecated** and should no longer be used.

## Migration Notice

The Shadowdark Monster Manager project has migrated from Mantine UI to **shadcn/ui** (built on Radix UI primitives).

For UI component development, please use:

- **react-developer** agent for general React component work
- Refer to [shadcn/ui documentation](https://ui.shadcn.com/) for component usage
- Use Tailwind CSS for styling

## Why the Change?

The project migrated from Mantine UI to shadcn/ui for the following reasons:

- Better flexibility with component customization
- Direct access to Radix UI primitives
- Improved TypeScript support
- Better integration with Tailwind CSS
- Components are copied directly into the codebase (no external dependency)

## What Was Replaced?

| Mantine Component | shadcn/ui Equivalent               |
| ----------------- | ---------------------------------- |
| `Button`          | `Button`                           |
| `TextInput`       | `Input`                            |
| `Select`          | `Select`                           |
| `Modal`           | `Dialog`                           |
| `Notifications`   | `Toast`                            |
| `Card`            | `Card`                             |
| `Tabs`            | `Tabs`                             |
| `Badge`           | `Badge`                            |
| `Avatar`          | `Avatar`                           |
| `DataTable`       | `Table` with custom implementation |

## Migration Complete

All Mantine references have been removed from:

- ✅ Main codebase
- ✅ Documentation (CLAUDE.md, claude.md)
- ✅ Project plan (prd.md, IMPLEMENTATION_PLAN.md)
- ✅ Component implementations

This agent file is retained for historical reference only.
