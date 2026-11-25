# GAS Studio Builder - TODO List

**Last Updated:** 2026-11-25  
**Status:** In Progress  

---

## Priority Queue

### 🔴 High Priority (Quick Wins - ทำก่อน)

- [ ] **Dark/Light Theme Toggle** (30 min)
  - เพิ่มปุ่ม toggle theme
  - localStorage persistence
  - CSS variables switching

- [ ] **Keyboard Shortcuts** (1 hour)
  - ⌘K - Command palette
  - ⌘S - Save/Push
  - ⌘B - Build/Deploy
  - Esc - Close modals

- [ ] **Syntax Validation and Linting** (1 hour)
  - Monaco Editor built-in
  - JSHint/ESLint integration
  - Real-time error highlighting

- [ ] **Code Snippets Library** (1.5 hours)
  - Common GAS patterns
  - Trigger templates
  - API call examples

### 🟡 Medium Priority (Core Features)

- [ ] **File Upload Support** (2 hours)
  - Drag & drop multiple .gs files
  - Parse and add to editor
  - File tree view

- [ ] **Execution Logs Viewer** (2 hours)
  - Fetch logs from Apps Script API
  - Real-time log streaming
  - Filter/search logs

- [ ] **Google OAuth for Clasp** (3 hours)
  - Full OAuth 2.0 flow
  - Token management
  - Automatic clasp login

### 🟢 Low Priority (Advanced Features)

- [ ] **Libraries and Advanced Services** (4 hours)
  - Add library dependencies
  - Enable advanced services
  - Version management

- [ ] **Real-time Collaboration** (8+ hours)
  - WebSocket/CRDT
  - Multiple cursors
  - Presence indicators
  - Conflict resolution

---

## Implementation Plan

### Phase 1: Quick Wins (3 hours)

**Goal:** ให้ app ใช้งานสะดวกขึ้นเลย

1. ✅ Dark/Light Theme Toggle
2. ✅ Keyboard Shortcuts
3. ✅ Syntax Validation
4. ✅ Code Snippets Library

**Deliverable:** Better UX, productivity boost

---

### Phase 2: Core Features (7 hours)

**Goal:** Features ที่ใช้บ่อย

1. ⏳ File Upload Support
2. ⏳ Execution Logs Viewer
3. ⏳ Google OAuth for Clasp

**Deliverable:** Complete IDE experience

---

### Phase 3: Advanced (12+ hours)

**Goal:** Professional features

1. ⏳ Libraries and Advanced Services
2. ⏳ Real-time Collaboration

**Deliverable:** Production-ready tool

---

## Detailed Tasks

### 1. Dark/Light Theme Toggle

**Files to modify:**
- `src/index.css` - Add light theme variables
- `src/App.tsx` - Add theme state + toggle button
- `src/components/EditorPane.tsx` - Monaco theme switching

**Implementation:**
```javascript
// Theme state
const [theme, setTheme] = useState('dark')

// Toggle function
const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark'
  setTheme(newTheme)
  localStorage.setItem('theme', newTheme)
  document.documentElement.setAttribute('data-theme', newTheme)
}
```

**CSS:**
```css
:root[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-text-primary: #000000;
  /* ... */
}
```

---

### 2. Keyboard Shortcuts

**Files to modify:**
- `src/App.tsx` - Global keyboard handler
- `src/components/EditorPane.tsx` - Editor shortcuts

**Shortcuts:**
```javascript
{
  'cmd+k': 'Open command palette',
  'cmd+s': 'Save/Push code',
  'cmd+b': 'Build/Deploy',
  'cmd+shift+p': 'Preview',
  'cmd+/': 'Toggle comment',
  'esc': 'Close modals',
  'cmd+shift+f': 'Format code'
}
```

**Implementation:**
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setShowCommandPalette(true)
    }
    // ...
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])
```

---

### 3. Syntax Validation and Linting

**Files to modify:**
- `src/components/EditorPane.tsx` - Monaco diagnostics

**Monaco Built-in:**
```javascript
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false
})

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  target: monaco.languages.typescript.ScriptTarget.ES2015,
  allowNonTsExtensions: true
})
```

**Custom Linting:**
```javascript
import { JSHINT } from 'jshint'

const lintCode = (code) => {
  JSHINT(code)
  const errors = JSHINT.errors.map(err => ({
    severity: monaco.MarkerSeverity.Error,
    startLineNumber: err.line,
    startColumn: err.character,
    endLineNumber: err.line,
    endColumn: err.character + 1,
    message: err.reason
  }))
  
  monaco.editor.setModelMarkers(model, 'jshint', errors)
}
```

---

### 4. Code Snippets Library

**Files to create:**
- `src/components/SnippetsPanel.tsx`
- `src/data/snippets.json`

**Snippets:**
```json
[
  {
    "id": "doGet",
    "title": "doGet Handler",
    "description": "Web app GET request handler",
    "code": "function doGet(e) {\n  return HtmlService.createHtmlOutput('Hello World');\n}",
    "category": "web-app"
  },
  {
    "id": "onEdit",
    "title": "onEdit Trigger",
    "description": "Spreadsheet edit trigger",
    "code": "function onEdit(e) {\n  const range = e.range;\n  const sheet = range.getSheet();\n  // Your code here\n}",
    "category": "triggers"
  }
]
```

**UI:**
```
┌─────────────────────────┐
│ Code Snippets           │
├─────────────────────────┤
│ 🔍 Search...            │
├─────────────────────────┤
│ 📁 Web App              │
│   • doGet Handler       │
│   • doPost Handler      │
│ 📁 Triggers             │
│   • onEdit              │
│   • onOpen              │
│ 📁 Spreadsheet          │
│   • Get Range Values    │
│   • Set Values          │
└─────────────────────────┘
```

---

### 5. File Upload Support

**Files to modify:**
- `src/components/EditorPane.tsx` - File tree + upload

**Implementation:**
```javascript
const handleFileUpload = async (files) => {
  const gsFiles = Array.from(files).filter(f => f.name.endsWith('.gs'))
  
  for (const file of gsFiles) {
    const content = await file.text()
    setFiles(prev => [...prev, {
      name: file.name,
      content: content,
      language: 'javascript'
    }])
  }
}

// Drag & Drop
const handleDrop = (e) => {
  e.preventDefault()
  handleFileUpload(e.dataTransfer.files)
}
```

**UI:**
```
┌─────────────────────────┐
│ Files                   │
│ [+ Upload] [+ New File] │
├─────────────────────────┤
│ 📄 Code.gs              │
│ 📄 Utils.gs             │
│ 📄 Config.gs            │
│                         │
│ Drop .gs files here...  │
└─────────────────────────┘
```

---

### 6. Execution Logs Viewer

**Files to create:**
- `src/components/LogsPanel.tsx`

**Apps Script API:**
```javascript
const fetchLogs = async (projectId) => {
  const response = await fetch(
    `https://script.googleapis.com/v1/projects/${projectId}/executions`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    }
  )
  
  const data = await response.json()
  return data.executions
}
```

**UI:**
```
┌─────────────────────────────────────┐
│ Execution Logs                      │
│ [Refresh] [Auto-refresh: ON] [Clear]│
├─────────────────────────────────────┤
│ 2026-11-25 23:45:12 | INFO          │
│ Function doGet started              │
│                                     │
│ 2026-11-25 23:45:13 | SUCCESS       │
│ Function completed in 1.2s          │
│                                     │
│ 🔍 Filter: [All] [Info] [Error]    │
└─────────────────────────────────────┘
```

---

### 7. Google OAuth for Clasp

**Files to modify:**
- `src/components/DeployPanel.tsx`
- `server.js` - Add clasp OAuth endpoints

**Flow:**
```
1. User clicks "Connect Google Account"
2. OAuth popup opens (Google consent)
3. Exchange code for tokens
4. Store tokens securely
5. Run `clasp login` with tokens
6. Enable clasp commands (pull, push)
```

**Implementation:**
```javascript
const handleClaspLogin = async () => {
  // 1. Open OAuth popup
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  window.open(authUrl, 'Clasp Login', 'width=500,height=600')
  
  // 2. Handle callback
  window.addEventListener('message', async (e) => {
    if (e.data.type === 'clasp-oauth-success') {
      const { code } = e.data
      
      // 3. Exchange code for tokens
      const response = await fetch('/api/clasp/oauth/token', {
        method: 'POST',
        body: JSON.stringify({ code })
      })
      
      const { access_token, refresh_token } = await response.json()
      
      // 4. Store tokens
      localStorage.setItem('clasp-tokens', JSON.stringify({
        access: access_token,
        refresh: refresh_token
      }))
      
      setClaspAuthenticated(true)
    }
  })
}
```

---

### 8. Libraries and Advanced Services

**UI:**
```
┌─────────────────────────────────────┐
│ Project Settings                    │
├─────────────────────────────────────┤
│ 📚 Libraries                        │
│ [+ Add Library]                     │
│                                     │
│ • OAuth2 (1COxxxxxx) v43            │
│ • Moment (1Bxxxxx) v2.29.1          │
│                                     │
│ 🔧 Advanced Services                │
│ ☑ Drive API                         │
│ ☑ Sheets API                        │
│ ☐ Gmail API                         │
│ ☐ Calendar API                      │
└─────────────────────────────────────┘
```

---

### 9. Real-time Collaboration

**Tech Stack:**
- WebSocket (Socket.io)
- CRDT (Yjs)
- Monaco Editor collaborative editing

**Features:**
- Multiple cursors
- Presence indicators
- Real-time code sync
- Conflict resolution

**Complex - ทำทีหลัง**

---

## Progress Tracker

```
Quick Wins:        [░░░░░░░░░░] 0/4
Core Features:     [░░░░░░░░░░] 0/3
Advanced:          [░░░░░░░░░░] 0/2
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Progress:    [░░░░░░░░░░] 0/9
```

---

## Time Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1 | Quick Wins | 3 hours |
| Phase 2 | Core Features | 7 hours |
| Phase 3 | Advanced | 12+ hours |
| **Total** | **9 features** | **22+ hours** |

---

## Next Steps

1. ✅ Start with Phase 1 (Quick Wins)
2. ⏳ Deploy to Vercel after each phase
3. ⏳ Test on production
4. ⏳ Move to Phase 2

---

**Current Focus:** Phase 1 - Quick Wins (Starting now)

