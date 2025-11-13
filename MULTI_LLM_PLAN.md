# Multi-LLM Providers Implementation Plan

## 1. Requirements

- Support multiple LLM providers:
  - Existing: **Gemini**
  - New: **OpenAI**
  - New: **OpenRouter**
- Centralized configuration so users can:
  - Select active provider
  - Enter provider-specific API keys
  - Choose a model from a dynamically fetched list per provider
- All LLM usage routes through the chosen provider/model.
- Preserve existing behavior (Gemini + env-based config) as default.

## 2. Analyze Existing Code

Actions:
- Inspect `services/geminiService.ts` (or equivalent) for current Gemini integration.
- Inspect prompt handling and result usage in:
  - `components/PromptForm.tsx`
  - `components/ResultsDisplay.tsx`
  - `services/*`
- Inspect configuration and types:
  - `.env.local.example`
  - `constants.ts`
  - `types.ts`

Goal:
- Map UI → service and service → Gemini dependencies to identify integration points.

## 3. Configuration & Types Design

Types (e.g. in `types/llm.ts` or `types.ts`):

- `LLMProvider = 'gemini' | 'openai' | 'openrouter'`
- `LLMModelInfo`:
  - `id: string`
  - `name: string`
  - `contextWindow?: number`
  - `inputCost?: number`
  - `outputCost?: number`
- `LLMProviderSettings`:
  - `apiKey?: string`
  - `selectedModel?: string`
- `LLMSettings`:
  - `activeProvider: LLMProvider`
  - `providers: Record<LLMProvider, LLMProviderSettings>`

Persistence:
- Store `LLMSettings` client-side (e.g. via `localStorage`) with a dedicated hook/context.
- Fallback to env vars for defaults:
  - `VITE_GEMINI_API_KEY`
  - `VITE_OPENAI_API_KEY`
  - `VITE_OPENROUTER_API_KEY`
  - Optional default model envs like `VITE_DEFAULT_GEMINI_MODEL` etc.

## 4. Provider Abstraction

Introduce a provider-agnostic client, e.g. `lib/llmClient.ts`:

```ts
export interface LLMModelInfo {
  id: string;
  name: string;
  contextWindow?: number;
  inputCost?: number;
  outputCost?: number;
}

export interface LLMClient {
  listModels(): Promise<LLMModelInfo[]>;
  generate(options: { prompt: string; systemPrompt?: string; temperature?: number; maxTokens?: number; }): Promise<string>;
}
```

Implementations:
- `GeminiClient` (wraps existing Gemini logic)
- `OpenAIClient`
- `OpenRouterClient`

Factory:

```ts
export function createLLMClient(settings: LLMSettings): LLMClient { /* switch on activeProvider */ }
```

All existing generation code should:
- Read `LLMSettings`
- Instantiate `LLMClient` via factory
- Call `client.generate(...)` instead of provider-specific functions.

## 5. Dynamic Model List Fetching

For each provider:

- **Gemini**: Use official models endpoint; filter for text/chat models.
- **OpenAI**: Use `/v1/models` (or a curated allowlist) filtered to chat/completions models.
- **OpenRouter**: Use official models endpoint; filter for available, text-capable chat models.

Behavior:
- Fetch model list when:
  - Active provider changes
  - Relevant API key changes
  - Settings UI mounts (lazy-load)
- Cache per provider in memory (and optionally localStorage).
- On failure:
  - Show user-visible error/warning in settings
  - Fallback to a sane default model or allow manual input.

## 6. Settings UI Updates

If a Settings page/component exists:
- Add provider selector (Gemini/OpenAI/OpenRouter).
- For each provider:
  - API key input (stored locally, not committed)
  - Model dropdown populated from dynamic fetch
  - Optional "Refresh models" button

Validation:
- Warn or disable generation when selected provider has no API key or model.

If no Settings UI yet:
- Create a minimal `Settings` component and expose it via existing navigation.

## 7. Wiring Into Existing Flows

- Replace direct Gemini usage in:
  - `PromptForm.tsx`
  - `ResultsDisplay.tsx`
  - Any services that call Gemini directly
- Use `createLLMClient(llmSettings)` and the selected model for all generations.

Backwards compatibility:
- If `LLMSettings` is absent, default to:
  - Provider: `gemini`
  - Key/model from `VITE_GEMINI_API_KEY` and existing defaults.

## 8. Git Workflow

1. Create feature branch:
   - `git checkout -b feature/multi-llm-providers`
2. Commit in logical steps:
   - Types & abstraction
   - Provider implementations (Gemini refactor, OpenAI, OpenRouter)
   - Dynamic model fetching
   - Settings UI
   - Wiring & cleanup/tests
3. Open PR:
   - Push branch
   - `gh pr create` with summary and configuration instructions.
