#!/bin/bash
set -e

echo "🚀 Setting up Valdi for macOS development..."

# Check if Valdi is installed
if ! command -v valdi &> /dev/null; then
    echo "❌ Valdi CLI not found. Installing..."
    npm install -g @snap/valdi
else
    echo "✅ Valdi CLI already installed ($(valdi --version))"
fi

# Run Valdi development setup
echo "📦 Running valdi dev_setup (this may take 10-20 minutes)..."
valdi dev_setup

# Verify installation
echo "🔍 Verifying installation..."
valdi doctor

echo "✅ Valdi setup complete!"
echo ""
echo "Next steps:"
echo "1. cd valdi-macos"
echo "2. valdi bootstrap"
echo "3. ./buckw project --ide xcode valdi:valdi-desktop-apple"
echo "4. open valdi/valdi-desktop-apple.xcworkspace"
