# Script pour convertir testInfo.annotations vers allure-js-commons API

$files = @(
    "e2e\user-management.spec.ts",
    "e2e\api-integration.spec.ts",
    "e2e\ui-ux.spec.ts",
    "e2e\performance.spec.ts",
    "e2e\accessibility.spec.ts"
)

foreach ($file in $files) {
    Write-Host "Converting $file..." -ForegroundColor Cyan
    
    $content = Get-Content $file -Raw
    
    # Ajouter l'import si pas déjà présent
    if ($content -notmatch "import \* as allure from 'allure-js-commons'") {
        $content = $content -replace "(import { test, expect } from '@playwright/test';)", "`$1`nimport * as allure from 'allure-js-commons';"
    }
    
    # Convertir les signatures de fonction
    $content = $content -replace "async \(\{ page \}, testInfo\) =>", "async ({ page }) =>"
    $content = $content -replace "async \(\{ page, context \}, testInfo\) =>", "async ({ page, context }) =>"
    
    # Convertir testInfo.annotations.push vers allure API
    # Pattern pour capturer les annotations
    $content = $content -replace "testInfo\.annotations\.push\(\s*\{ type: 'epic', description: '([^']+)' \},?\s*\{ type: 'feature', description: '([^']+)' \},?\s*\{ type: 'story', description: '([^']+)' \},?\s*\{ type: 'severity', description: '([^']+)' \},?\s*\{ type: 'tag', description: '([^']+)' \}(?:,?\s*\{ type: 'tag', description: '([^']+)' \})?(?:,?\s*\{ type: 'tag', description: '([^']+)' \})?\s*\);", @"
await allure.epic('`$1');
    await allure.feature('`$2');
    await allure.story('`$3');
    await allure.severity('`$4');
    await allure.tags('`$5'$(if ('`$6') {", '`$6'"})$(if ('`$7') {", '`$7'"}));
"@
    
    Set-Content $file -Value $content -NoNewline
    Write-Host "✓ Converted $file" -ForegroundColor Green
}

Write-Host "`nConversion complete!" -ForegroundColor Green
