# install-functions-deps.ps1
# Script para instalar dependencias de Cloud Functions

Write-Host "Installing Cloud Functions dependencies..." -ForegroundColor Green

# Cambiar al directorio de functions
Set-Location functions

# Instalar dependencias
npm install

# Volver al directorio raíz
Set-Location ..

Write-Host "Cloud Functions dependencies installed successfully!" -ForegroundColor Green
Write-Host "You can now deploy the functions with: firebase deploy --only functions" -ForegroundColor Yellow