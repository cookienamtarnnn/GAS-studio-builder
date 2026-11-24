# GAS Studio Builder

An AI-powered IDE for Google Apps Script development with real-time preview and intelligent code assistance.

## Features

- 🎨 **3-Pane Layout**: Chat | Editor | Preview
- 🤖 **Multi-Model AI**: Choose between OpenAI GPT-4, Claude 3.5 Sonnet, or Google Gemini
- 📝 **Monaco Editor**: VS Code-powered code editor for Code.gs and index.html
- 🔄 **Live Preview**: Test your web app in real-time
- 📦 **Clasp Integration**: Pull, push, and deploy directly from the IDE
- ✅ **Version Validation**: Ensure local code matches remote before deployment
- 🚀 **Test Deployments**: Preview changes without creating production versions

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Apps Script project
- API keys for AI providers (at least one):
  - OpenAI API key
  - Anthropic API key
  - Google AI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/cookienamtarnnn/GAS-studio-builder.git
cd GAS-studio-builder
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env` and add your API keys:
```bash
cp .env.example .env
```

4. Edit `.env` and add your API keys:
```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
```

## Usage

### Development

Run both the frontend and backend servers:

```bash
npm run dev:all
```

This starts:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

Or run them separately:
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server
```

### Workflow

1. **Connect Project**: Enter your Google Apps Script Project ID in the deploy panel
2. **Pull Code**: Click "Pull" to sync remote code to the editor
3. **Edit Code**: Write your Code.gs and index.html files using the Monaco editor
4. **AI Assistance**: Ask the AI to review, improve, or debug your code
5. **Test Deploy**: Click "Test Deploy" to preview your web app
6. **Validate**: The system validates local code matches remote
7. **Deploy**: Enter a description and click "Deploy" to create a new version

## Project Structure

```
GAS-studio-builder/
├── src/
│   ├── components/
│   │   ├── ChatPane.tsx       # AI chat interface
│   │   ├── EditorPane.tsx     # Code editor with tabs
│   │   ├── PreviewPane.tsx    # Web app preview iframe
│   │   └── DeployPanel.tsx    # Deployment controls
│   ├── App.tsx                # Main application layout
│   └── main.tsx               # Entry point
├── server.js                  # Express backend for API routes
├── .env.example               # Environment variables template
└── package.json
```

## API Endpoints

- `POST /api/chat` - AI chat completion
- `POST /api/clasp/pull` - Pull code from Apps Script
- `POST /api/clasp/push` - Push code to Apps Script
- `POST /api/clasp/test-deploy` - Create test deployment
- `POST /api/clasp/validate` - Validate code before deploy
- `POST /api/clasp/deploy` - Deploy new version

## TODO

- [ ] Implement full Google OAuth flow for clasp
- [ ] Add file upload support (multiple .gs files)
- [ ] Add syntax validation and linting
- [ ] Implement real-time collaboration
- [ ] Add execution logs viewer
- [ ] Support for libraries and advanced services
- [ ] Dark/light theme toggle
- [ ] Keyboard shortcuts
- [ ] Code snippets library

## Contributing

Contributions welcome! Please open an issue or submit a pull request.

## License

MIT

## Author

cookienamtarnnn
