# Script to generate Base64 encoded credentials for Swagger authentication
# Usage: .\generate-swagger-credentials.ps1 -Username "admin" -Password "secret"

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$true)]
    [string]$Password
)

Write-Host "🔐 Generating Swagger credentials..." -ForegroundColor Cyan

# Convert to Base64
$usernameBytes = [System.Text.Encoding]::UTF8.GetBytes($Username)
$passwordBytes = [System.Text.Encoding]::UTF8.GetBytes($Password)
$usernameBase64 = [Convert]::ToBase64String($usernameBytes)
$passwordBase64 = [Convert]::ToBase64String($passwordBytes)

Write-Host ""
Write-Host "✅ Credentials generated:" -ForegroundColor Green
Write-Host ""
Write-Host "Username (plain): $Username" -ForegroundColor Yellow
Write-Host "Username (base64): $usernameBase64" -ForegroundColor Yellow
Write-Host ""
Write-Host "Password (plain): $Password" -ForegroundColor Yellow
Write-Host "Password (base64): $passwordBase64" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Update k8s/swagger-secret.yaml with these values:" -ForegroundColor Cyan
Write-Host ""
Write-Host "data:" -ForegroundColor White
Write-Host "  SWAGGER_USER: $usernameBase64" -ForegroundColor White
Write-Host "  SWAGGER_PASS: $passwordBase64" -ForegroundColor White
Write-Host ""
Write-Host "💡 Then apply: kubectl apply -f k8s/swagger-secret.yaml" -ForegroundColor Cyan
Write-Host "💡 And restart: kubectl rollout restart deployment/api-deployment" -ForegroundColor Cyan
