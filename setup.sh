#!/bin/bash

echo "🚀 Setting up GAS Studio Builder..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and add your API keys:"
    echo "   - OPENAI_API_KEY"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - GOOGLE_API_KEY"
    echo ""
else
    echo "✅ .env file already exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "📚 Next steps:"
    echo "   1. Edit .env and add your AI provider API keys"
    echo "   2. Run 'npm run dev:all' to start the application"
    echo "   3. Open http://localhost:5173 in your browser"
    echo ""
    echo "📖 Read SETUP.md for detailed instructions"
else
    echo ""
    echo "❌ Installation failed. Please check the error above."
    exit 1
fi
