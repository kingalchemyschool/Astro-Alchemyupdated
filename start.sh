#!/bin/bash
# Start all services: proxy (5000), frontend (24827), API server (8080)
set -e

# Kill child processes on exit
trap 'kill 0' EXIT

# Start the API server
pnpm --filter @workspace/api-server run dev &

# Start the Vite frontend dev server
PORT=24827 BASE_PATH=/ pnpm --filter @workspace/astroboros run dev &

# Start the HTTP proxy (5000 → 24827) — wait a moment for Vite to start
sleep 2 && node proxy.mjs &

wait
