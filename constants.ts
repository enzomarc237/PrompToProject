
import { ProjectOptions } from './types';

export const STACK_OPTIONS = ['Next.js + Node/Express + Postgres', 'React/Vite + FastAPI + MongoDB', 'Vue + NestJS + MySQL', 'SvelteKit + Go + SQLite'];
export const PATTERN_OPTIONS = ['Monolith', 'Microservice-lite (API Gateway + 2 services)', 'API-first'];
export const AUTH_OPTIONS = ['None', 'Email/Password (JWT)', 'Google OAuth'];
export const TESTING_OPTIONS = ['None', 'Jest', 'Vitest', 'Playwright (E2E)'];
export const INFRA_OPTIONS = ['None', 'Dockerfile + docker-compose', 'Basic CI/CD (GitHub Actions)'];

export const DEFAULT_PROJECT_OPTIONS: ProjectOptions = {
  description: 'A SaaS-style dashboard where users can sign up, create projects, and track tasks within each project. Tasks should have a title, description, status, and priority.',
  stack: STACK_OPTIONS[0],
  pattern: PATTERN_OPTIONS[0],
  auth: AUTH_OPTIONS[1],
  testing: TESTING_OPTIONS[2],
  infra: INFRA_OPTIONS[1],
};
