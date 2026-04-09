#!/bin/bash

# AI Career Coach - Frontend Startup Script

echo "Starting AI Career Coach Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your configuration before running again."
    exit 1
fi

# Start the development server
echo "Starting Vite development server..."
echo "Frontend will be available at http://localhost:5173"
echo ""

npm run dev