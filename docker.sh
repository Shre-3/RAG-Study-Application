#!/usr/bin/env bash
# Study Smart — Docker helper (Git Bash / Linux / macOS)
# Usage: ./docker.sh up | down | rebuild | logs | status

set -euo pipefail
cd "$(dirname "$0")"

cmd="${1:-up}"

if [[ ! -f backend/.env ]]; then
  cp backend/.env.example backend/.env
  echo "Created backend/.env — add your OPENAI_API_KEY before using chat/quiz/summary."
fi

case "$cmd" in
  up)
    docker compose up --build -d
    echo ""
    echo "Study Smart is starting."
    echo "  App:     http://localhost:5173"
    echo "  API:     http://localhost:8000/health"
    echo "  Logs:    ./docker.sh logs"
    echo "  Stop:    ./docker.sh down"
    ;;
  down)
    docker compose down
    ;;
  rebuild)
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    ;;
  logs)
    docker compose logs -f
    ;;
  status)
    docker compose ps
    ;;
  *)
    echo "Usage: ./docker.sh up | down | rebuild | logs | status"
    exit 1
    ;;
esac
