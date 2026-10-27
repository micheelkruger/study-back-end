@echo off
setlocal

set "PROJECT=%~dp0back-end\EstudosApi\EstudosApi.csproj"
set "FRONTEND=%~dp0front-end"
set "ENV_FILE=%~dp0.env.local"

if exist "%ENV_FILE%" (
    for /f "usebackq eol=# tokens=1* delims==" %%A in ("%ENV_FILE%") do (
        if /I "%%A"=="ConnectionStrings__EstudosDb" if not defined ConnectionStrings__EstudosDb set "ConnectionStrings__EstudosDb=%%B"
        if /I "%%A"=="VITE_API_PROXY_TARGET" if not defined VITE_API_PROXY_TARGET set "VITE_API_PROXY_TARGET=%%B"
        if /I "%%A"=="Cors__AllowedOrigins__0" if not defined Cors__AllowedOrigins__0 set "Cors__AllowedOrigins__0=%%B"
    )
)

if /I "%~1"=="backend" goto backend
if /I "%~1"=="frontend" goto frontend
if /I "%~1"=="migrate" goto migrate
goto usage

:backend
if not defined ConnectionStrings__EstudosDb goto missing_connection
dotnet run --project "%PROJECT%" --launch-profile http
exit /b %ERRORLEVEL%

:frontend
if not exist "%FRONTEND%\node_modules\" (
    echo Instalando dependencias do front-end...
    call npm.cmd --prefix "%FRONTEND%" ci
    if errorlevel 1 exit /b 1
)
call npm.cmd --prefix "%FRONTEND%" run dev
exit /b %ERRORLEVEL%

:migrate
if not defined ConnectionStrings__EstudosDb goto missing_connection
dotnet run --project "%PROJECT%" -- --migrate
exit /b %ERRORLEVEL%

:missing_connection
echo Configure ConnectionStrings__EstudosDb no terminal ou copie .env.example para .env.local.
echo Edite .env.local com a senha local do PostgreSQL. O arquivo e ignorado pelo Git.
exit /b 1

:usage
echo Uso: run.cmd backend ^| frontend ^| migrate
echo Execute backend e frontend em terminais separados, ambos na raiz do projeto.
exit /b 1
