#!/bin/bash

# Exit script on any error
set -e

# Function to clean up background processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill 0
}

# Trap Ctrl-C and other signals to run the cleanup function
trap cleanup EXIT

# --- Start Backend ---
echo "Starting backend server..."
cd backend
source venv/bin/activate
uvicorn main:app --reload &
cd ..

# --- Start Frontend ---
echo "Starting frontend server..."
cd frontend
# Check if node_modules exists, if not run npm install
if [ ! -d "node_modules" ]; then
  echo "Node modules not found. Running npm install..."
  npm install
fi
npm run dev &

# Wait for all background processes to complete
wait
