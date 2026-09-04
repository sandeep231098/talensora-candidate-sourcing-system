[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$composeFile = Join-Path $repositoryRoot 'docker-compose.e2e.yml'
$runtimeDirectory = Join-Path $repositoryRoot '.e2e'
$backendProcess = $null
$frontendProcess = $null

function Wait-ForHttp([string]$Uri, [int]$Attempts = 60) {
    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        try {
            Invoke-WebRequest -Uri $Uri -UseBasicParsing -TimeoutSec 2 | Out-Null
            return
        } catch {
            Start-Sleep -Seconds 2
        }
    }
    throw "Timed out waiting for $Uri"
}

foreach ($port in 55433, 58180, 51025, 58025, 59093, 55173) {
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
        throw "Isolated E2E port $port is already in use."
    }
}

New-Item -ItemType Directory -Force -Path $runtimeDirectory | Out-Null

$env:E2E_DB_PASSWORD = [guid]::NewGuid().ToString('N')
$env:E2E_KEYCLOAK_ADMIN_PASSWORD = [guid]::NewGuid().ToString('N')
$env:E2E_CANDIDATE_EMAIL = 'candidate-e2e@example.test'
$env:E2E_CANDIDATE_PASSWORD = [guid]::NewGuid().ToString('N')
$env:E2E_RECRUITER_EMAIL = 'recruiter-e2e@example.test'
$env:E2E_RECRUITER_PASSWORD = [guid]::NewGuid().ToString('N')
$env:E2E_BASE_URL = 'http://localhost:55173'
$env:MSYS_NO_PATHCONV = '1'
$wslEnvironmentNames = @(
    'E2E_DB_PASSWORD',
    'E2E_KEYCLOAK_ADMIN_PASSWORD',
    'E2E_CANDIDATE_EMAIL',
    'E2E_CANDIDATE_PASSWORD',
    'E2E_RECRUITER_EMAIL',
    'E2E_RECRUITER_PASSWORD'
)
$env:WSLENV = (($wslEnvironmentNames | ForEach-Object { "$_/u" }) -join ':')

try {
    Push-Location $repositoryRoot
    docker compose -p talensora-e2e -f $composeFile up -d --wait
    if ($LASTEXITCODE -ne 0) { throw 'Unable to start isolated E2E infrastructure.' }

    Wait-ForHttp 'http://localhost:58180/realms/talensora/.well-known/openid-configuration'

    & bash 'scripts/e2e/provision-users.sh'
    if ($LASTEXITCODE -ne 0) { throw 'Unable to provision isolated E2E identities.' }

    $backendEnvironment = @{
        DB_URL = 'jdbc:postgresql://localhost:55433/talensora_candidate_db'
        DB_USERNAME = 'talensora'
        DB_PASSWORD = $env:E2E_DB_PASSWORD
        KEYCLOAK_ISSUER_URI = 'http://localhost:58180/realms/talensora'
        SERVER_PORT = '59093'
        RESUME_LOCAL_DIRECTORY = (Join-Path $runtimeDirectory 'resumes')
        SMTP_HOST = 'localhost'
        SMTP_PORT = '51025'
    }
    foreach ($entry in $backendEnvironment.GetEnumerator()) {
        [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, 'Process')
    }

    $backendProcess = Start-Process -FilePath 'java' -WindowStyle Hidden -PassThru `
        -ArgumentList '-jar', (Join-Path $repositoryRoot 'apps/backend/talensora-api/target/talensora-api-0.0.1-SNAPSHOT.jar') `
        -RedirectStandardOutput (Join-Path $runtimeDirectory 'backend.log') `
        -RedirectStandardError (Join-Path $runtimeDirectory 'backend-error.log')
    Wait-ForHttp 'http://localhost:59093/actuator/health'

    & bash 'scripts/e2e/seed-requisition.sh'
    if ($LASTEXITCODE -ne 0) { throw 'Unable to seed the isolated requisition.' }

    $env:VITE_PORT = '55173'
    $env:VITE_API_URL = 'http://localhost:59093'
    $env:VITE_KEYCLOAK_URL = 'http://localhost:58180'
    $frontendProcess = Start-Process -FilePath 'node' -WindowStyle Hidden -PassThru `
        -WorkingDirectory (Join-Path $repositoryRoot 'apps/frontend') `
        -ArgumentList 'node_modules/vite/bin/vite.js', '--host', '0.0.0.0' `
        -RedirectStandardOutput (Join-Path $runtimeDirectory 'frontend.log') `
        -RedirectStandardError (Join-Path $runtimeDirectory 'frontend-error.log')
    Wait-ForHttp 'http://127.0.0.1:55173/' 30

    Push-Location (Join-Path $repositoryRoot 'apps/frontend')
    try {
        & npm.cmd run test:e2e
        if ($LASTEXITCODE -ne 0) { throw 'Playwright critical journeys failed.' }
    } finally {
        Pop-Location
    }
} finally {
    Set-Location $repositoryRoot
    if ($frontendProcess -and !$frontendProcess.HasExited) {
        Stop-Process -Id $frontendProcess.Id -Force
    }
    if ($backendProcess -and !$backendProcess.HasExited) {
        Stop-Process -Id $backendProcess.Id -Force
    }
    docker compose -p talensora-e2e -f $composeFile down --volumes --remove-orphans
    Pop-Location
}
