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

# Preflight: free commonly used dev ports to avoid EADDRINUSE
echo "Checking for stale processes on ports 8000, 8080, 5173..."
free_port() {
    port="$1"
    # Find PIDs listening on the given TCP port (macOS compatible)
    pids=$(lsof -ti tcp:"$port" -sTCP:LISTEN || true)
    if [ -n "$pids" ]; then
        echo " - Port $port in use by PID(s): $pids — terminating..."
        kill -9 $pids || true
    fi
}
free_port 8000
free_port 8080
free_port 5173

# --- Start Backend ---
echo "Starting backend server..."
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
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
cd ..

# --- Start API Documentation Server ---
echo "Starting API documentation server..."
cd docs
python3 -m http.server 8080 > /dev/null 2>&1 &
echo "API Documentation available at: http://localhost:8080/swagger-ui.html"
cd ..

# Wait for all background processes to complete
wait
