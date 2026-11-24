# Setup Guide for GAS Studio Builder

## Quick Start

### 1. Prerequisites

Make sure you have installed:
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- A code editor (VS Code recommended)

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/cookienamtarnnn/GAS-studio-builder.git
cd GAS-studio-builder

# Install dependencies
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Get OpenAI API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-proj-...

# Get Anthropic API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# Get Google API key from: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=...

# Server port (default: 3001)
PORT=3001
```

**Note**: You need at least ONE AI provider API key to use the chat feature.

### 4. Run the Application

```bash
# Start both frontend and backend
npm run dev:all
```

This will start:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

Or run them separately in two terminals:

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend  
npm run server
```

## Google Apps Script Setup

### Step 1: Get Your Project ID

1. Go to [Google Apps Script](https://script.google.com/)
2. Open your project (or create a new one)
3. Click **Project Settings** (gear icon)
4. Copy the **Script ID** (this is your Project ID)

### Step 2: Enable clasp (TODO - OAuth Integration)

**Note**: Full clasp integration with OAuth is coming soon. Current version provides:
- Manual code editing
- AI code review and assistance
- Preview placeholder

**Coming soon**:
- Automatic pull from Apps Script
- Push code to Apps Script
- Test deployments
- Production deployments with version control

## Using the IDE

### Layout Overview

```
┌─────────────────────────────────────────────────┐
│                 GAS Studio Builder               │
├──────────┬──────────────────┬────────────────────┤
│          │                  │                    │
│   CHAT   │      EDITOR      │      PREVIEW       │
│          │                  │                    │
│  AI      │  Code.gs         │   Web App          │
│  Model   │  index.html      │   iframe           │
│  Select  │                  │                    │
│          │  Monaco Editor   │                    │
│  Chat    │                  │                    │
│  History │                  │                    │
│          │                  │                    │
├──────────┴──────────────────┴────────────────────┤
│  Deploy Panel: Pull | Push | Test | Deploy       │
└───────────────────────────────────────────────────┘
```

### Workflow

1. **Select AI Model**: Choose OpenAI, Claude, or Gemini from the dropdown
2. **Write Code**: Edit Code.gs and index.html in the Monaco editor
3. **Ask for Help**: 
   - "Review my code for errors"
   - "Optimize this function"
   - "Add error handling"
   - "Convert this to use async/await"
4. **Test**: Click "Test Deploy" to preview (once OAuth is integrated)
5. **Deploy**: Add description and deploy to production

### AI Chat Examples

**Code Review**:
```
You: Review my doGet function for security issues
AI: I see a few concerns...
```

**Add Features**:
```
You: Add a form to collect user email and name
AI: I'll update index.html with a form and Code.gs to handle submission
```

**Debug Issues**:
```
You: I'm getting "ReferenceError: xyz is not defined"
AI: The issue is on line 15. You're calling xyz() before it's declared...
```

## Troubleshooting

### "Cannot connect to backend"

Make sure the backend server is running:
```bash
npm run server
```

Backend should be at http://localhost:3001

### "API key invalid"

Check your `.env` file:
1. Ensure no extra spaces around the `=`
2. API keys should start with:
   - OpenAI: `sk-proj-...` or `sk-...`
   - Anthropic: `sk-ant-...`
   - Google: (varies)
3. Restart the server after changing `.env`

### Monaco Editor not loading

Clear browser cache and reload:
- Chrome: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or open DevTools (F12) and disable cache

### Port already in use

Change the port in `.env`:
```env
PORT=3002
```

And update `vite.config.ts` proxy target to match.

## Development

### Project Structure

```
src/
├── components/
│   ├── ChatPane.tsx       # AI chat with model selector
│   ├── EditorPane.tsx     # Monaco editor with file tabs
│   ├── PreviewPane.tsx    # iframe preview of web app
│   └── DeployPanel.tsx    # clasp controls
├── App.tsx                # Main 3-pane layout
└── main.tsx               # Entry with React Query
```

### Adding New Features

1. **New AI Model**: Add to `server.js` chat endpoint
2. **New File Types**: Update `EditorPane.tsx` tabs
3. **New clasp Commands**: Add endpoint in `server.js`

### Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

## Roadmap

- [ ] Google OAuth integration for clasp
- [ ] Real pull/push/deploy functionality
- [ ] Multiple .gs file support
- [ ] Syntax validation and linting
- [ ] Code snippets library
- [ ] Keyboard shortcuts
- [ ] Execution logs viewer
- [ ] Collaborative editing
- [ ] Project templates
- [ ] Git integration

## Support

- **Issues**: [GitHub Issues](https://github.com/cookienamtarnnn/GAS-studio-builder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cookienamtarnnn/GAS-studio-builder/discussions)

## License

MIT - see LICENSE file
