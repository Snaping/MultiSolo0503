# Build script for IOCP Animation Demo
$ErrorActionPreference = "Continue"

Write-Host "========================================"
Write-Host "IOCP Animation Demo - Build Script"
Write-Host "========================================"
Write-Host ""

$MSBuildPath = "d:\setup\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe"

if (-not (Test-Path $MSBuildPath)) {
    Write-Host "ERROR: MSBuild not found at $MSBuildPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Found MSBuild at: $MSBuildPath" -ForegroundColor Green
Write-Host ""

Push-Location $PSScriptRoot

try {
    Write-Host "Building project..." -ForegroundColor Cyan
    Write-Host ""

    & $MSBuildPath "AnimateIOCP.sln" /p:Configuration=Debug /p:Platform=x64 /t:Rebuild /v:minimal /nologo /consoleloggerparameters:Summary

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "The executable is located at:" -ForegroundColor Cyan
        $ExePath = Join-Path $PWD "x64\Debug\AnimateIOCP.exe"
        Write-Host "    $ExePath" -ForegroundColor White
        Write-Host ""

        if (Test-Path $ExePath) {
            Write-Host "Running the program..." -ForegroundColor Yellow
            & $ExePath
        }
    } else {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Red
        Write-Host "BUILD FAILED!" -ForegroundColor Red
        Write-Host "========================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please check the error messages above."
        Read-Host "Press Enter to exit"
        exit 1
    }
}
finally {
    Pop-Location
}
