# Script pour générer et ouvrir le rapport Allure
# Fix JAVA_HOME pour Windows

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"

Write-Host "📊 Génération du rapport Allure..." -ForegroundColor Cyan
npx allure generate allure-results --clean -o allure-report

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Rapport généré avec succès!" -ForegroundColor Green
    Write-Host "🌐 Ouverture du rapport..." -ForegroundColor Cyan
    npx allure open allure-report
} else {
    Write-Host "❌ Erreur lors de la génération du rapport" -ForegroundColor Red
    exit 1
}
