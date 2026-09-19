[CmdletBinding()]
param()

$ErrorActionPreference = "Continue"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")
$results = [System.Collections.Generic.List[object]]::new()

function Invoke-ReleaseCheck {
    param(
        [Parameter(Mandatory)]
        [string]$Name,
        [Parameter(Mandatory)]
        [string]$Command,
        [Parameter(Mandatory)]
        [string]$WorkingDirectory
    )

    Write-Host ""
    Write-Host "[$Name]"
    Write-Host "Command: $Command"
    Write-Host "Working directory: $WorkingDirectory"

    Push-Location $WorkingDirectory
    try {
        & ([scriptblock]::Create($Command))
        $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    }
    catch {
        Write-Error $_
        $exitCode = 1
    }
    finally {
        Pop-Location
    }

    $results.Add([pscustomobject]@{
        Name = $Name
        Command = $Command
        ExitCode = $exitCode
        LikelyCause = if ($exitCode -eq 0) {
            ""
        }
        elseif ($exitCode -eq 103 -and $Command -like "*python.exe*") {
            "The virtual-environment launcher references a missing base Python installation."
        }
        elseif ($Name -eq "Alembic schema alignment") {
            "Models and migrations may differ, or the database/configuration may be unavailable."
        }
        elseif ($Name -eq "Backend tests" -or $Name -eq "Frontend tests") {
            "A test assertion failed, dependencies are missing, or the test environment is unavailable."
        }
        elseif ($Name -eq "Frontend lint") {
            "ESLint found a source or configuration violation."
        }
        elseif ($Name -eq "Frontend production build") {
            "TypeScript checking or the Vite production build failed."
        }
        elseif ($Name -eq "PWA output") {
            "The production build is missing or generated PWA assets are invalid."
        }
        elseif ($Name -eq "Git diff whitespace") {
            "The working diff contains whitespace errors or conflict markers."
        }
        else {
            "The command could not complete successfully; inspect its output above."
        }
    })
}

$backend = Join-Path $repoRoot "backend"
$frontend = Join-Path $repoRoot "frontend"
$python = ".venv/Scripts/python.exe"

Write-Host "ShelfPick release validation"
Write-Host "Repository: $repoRoot"
Write-Host "Initial git status:"
Push-Location $repoRoot
try {
    git status --short
}
finally {
    Pop-Location
}

Invoke-ReleaseCheck "Backend tests" "$python -m pytest" $backend
Invoke-ReleaseCheck "Alembic schema alignment" "$python -m alembic check" $backend
Invoke-ReleaseCheck "Frontend tests" "npm test" $frontend
Invoke-ReleaseCheck "Frontend lint" "npm run lint" $frontend
Invoke-ReleaseCheck "Frontend production build" "npm run build" $frontend
Invoke-ReleaseCheck "PWA output" "npm run check:pwa" $frontend
Invoke-ReleaseCheck "Git diff whitespace" "git diff --check" $repoRoot
Invoke-ReleaseCheck "Git status" "git status --short" $repoRoot
Invoke-ReleaseCheck "Git diff summary" "git diff --stat" $repoRoot

Write-Host ""
Write-Host "Release-check summary"
$results | Format-Table Name, ExitCode, Command, LikelyCause -Wrap

$failures = @($results | Where-Object { $_.ExitCode -ne 0 })
if ($failures.Count -gt 0) {
    Write-Host ""
    Write-Host "$($failures.Count) release check(s) failed. Review the exact commands, errors, and likely causes above."
    exit 1
}

Write-Host "All release checks passed."
exit 0
