# Study Smart — Docker helper (Windows PowerShell)
# Usage: .\docker.ps1 up | down | rebuild | logs | status

param(
    [Parameter(Position = 0)]
    [ValidateSet("up", "down", "rebuild", "logs", "status")]
    [string]$Command = "up"
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path "backend\.env")) {
    Copy-Item "backend\.env.example" "backend\.env"
    Write-Host "Created backend\.env — add your OPENAI_API_KEY before using chat/quiz/summary."
}

switch ($Command) {
    "up" {
        docker compose up --build -d
        Write-Host ""
        Write-Host "Study Smart is starting."
        Write-Host "  App:     http://localhost:5173"
        Write-Host "  API:     http://localhost:8000/health"
        Write-Host "  Logs:    .\docker.ps1 logs"
        Write-Host "  Stop:    .\docker.ps1 down"
    }
    "down" {
        docker compose down
    }
    "rebuild" {
        docker compose down
        docker compose build --no-cache
        docker compose up -d
    }
    "logs" {
        docker compose logs -f
    }
    "status" {
        docker compose ps
    }
}
