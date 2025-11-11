import { ProjectOptions } from './types';

export const STACK_OPTIONS = [
    'Next.js + Node/Express + Postgres',
    'React/Vite + FastAPI + MongoDB',
    'Vue + NestJS + MySQL',
    'SvelteKit + Go + SQLite',
    'Python/Flask + React',
    'Ruby on Rails + Vue',
    'Custom'
];

export const BACKEND_OPTIONS = [
    'Node.js (Express)',
    'Node.js (NestJS)',
    'Python (FastAPI)',
    'Python (Flask)',
    'Python (Django)',
    'Go (Gin)',
    'Ruby (Ruby on Rails)',
    'Java (Spring Boot)',
    'Rust (Actix-web)',
    'PHP (Laravel)',
];

export const FRONTEND_OPTIONS = [
    'React (Vite)',
    'Next.js',
    'Vue.js',
    'SvelteKit',
    'Angular',
    'SolidJS',
    'HTMX (with a backend)',
    'Vanilla JS',
];

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
  backend: BACKEND_OPTIONS[0],
  frontend: FRONTEND_OPTIONS[0],
};
