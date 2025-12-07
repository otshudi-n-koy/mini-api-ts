# Script pour convertir testInfo.annotations vers allure API
param(
    [string]$FilePath
)

$content = Get-Content $FilePath -Raw

# Convertir les signatures de fonction avec testInfo
$content = $content -replace 'async \(\{ page \}, testInfo\) =>', 'async ({ page }) =>'
$content = $content -replace 'async \(\{ page, context \}, testInfo\) =>', 'async ({ page, context }) =>'

# Pattern pour capturer testInfo.annotations.push avec tous les tags
$pattern = @'
testInfo\.annotations\.push\(\s*\{ type: 'epic', description: '([^']+)' \},\s*\{ type: 'feature', description: '([^']+)' \},\s*\{ type: 'story', description: '([^']+)' \},\s*\{ type: 'severity', description: '([^']+)' \}(?:,\s*\{ type: 'tag', description: '([^']+)' \})*\s*\);
'@

# Fonction pour extraire tous les tags
function Convert-AnnotationsBlock {
    param($match)
    
    $epic = $match.Groups[1].Value
    $feature = $match.Groups[2].Value
    $story = $match.Groups[3].Value
    $severity = $match.Groups[4].Value
    
    # Extraire tous les tags
    $tagMatches = [regex]::Matches($match.Value, "\{ type: 'tag', description: '([^']+)' \}")
    $tags = $tagMatches | ForEach-Object { "'$($_.Groups[1].Value)'" }
    $tagsStr = $tags -join ', '
    
    return @"
await allure.epic('$epic');
    await allure.feature('$feature');
    await allure.story('$story');
    await allure.severity('$severity');
    await allure.tags($tagsStr);
    
"@
}

# Utiliser callback pour remplacer chaque match
$content = [regex]::Replace($content, $pattern, {
    param($match)
    Convert-AnnotationsBlock $match
}, [System.Text.RegularExpressions.RegexOptions]::Singleline)

Set-Content $FilePath -Value $content -NoNewline
Write-Host "✓ Converted $FilePath" -ForegroundColor Green
