# Script para desplegar índices de Firestore
# Ejecutar: .\deploy-firestore-indexes.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DESPLIEGUE DE ÍNDICES DE FIRESTORE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Firebase CLI esté instalado
Write-Host "Verificando Firebase CLI..." -ForegroundColor Yellow
$firebaseVersion = firebase --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase CLI no está instalado" -ForegroundColor Red
    Write-Host "Instala Firebase CLI con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Firebase CLI instalado: $firebaseVersion" -ForegroundColor Green
Write-Host ""

# Verificar que el usuario esté autenticado
Write-Host "Verificando autenticación..." -ForegroundColor Yellow
firebase projects:list 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No estás autenticado en Firebase" -ForegroundColor Red
    Write-Host "Ejecuta: firebase login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Autenticado correctamente" -ForegroundColor Green
Write-Host ""

# Mostrar índices que se van a desplegar
Write-Host "Índices a desplegar:" -ForegroundColor Cyan
Write-Host "  - bookings (2 índices)" -ForegroundColor White
Write-Host "  - services (1 índice)" -ForegroundColor White
Write-Host "  - users (1 índice)" -ForegroundColor White
Write-Host "  - courses (3 índices) ⭐ NUEVOS" -ForegroundColor Green
Write-Host "  - course_enrollments (2 índices) ⭐ NUEVOS" -ForegroundColor Green
Write-Host ""

# Confirmar despliegue
$confirm = Read-Host "¿Deseas continuar con el despliegue? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "❌ Despliegue cancelado" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Desplegando índices..." -ForegroundColor Yellow
firebase deploy --only firestore:indexes

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ ÍNDICES DESPLEGADOS EXITOSAMENTE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Los índices pueden tardar unos minutos en estar disponibles." -ForegroundColor Yellow
    Write-Host "Verifica el estado en: https://console.firebase.google.com" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Error al desplegar índices" -ForegroundColor Red
    Write-Host "Revisa los errores arriba y vuelve a intentar" -ForegroundColor Yellow
}
