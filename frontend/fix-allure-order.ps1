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

# Pattern: Find test declarations followed by allure calls WITHOUT the comment
$pattern = "(?s)(test\('should[^']+',\s+async\s+\(\{[^}]+\}\)\s+=>\s+\{)\s*\n\s*(await allure\.epic)"

# Replacement: Add comment between test declaration and allure calls
$replacement = '$1' + "`n    // Allure metadata MUST be set first`n    " + '$2'

# Apply the replacement
$updatedContent = [regex]::Replace($content, $pattern, $replacement)

# Check if any changes were made
if ($updatedContent -eq $content) {
    Write-Host "⚠ No changes needed in $FilePath" -ForegroundColor Yellow
} else {
    # Write back to file
    [System.IO.File]::WriteAllText($fullPath, $updatedContent, [System.Text.UTF8Encoding]::new($false))
    Write-Host "✓ Fixed $FilePath" -ForegroundColor Green
}
