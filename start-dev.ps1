[CmdletBinding()]
param(
    [switch]$InstallDeps
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSCommandPath

$services = @(
    @{
        Name = 'Nexor frontend'
        Path = 'project/frontend/nexor'
        Url = 'http://localhost:5173'
        Command = 'npm run dev'
    },
    @{
        Name = 'Backend API'
        Path = 'project/backend/api'
        Url = 'http://localhost:3333'
        Command = 'npm run dev'
    }
)

function Assert-CommandAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [string]$CommandName
    )

    if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
        throw "Comando obrigatorio nao encontrado: $CommandName"
    }
}

function Install-DependenciesIfNeeded {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Service
    )

    $servicePath = Join-Path $root $Service.Path
    $nodeModulesPath = Join-Path $servicePath 'node_modules'

    if ((Test-Path $nodeModulesPath) -or (-not $InstallDeps)) {
        return
    }

    Write-Host "Instalando dependencias de $($Service.Name)..." -ForegroundColor Yellow
    npm install
}

function Start-ServiceWindow {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Service
    )

    $servicePath = Join-Path $root $Service.Path

    if (-not (Test-Path $servicePath)) {
        throw "Pasta nao encontrada: $servicePath"
    }

    if (-not (Test-Path (Join-Path $servicePath 'package.json'))) {
        throw "package.json nao encontrado em: $servicePath"
    }

    Push-Location $servicePath
    try {
        Install-DependenciesIfNeeded -Service $Service
    }
    finally {
        Pop-Location
    }

    $windowTitle = $Service.Name.Replace("'", "''")
    $command = @"
`$Host.UI.RawUI.WindowTitle = '$windowTitle'
Set-Location '$servicePath'
Write-Host 'Iniciando $($Service.Name) em $($Service.Url)...' -ForegroundColor Cyan
$($Service.Command)
"@

    Start-Process powershell.exe -ArgumentList @(
        '-NoExit',
        '-ExecutionPolicy', 'Bypass',
        '-Command', $command
    ) | Out-Null
}

Assert-CommandAvailable -CommandName 'npm'

Write-Host 'Abrindo os ambientes de desenvolvimento...' -ForegroundColor Green

foreach ($service in $services) {
    Start-ServiceWindow -Service $service
}

Write-Host ''
Write-Host 'Servicos iniciados em novas janelas:' -ForegroundColor Green
foreach ($service in $services) {
    Write-Host "- $($Service.Name): $($Service.Url)"
}

Write-Host ''
Write-Host 'Uso:' -ForegroundColor Green
Write-Host '- .\start-dev.ps1'
Write-Host '- .\start-dev.ps1 -InstallDeps'