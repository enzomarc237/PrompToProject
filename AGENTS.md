# Agent Development Guide

## Commands
- **Dev**: `npm run dev` (starts Vite dev server on port 3000)
- **Build**: `npm run build` (builds for production)
- **Preview**: `npm run preview` (preview production build)
- **Check PocketBase**: `node scripts/check-pocketbase.js`
- **PocketBase**: `./pocketbase serve` (starts backend on port 8090)
- **Tests**: No test framework configured yet

## Architecture
- **Frontend**: React 19 + TypeScript + Vite, runs on port 3000
- **Backend**: PocketBase (SQLite) on port 8090, admin UI at http://127.0.0.1:8090/_/
- **Database**: Two collections - `users` (auth) and `projects` (user's generated projects)
- **AI Service**: Google Gemini 2.5 Pro for project generation
- **Structure**: `/components` (UI), `/contexts` (React contexts), `/services` (API/business logic), `/types` (TypeScript types)

## Code Style
- **Imports**: Use `@/` alias for root imports (configured in tsconfig and vite.config)
- **Components**: React functional components with TypeScript, destructure props
- **Naming**: PascalCase for components, camelCase for variables/functions
- **Types**: Define in `/types` or inline, avoid `any`, interfaces for objects
- **Error Handling**: Try/catch with error messages, display via Toast component
- **Async**: Use async/await, handle loading states explicitly
- **Formatting**: Use React.FC typing, optional JSX props destructuring
