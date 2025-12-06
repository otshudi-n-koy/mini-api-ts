# Script de développement local pour mini-api-ts
# Simplifie les tâches courantes de développement

param(
    [Parameter(Position=0)]
    [ValidateSet('build', 'deploy', 'test', 'rebuild', 'logs', 'status', 'clean', 'help')]
    [string]$Command = 'help'
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host "`n🔹 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Build-Images {
    Write-Step "Building Docker images..."
    
    # Build API
    Write-Host "Building API image..."
    docker build -t mini-api:latest -t mini-api-ts:latest .
    
    # Build Frontend
    Write-Host "Building Frontend image..."
    Set-Location frontend
    docker build -t mini-api-frontend:latest .
    Set-Location ..
    
    Write-Success "Images built successfully"
    docker images | Select-String "mini-api"
}

function Load-Images {
    Write-Step "Loading images into Minikube..."
    
    minikube image load mini-api:latest
    minikube image load mini-api-frontend:latest
    
    Write-Success "Images loaded into Minikube"
}

function Deploy-All {
    Write-Step "Deploying to Kubernetes..."
    
    # PostgreSQL
    Write-Host "Deploying PostgreSQL..."
    kubectl apply -f k8s/postgres-secret.yaml
    kubectl apply -f k8s/postgres-config.yaml
    kubectl apply -f k8s/postgres-deployment.yaml
    kubectl apply -f k8s/postgres-service.yaml
    
    # Wait for PostgreSQL
    Write-Host "Waiting for PostgreSQL..."
    kubectl wait --for=condition=ready pod -l app=postgres --timeout=180s
    
    # Reset DB
    Write-Host "Initializing database..."
    kubectl apply -f k8s/reset-sql-config.yaml
    kubectl apply -f k8s/db-reset-job.yaml
    kubectl wait --for=condition=complete job/db-reset-job --timeout=120s
    
    # API
    Write-Host "Deploying API..."
    kubectl apply -f k8s/api-deployment.yaml
    kubectl apply -f k8s/api-service.yaml
    kubectl wait --for=condition=ready pod -l app=mini-api --timeout=180s
    
    # Frontend
    Write-Host "Deploying Frontend..."
    kubectl apply -f k8s/frontend-deployment.yaml
    kubectl apply -f k8s/frontend-service.yaml
    kubectl wait --for=condition=ready pod -l app=mini-api-frontend --timeout=180s
    
    # Ingress
    Write-Host "Setting up Ingress..."
    kubectl apply -f k8s/frontend-ingress.yaml
    
    Write-Success "Deployment complete!"
}

function Show-Logs {
    Write-Step "Application logs..."
    
    Write-Host "`n=== API Logs ===" -ForegroundColor Yellow
    kubectl logs -l app=mini-api --tail=20
    
    Write-Host "`n=== Frontend Logs ===" -ForegroundColor Yellow
    kubectl logs -l app=mini-api-frontend --tail=20
    
    Write-Host "`n=== PostgreSQL Logs ===" -ForegroundColor Yellow
    kubectl logs -l app=postgres --tail=20
}

function Show-Status {
    Write-Step "Cluster status..."
    
    Write-Host "`n=== Minikube Status ===" -ForegroundColor Yellow
    minikube status
    
    Write-Host "`n=== Pods ===" -ForegroundColor Yellow
    kubectl get pods
    
    Write-Host "`n=== Services ===" -ForegroundColor Yellow
    kubectl get services
    
    Write-Host "`n=== Ingress ===" -ForegroundColor Yellow
    kubectl get ingress
    
    Write-Host "`n=== Docker Images ===" -ForegroundColor Yellow
    docker images | Select-String "mini-api"
}

function Run-Tests {
    Write-Step "Running E2E tests..."
    
    Set-Location frontend
    npx playwright test --reporter=list
    Set-Location ..
    
    Write-Success "Tests completed"
}

function Clean-All {
    Write-Step "Cleaning up..."
    
    Write-Host "Deleting Kubernetes resources..."
    kubectl delete -f k8s/ --ignore-not-found=true
    
    Write-Host "Deleting jobs..."
    kubectl delete job --all --ignore-not-found=true
    
    Write-Success "Cleanup complete"
}

function Rebuild-All {
    Write-Step "Full rebuild and deploy..."
    
    Clean-All
    Start-Sleep -Seconds 5
    Build-Images
    Load-Images
    Deploy-All
    
    Write-Success "Rebuild complete!"
    Show-Status
}

function Show-Help {
    Write-Host @"

🚀 Mini-API Local Development Script

Usage: .\dev.ps1 <command>

Commands:
  build       Build Docker images (API + Frontend)
  deploy      Deploy all resources to Kubernetes
  rebuild     Clean, build, and deploy everything
  test        Run Playwright E2E tests
  logs        Show application logs
  status      Show cluster and deployment status
  clean       Delete all Kubernetes resources
  help        Show this help message

Examples:
  .\dev.ps1 rebuild      # Full rebuild from scratch
  .\dev.ps1 logs         # View application logs
  .\dev.ps1 status       # Check deployment status

Prerequisites:
  - Minikube running
  - Docker installed
  - kubectl configured

Quick Start:
  1. Start Minikube: minikube start
  2. Build & deploy: .\dev.ps1 rebuild
  3. Check status: .\dev.ps1 status
  4. Run tests: .\dev.ps1 test

"@
}

# Main script logic
switch ($Command) {
    'build' { Build-Images }
    'deploy' { Deploy-All }
    'rebuild' { Rebuild-All }
    'test' { Run-Tests }
    'logs' { Show-Logs }
    'status' { Show-Status }
    'clean' { Clean-All }
    'help' { Show-Help }
}
