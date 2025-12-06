# Script pour monitorer le workflow GitHub Actions via API
# Utilise l'API publique GitHub (pas besoin de token pour les repos publics)

param(
    [int]$RefreshSeconds = 30,
    [int]$MaxChecks = 20
)

$repo = "otshudi-n-koy/mini-api-ts"
$workflow = "parallel-e2e-tests.yml"
$apiUrl = "https://api.github.com/repos/$repo/actions/workflows/$workflow/runs"

Write-Host "`n🔍 Monitoring GitHub Actions Workflow" -ForegroundColor Cyan
Write-Host "Repository: $repo" -ForegroundColor White
Write-Host "Workflow: $workflow" -ForegroundColor White
Write-Host "Refresh: Every $RefreshSeconds seconds`n" -ForegroundColor White

function Get-WorkflowStatus {
    try {
        $headers = @{
            "Accept" = "application/vnd.github.v3+json"
            "User-Agent" = "PowerShell-Workflow-Monitor"
        }
        
        $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
        return $response.workflow_runs | Select-Object -First 3
    }
    catch {
        Write-Host "⚠️  Erreur lors de la récupération des données: $($_.Exception.Message)" -ForegroundColor Yellow
        return $null
    }
}

function Format-Duration {
    param([datetime]$start, [datetime]$end)
    
    if ($end -eq [datetime]::MinValue) {
        $duration = [datetime]::UtcNow - $start
    }
    else {
        $duration = $end - $start
    }
    
    return "{0:mm}m {0:ss}s" -f $duration
}

function Show-RunStatus {
    param($run)
    
    $status = $run.status
    $conclusion = $run.conclusion
    $createdAt = [datetime]::Parse($run.created_at)
    $updatedAt = [datetime]::Parse($run.updated_at)
    
    # Icône selon le statut
    $icon = switch ($status) {
        "completed" {
            switch ($conclusion) {
                "success" { "✅" }
                "failure" { "❌" }
                "cancelled" { "🚫" }
                default { "⚪" }
            }
        }
        "in_progress" { "🔄" }
        "queued" { "⏳" }
        default { "❓" }
    }
    
    $duration = Format-Duration -start $createdAt -end $(if ($status -eq "completed") { $updatedAt } else { [datetime]::MinValue })
    
    Write-Host "`n$icon Run #$($run.run_number) - $($run.head_commit.message)" -ForegroundColor White
    Write-Host "   Status: $status" -ForegroundColor $(if ($status -eq "completed") { "Gray" } else { "Yellow" })
    
    if ($conclusion) {
        $color = switch ($conclusion) {
            "success" { "Green" }
            "failure" { "Red" }
            default { "Yellow" }
        }
        Write-Host "   Result: $conclusion" -ForegroundColor $color
    }
    
    Write-Host "   Branch: $($run.head_branch)" -ForegroundColor Gray
    Write-Host "   Duration: $duration" -ForegroundColor Gray
    Write-Host "   URL: $($run.html_url)" -ForegroundColor Blue
}

# Boucle de monitoring
$checkCount = 0
$lastRunId = $null

while ($checkCount -lt $MaxChecks) {
    Clear-Host
    
    Write-Host "`n╔══════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  GitHub Actions Workflow Monitor                    ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    Write-Host "`nRepository: $repo" -ForegroundColor White
    Write-Host "Check: $($checkCount + 1)/$MaxChecks at $(Get-Date -Format 'HH:mm:ss')`n" -ForegroundColor Gray
    
    $runs = Get-WorkflowStatus
    
    if ($runs) {
        foreach ($run in $runs) {
            Show-RunStatus -run $run
            
            # Alerter si un nouveau run démarre
            if ($run.id -ne $lastRunId -and $run.status -eq "in_progress") {
                [console]::beep(800, 200)
                Write-Host "`n🔔 Nouvelle exécution détectée!" -ForegroundColor Green
                $lastRunId = $run.id
            }
        }
        
        # Vérifier si le dernier run est terminé
        $latestRun = $runs[0]
        if ($latestRun.status -eq "completed") {
            Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
            
            if ($latestRun.conclusion -eq "success") {
                Write-Host "`n🎉 WORKFLOW TERMINÉ AVEC SUCCÈS!" -ForegroundColor Green
                [console]::beep(1000, 100)
                Start-Sleep -Milliseconds 100
                [console]::beep(1200, 100)
                break
            }
            elseif ($latestRun.conclusion -eq "failure") {
                Write-Host "`n💔 Workflow échoué. Consultez les logs." -ForegroundColor Red
                [console]::beep(400, 300)
                break
            }
        }
    }
    else {
        Write-Host "⚠️  Impossible de récupérer les données" -ForegroundColor Yellow
    }
    
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "Prochaine vérification dans $RefreshSeconds secondes..." -ForegroundColor Gray
    Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor DarkGray
    
    Start-Sleep -Seconds $RefreshSeconds
    $checkCount++
}

Write-Host "`n✨ Monitoring terminé`n" -ForegroundColor Cyan
