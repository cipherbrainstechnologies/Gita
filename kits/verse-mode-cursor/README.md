# VERSE//MODE Cursor Kit (non-deploy)

This folder is the **kit boundary**, not a Railway application.

## What happened

The original `VERSE_MODE_Cursor_Kit` archive mixed:

1. Cursor execution prompts and product docs  
2. A Next.js commerce scaffold intended to become the real app  

Under the Gita monorepo, those concerns are split:

| Concern | Location |
|---------|----------|
| Deployable commerce app | `../../apps/web` |
| Agent master prompt | `../../apps/web/START_HERE_CURSOR.md` |
| Product / eng / QA docs | `../../apps/web/docs/**` |
| This kit marker | `kits/verse-mode-cursor` (here) |

## Rules

- Do **not** point Railway, Docker, or CI deploy roots at this folder.
- Do **not** re-create a second Next.js app here.
- When following kit instructions, open and edit **`apps/web`**.
- Treat kit language such as “extract the ZIP” as historical; the workspace is already `Gita`.
