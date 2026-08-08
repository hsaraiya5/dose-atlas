# CLAUDE.md

Project-specific instructions for working on Dose Atlas.

## Project context

Product/technical design docs for this project live in Obsidian, not in this repo:

`/Users/hrishikesh/Documents/hrishikesh-saraiya/Diabetes Database/`

- `PRD.md` — product decisions (problem, users, flows, data structure, success criteria)
- `Technical Design.md` — architecture, data model, and technical decisions
- `Session Log.md` — running log of key decisions and actions taken, session by session
- `Stack & Services.md` — inventory of every external service and core dependency in use
- `Credentials.md` — API keys/secrets for services used in this project (not for sharing)

At the start of a session working on this project, read `Session Log.md` (and the other docs as needed) for context on what's been decided and done so far. At the end of a session with meaningful decisions or progress, append a new dated entry to `Session Log.md` summarizing what happened. Whenever a new external service or major dependency gets added, update `Stack & Services.md` to reflect it.

## Workflow

- Never commit directly to `main`.
- For any feature or change, create a branch first, named `hrs/<feature-name>`.
- Keep commit history organized so it's easy to revert to a known-good point.
