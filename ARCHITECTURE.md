# GAS Studio Builder - Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAS Studio (Header)                       │
│  [Brand] GAS Studio                           [AI Login] [⌘K]   │
├─────────────┬──────────────────────┬──────────────┬─────────────┤
│             │                      │              │             │
│  Chat Pane  │    Editor Pane       │ Preview Pane │  Settings   │
│  (Slide)    │    (Main)            │  (Slide)     │  (Slide)    │
│             │                      │              │             │
│  - Model    │  - Monaco Editor     │  - iframe    │  - API Keys │
│  - Messages │  - Code.gs           │  - Deploy    │  - Theme    │
│  - Input    │  - index.html        │    Status    │  - Prefs    │
│             │  - Tabs              │              │             │
├─────────────┴──────────────────────┴──────────────┴─────────────┤
│                     Deploy Panel (Command Bar)                   │
│  [Project ID] [Pull] [Push] [Test] [Description] [Deploy]       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibility Matrix

### Header (App.tsx)
**Responsibility:** Navigation, branding, global actions
- Brand identity (gradient logo + name)
- AI login/provider selection
- Command palette trigger (⌘K)
- Global settings access

### Chat Pane (Sliding Panel - Left)
**Responsibility:** AI assistance interface
- Model selection (GPT-4, Claude, Gemini)
- Conversation history (terminal style)
- User input field
- Message streaming
- Code suggestion application

**State:**
- messages: Message[]
- selectedModel: 'openai' | 'claude' | 'gemini'
- isLoading: boolean
- isExpanded: boolean (slide state)

### Editor Pane (Main - Center)
**Responsibility:** Code editing workspace
- Monaco editor instance
- File tabs (Code.gs, index.html)
- Syntax highlighting
- Auto-completion
- Geist Mono font rendering

**State:**
- codeFiles: { 'Code.gs': string, 'index.html': string }
- activeFile: 'Code.gs' | 'index.html'
- editorInstance: monaco.editor.IStandaloneCodeEditor

### Preview Pane (Sliding Panel - Right)
**Responsibility:** Live web app preview
- iframe rendering
- Deploy status display
- Empty state messaging
- Refresh capability

**State:**
- previewUrl: string
- isExpanded: boolean (slide state)
- deployStatus: 'idle' | 'deploying' | 'ready' | 'error'

### Deploy Panel (Bottom - Command Bar)
**Responsibility:** Apps Script deployment operations
- Project ID management
- Clasp operations (pull/push)
- Test deployment
- Production deployment
- Status feedback

**State:**
- projectId: string
- deployDescription: string
- isDeploying: boolean
- status: string

### Settings Panel (Sliding Panel - Right)
**Responsibility:** Configuration and preferences
- API key management (OpenAI, Anthropic, Google)
- Theme toggle (light/dark)
- Editor preferences
- Keyboard shortcuts

**State:**
- apiKeys: { openai?: string, anthropic?: string, google?: string }
- theme: 'dark' | 'light'
- editorSettings: EditorConfig

## State Management Architecture

```typescript
// Global App State
interface AppState {
  // Authentication
  aiProvider: 'openai' | 'anthropic' | 'google' | null
  isAuthenticated: boolean
  
  // Code
  codeFiles: Record<string, string>
  activeFile: string
  
  // UI State
  panels: {
    chat: { isOpen: boolean, width: number }
    preview: { isOpen: boolean, width: number }
    settings: { isOpen: boolean, width: number }
  }
  
  // Deploy
  previewUrl: string
  projectId: string
}
```

## Data Flow

```
User Action → Component Handler → State Update → Re-render

Example: AI Chat
1. User types message → ChatPane.handleSubmit()
2. POST /api/chat with { messages, codeFiles, model }
3. Backend calls AI provider API
4. Response streams back
5. ChatPane updates messages state
6. If code updates, calls parent onCodeUpdate()
7. EditorPane re-renders with new code
```

## Sliding Panel System

### Panel Types
1. **Chat** (Left) - 320px default, 240-480px range
2. **Preview** (Right) - 384px default, 320-600px range  
3. **Settings** (Right) - 400px default, fixed width

### Interaction Model
- Click toggle button → slide in/out (300ms ease)
- Drag divider → resize panel (live)
- Double-click divider → reset to default
- Keyboard: ⌘B (chat), ⌘P (preview), ⌘, (settings)

### Implementation
```typescript
// Sliding panel hook
const [panels, setPanels] = useState({
  chat: { isOpen: true, width: 320 },
  preview: { isOpen: true, width: 384 },
  settings: { isOpen: false, width: 400 }
})

// Toggle function
const togglePanel = (panel: 'chat' | 'preview' | 'settings') => {
  setPanels(prev => ({
    ...prev,
    [panel]: { ...prev[panel], isOpen: !prev[panel].isOpen }
  }))
}
```

## AI Login Architecture

### Provider Options
1. **OpenAI** (GPT-4, GPT-4 Turbo)
2. **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus)
3. **Google** (Gemini 1.5 Pro, Gemini 1.5 Flash)

### Authentication Flow
```
1. User clicks "AI Login" button
2. Modal opens with provider selection
3. User selects provider + enters API key
4. POST /api/auth/verify { provider, apiKey }
5. Backend validates key
6. Store in localStorage (encrypted)
7. Update UI state (authenticated)
8. Enable chat functionality
```

### Storage Strategy
```typescript
// LocalStorage structure
{
  "gas-studio-auth": {
    "openai": "sk-...",
    "anthropic": "sk-ant-...",
    "google": "AIza..."
  },
  "gas-studio-prefs": {
    "defaultProvider": "anthropic",
    "lastUsed": "2026-11-25T23:00:00Z"
  }
}
```

## API Endpoints

### Chat
- `POST /api/chat` - Send message, get AI response
  - Body: { messages, codeFiles, model, provider }
  - Response: { message, codeUpdates? }

### Authentication
- `POST /api/auth/verify` - Verify API key
  - Body: { provider, apiKey }
  - Response: { valid: boolean, models: string[] }

### Clasp Operations
- `POST /api/clasp/pull` - Pull from Apps Script
- `POST /api/clasp/push` - Push to Apps Script
- `POST /api/clasp/test-deploy` - Create test deployment
- `POST /api/clasp/validate` - Validate code matches remote
- `POST /api/clasp/deploy` - Deploy new version

## File Structure

```
src/
├── App.tsx                    # Main layout + state
├── index.css                  # Design system
├── components/
│   ├── Header.tsx            # NEW: Brand + AI Login
│   ├── ChatPane.tsx          # Sliding panel
│   ├── EditorPane.tsx        # Main workspace
│   ├── PreviewPane.tsx       # Sliding panel
│   ├── DeployPanel.tsx       # Command bar
│   ├── SettingsPanel.tsx     # NEW: Sliding panel
│   └── AILoginModal.tsx      # NEW: Provider selection
├── hooks/
│   ├── useSlidingPanel.ts    # NEW: Panel state
│   └── useAuth.ts            # NEW: AI authentication
└── types/
    └── index.ts              # TypeScript definitions
```

## Keyboard Shortcuts

```
⌘K        - Open command palette
⌘B        - Toggle chat panel
⌘P        - Toggle preview panel
⌘,        - Open settings
⌘S        - Save (auto-push)
⌘Enter    - Deploy
Esc       - Close modals
```

## Security Considerations

1. **API Keys**
   - Never send to frontend except during setup
   - Store encrypted in localStorage
   - Backend validates on each request
   - Rotate keys capability

2. **Google Apps Script**
   - OAuth2 flow for production
   - Service account for clasp
   - Scoped permissions only

3. **CORS**
   - Whitelist localhost:5173 (dev)
   - Production domain only (prod)

## Performance Optimizations

1. **Code Editor**
   - Debounce onChange (300ms)
   - Lazy load Monaco
   - Virtual scrolling for large files

2. **AI Streaming**
   - Server-sent events (SSE)
   - Progressive message rendering
   - Cancel in-flight requests

3. **Panel Transitions**
   - CSS transforms (not width)
   - GPU acceleration
   - will-change hints

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation throughout
- Focus trapping in modals
- Screen reader announcements for status changes
- High contrast mode support

## Browser Support

- Chrome/Edge 100+ (primary)
- Firefox 100+ (secondary)
- Safari 16+ (tertiary)
- No IE11 support

## Future Enhancements

1. **Multi-file Support** - Beyond Code.gs/index.html
2. **Git Integration** - Commit, branch, PR
3. **Collaborative Editing** - Live cursors, presence
4. **AI Code Review** - Inline suggestions
5. **Execution Logs** - Apps Script runtime logs
6. **Template Library** - Starter projects
