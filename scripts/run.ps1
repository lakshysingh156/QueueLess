$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$venvPython = Join-Path $backend 'venv\Scripts\python.exe'
$pythonCommand = Get-Command python -ErrorAction SilentlyContinue
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
$npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue

if (Test-Path $venvPython) {
    $pythonVersionValid = & $venvPython -c 'import sys; print(int(sys.version_info >= (3, 11)))'
    if ($LASTEXITCODE -ne 0 -or $pythonVersionValid.Trim() -ne '1') {
        throw 'The project virtual environment uses an unsupported Python. Recreate backend\venv with Python 3.11 or newer.'
    }
}
else {
    if (-not $pythonCommand) {
        throw 'Python 3.11 or newer is required. Install Python and reopen PowerShell.'
    }
    $pythonVersionValid = & $pythonCommand.Source -c 'import sys; print(int(sys.version_info >= (3, 11)))'
    if ($LASTEXITCODE -ne 0 -or $pythonVersionValid.Trim() -ne '1') {
        throw 'Python 3.11 or newer is required. Install a supported version and reopen PowerShell.'
    }
}
if (-not $nodeCommand -or -not $npmCommand) {
    throw 'Node.js 22.12 or newer (including npm) is required. Install Node.js and reopen PowerShell.'
}

$nodeVersionText = (& $nodeCommand.Source --version).Trim().TrimStart('v')
$nodeVersion = [version]$nodeVersionText
if (-not (($nodeVersion.Major -eq 20 -and $nodeVersion -ge [version]'20.19') -or $nodeVersion -ge [version]'22.12')) {
    throw "Node.js 20.19+ or 22.12+ is required; found $nodeVersionText."
}

if (-not (Test-Path $venvPython)) {
    Write-Host 'Creating the project Python environment...'
    & $pythonCommand.Source -m venv (Join-Path $backend 'venv')
    if ($LASTEXITCODE -ne 0) { throw 'Could not create the Python environment.' }
}

& $venvPython -c 'import fastapi, pydantic_settings, sqlalchemy, uvicorn' 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host 'Installing backend dependencies...'
    & $venvPython -m pip install -r (Join-Path $backend 'requirements.txt')
    if ($LASTEXITCODE -ne 0) { throw 'Backend dependency installation failed.' }
}

if (-not (Test-Path (Join-Path $frontend 'node_modules\vite\bin\vite.js'))) {
    Write-Host 'Installing frontend dependencies...'
    & $npmCommand.Source --prefix $frontend ci
    if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
}

foreach ($port in @(8000, 5173)) {
    $listener = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($listener) {
        throw "Port $port is already in use (process $($listener.OwningProcess)). Stop that process, then run this command again."
    }
}

$databasePath = (Join-Path $backend 'queueless.db').Replace('\', '/')
$env:DATABASE_URL = "sqlite:///$databasePath"
$processes = @()

try {
    Write-Host 'Preparing the local demonstration database...'
    Push-Location $backend
    try {
        & $venvPython seed.py
        if ($LASTEXITCODE -ne 0) { throw 'Database preparation failed.' }
    }
    finally {
        Pop-Location
    }

    Write-Host 'Starting the QueueLess API and web app. Press Ctrl+C to stop both.'
    $processes += Start-Process -FilePath $venvPython `
        -ArgumentList @('-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000') `
        -WorkingDirectory $backend -PassThru -NoNewWindow
    $processes += Start-Process -FilePath $nodeCommand.Source `
        -ArgumentList @('node_modules/vite/bin/vite.js', '--host', '127.0.0.1') `
        -WorkingDirectory $frontend -PassThru -NoNewWindow

    $apiReady = $false
    $webReady = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        foreach ($process in $processes) {
            $process.Refresh()
            if ($process.HasExited) { throw "A project service exited during startup (process $($process.Id))." }
        }

        if (-not $apiReady) {
            try {
                $null = Invoke-RestMethod 'http://127.0.0.1:8000/api/health' -TimeoutSec 2
                $apiReady = $true
            }
            catch {}
        }
        if (-not $webReady) {
            try {
                $response = Invoke-WebRequest 'http://127.0.0.1:5173' -TimeoutSec 2 -UseBasicParsing
                $webReady = $response.StatusCode -eq 200
            }
            catch {}
        }
        if ($apiReady -and $webReady) { break }
        Start-Sleep -Seconds 1
    }

    if (-not ($apiReady -and $webReady)) {
        throw 'The services did not become ready in time. Review the startup output above.'
    }

    Write-Host ''
    Write-Host 'QueueLess is ready:'
    Write-Host '  Web app:      http://127.0.0.1:5173'
    Write-Host '  API docs:     http://127.0.0.1:8000/docs'
    Write-Host '  Health check: http://127.0.0.1:8000/api/health'

    while ($true) {
        foreach ($process in $processes) {
            $process.Refresh()
            if ($process.HasExited) { throw "A project service stopped (process $($process.Id))." }
        }
        Start-Sleep -Seconds 1
    }
}
finally {
    foreach ($process in $processes) {
        $process.Refresh()
        if (-not $process.HasExited) {
            Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
