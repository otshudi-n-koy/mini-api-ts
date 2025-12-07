param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

$fullPath = Join-Path (Get-Location) $FilePath

if (-not (Test-Path $fullPath)) {
    Write-Error "File not found: $fullPath"
    exit 1
}

$content = Get-Content $fullPath -Raw

# Replace the import statement
$content = $content -replace "import \* as allure from 'allure-js-commons';", "import { allure } from 'allure-playwright';"

# Write back to file
[System.IO.File]::WriteAllText($fullPath, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "✓ Fixed import in $FilePath" -ForegroundColor Green
