#!/bin/bash

# AI Career Coach - Combined Startup Script
# This script starts both the backend and frontend servers

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║              AI Career Coach - Startup                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi
echo "✅ Python 3 found"

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi
echo "✅ Node.js found"

echo ""
echo "Starting services..."
echo ""

# Start backend in background
echo "🚀 Starting Backend..."
cd "$SCRIPT_DIR/backend"

# Create virtual environment if needed
if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "   Installing Python dependencies..."
pip install -q -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "   ⚠️  Creating .env from .env.example"
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env with your configuration!"
    echo "   At minimum, set up your AI model provider."
    echo ""
fi

# Start backend
echo "   Starting FastAPI server on http://localhost:8000"
python3 -m uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!

echo ""
echo "✅ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "🚀 Starting Frontend..."
cd "$SCRIPT_DIR/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "   Installing Node dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "   Creating .env from .env.example"
    cp .env.example .env
fi

echo "   Starting Vite development server on http://localhost:5173"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Frontend started (PID: $FRONTEND_PID)"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID 2> /dev/null || true
    kill $FRONTEND_PID 2> /dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

# Print status
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      Services Ready                        ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Backend:   http://localhost:8000                          ║"
echo "║  API Docs:  http://localhost:8000/docs                   ║"
echo "║  Frontend:  http://localhost:5173                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for both processes
wait