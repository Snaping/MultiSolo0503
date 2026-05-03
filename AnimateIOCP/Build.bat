@echo off
echo ========================================
echo IOCP Animation Demo - Build Script
echo ========================================
echo.

echo Searching for Visual Studio 2022...
set VS_PATH=

if exist "C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe" (
    set VS_PATH=C:\Program Files\Microsoft Visual Studio\2022\Community\MSBuild\Current\Bin\MSBuild.exe
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe" (
    set VS_PATH=C:\Program Files\Microsoft Visual Studio\2022\Professional\MSBuild\Current\Bin\MSBuild.exe
) else if exist "C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe" (
    set VS_PATH=C:\Program Files\Microsoft Visual Studio\2022\Enterprise\MSBuild\Current\Bin\MSBuild.exe
) else if exist "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe" (
    set VS_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\MSBuild\Current\Bin\MSBuild.exe
)

if "%VS_PATH%"=="" (
    echo ERROR: Visual Studio 2022 with MSBuild not found!
    echo Please install Visual Studio 2022 with C++ MFC support.
    echo.
    echo Alternatively, open the solution in Visual Studio 2022 and build from there.
    pause
    exit /b 1
)

echo Found MSBuild at: %VS_PATH%
echo.

echo Building project...
echo.

pushd %~dp0

"%VS_PATH%" AnimateIOCP.sln /p:Configuration=Debug /p:Platform=x64 /t:Rebuild /v:minimal

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo The executable is located at:
    echo x64\Debug\AnimateIOCP.exe
    echo.
    echo You can run it with: x64\Debug\AnimateIOCP.exe
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
)

popd

pause
