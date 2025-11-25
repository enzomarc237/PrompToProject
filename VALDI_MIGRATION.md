# Valdi macOS Native App Migration

## Overview
Migrating PromptToProject from React web app to native macOS application using Valdi framework.

## Valdi Framework
- **Repository**: https://github.com/Snapchat/Valdi
- **Status**: Beta (8 years production at Snap)
- **License**: MIT
- **Platforms**: iOS, Android, macOS

## Key Features
- TypeScript/TSX components → Native views (no web views)
- Instant hot reload (milliseconds)
- Full VSCode debugging
- C++ layout engine with Flexbox
- Native performance

## Installation Steps

### 1. Install Valdi CLI
```bash
npm install -g @snap/valdi
```

### 2. Setup Development Environment
```bash
valdi dev_setup  # Installs Xcode, Homebrew, dependencies (10-20 min)
valdi doctor     # Verify installation
```

### 3. Bootstrap Project
```bash
mkdir valdi-macos && cd valdi-macos
valdi bootstrap
```

### 4. Generate macOS Xcode Project
```bash
./buckw project --ide xcode valdi:valdi-desktop-apple
open valdi/valdi-desktop-apple.xcworkspace
```

## Architecture

### Build System
- **Buck** (not Bazel) for desktop builds
- Xcode workspace generation
- Native .app bundle output

### Entry Points
- `main.m` - macOS app entry
- `AppDelegate.m` - App lifecycle
- `Info.plist` - App configuration

### Rendering
- NSView-based (valdi/src/valdi/macos/)
- Metal graphics backend
- Automatic view recycling

### Components
```tsx
import { Component } from 'valdi_core/src/Component';

class Example extends Component {
  onRender() {
    <view backgroundColor='#FFFFFF' padding={20}>
      <label value='Hello macOS' />
    </view>;
  }
}
```

## Migration Plan

### Phase 1: Setup & Verification
- [x] Research Valdi framework
- [x] Document architecture
- [ ] Install Valdi CLI
- [ ] Create test project
- [ ] Verify macOS build

### Phase 2: Core UI Components
- [ ] Port layout components
- [ ] Port form inputs
- [ ] Port buttons
- [ ] Port project display

### Phase 3: Business Logic
- [ ] Integrate Gemini API (native HTTP)
- [ ] Implement PocketBase auth
- [ ] Port project generation logic
- [ ] Add file system access

### Phase 4: Native Features
- [ ] macOS menu bar
- [ ] Native file dialogs
- [ ] System notifications
- [ ] Keyboard shortcuts

### Phase 5: Testing & Polish
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Build .app bundle

## Component Mapping

### React → Valdi
- `<div>` → `<view>`
- `<input>` → `<textfield>`
- `<button>` → `<button>`
- `<span>` → `<label>`
- CSS → Flexbox props

## API Integration

### Gemini API
- Use native fetch or URLSession
- No CORS issues (native app)
- Direct API calls

### PocketBase
- HTTP client for REST API
- JWT token storage (Keychain)
- Real-time subscriptions via WebSocket

## File Structure
```
valdi-macos/
├── src/
│   ├── components/     # Valdi components
│   ├── services/       # API services
│   ├── utils/          # Helpers
│   └── App.tsx         # Root component
├── valdi/
│   └── standalone_desktop/  # macOS app files
├── BUILD.bazel         # Build config
└── WORKSPACE           # Dependencies
```

## Development Workflow
1. Edit TypeScript/TSX files
2. Hot reload updates instantly
3. Debug in VSCode with breakpoints
4. Build via Xcode for distribution

## Resources
- [Valdi Docs](https://github.com/Snapchat/Valdi/tree/main/docs)
- [Getting Started](https://github.com/Snapchat/Valdi/blob/main/docs/INSTALL.md)
- [Discord](https://discord.gg/uJyNEeYX2U)
