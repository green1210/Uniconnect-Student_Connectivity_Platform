Use this file to provide workspace-specific custom instructions to Copilot.
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
Confirmed React + Vite (JSX), Tailwind, Express, Prisma (Neon), auth hooks.

Scaffolded monorepo and initial project structure.

Summary: Created monorepo with `apps/client` (React + Vite + Tailwind) and `apps/server` (Express + Prisma), root scripts, ESLint/Prettier, and initial pages/components.

Implemented pages (Landing, Auth, Dashboard, Feed, Forums, Projects, Materials, AI Buddy, Profile, Admin), layout, theme, sample data.

No extensions required by setup tool; skipping per rules.

Summary: Installed deps, generated Prisma client. Remote Neon migration pending; mock DB fallback added.

Added `.vscode/tasks.json` to run `npm run dev`.

- [x] Launch the Project
Dev task launches client (5173) + server (4000) with mock DB fallback.

- [x] Ensure Documentation is Complete
README current; instructions cleaned of HTML comments and updated.

Execution guidelines: concise communication, track progress, minimal noise.
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
