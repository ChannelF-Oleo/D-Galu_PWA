# cleanup-project.ps1
# Script para limpiar archivos innecesarios del proyecto

Write-Host "🧹 Iniciando limpieza del proyecto..." -ForegroundColor Green

# Crear carpeta docs si no existe
if (!(Test-Path "docs")) {
    New-Item -ItemType Directory -Path "docs"
    Write-Host "✅ Carpeta docs creada" -ForegroundColor Green
}

# Archivos de documentación a mover a docs/
$docsFiles = @(
    "ACCIONES-INMEDIATAS.md",
    "CORRECCIONES-APLICADAS.md",
    "DIAGNOSTICO-PROBLEMAS.md",
    "EMAIL-SETUP-DEFINITIVO.md",
    "enable-booking-system.md",
    "final-setup-instructions.md",
    "firebase-setup.md",
    "FIXES-FINALES-COMPLETADOS.md",
    "GITIGNORE-INFO.md",
    "NOTIFICACIONES-Y-PRODUCTOS-LISTOS.md",
    "PERMISOS-ADMIN-CONFIGURADOS.md",
    "PROBLEMAS-RESUELTOS-FINAL.md",
    "PRODUCTION-SETUP.md",
    "RESTAURAR-DATOS-AHORA.md",
    "setup-test-data.md",
    "SISTEMA-ACTUALIZADO-COMPLETO.md",
    "SISTEMA-COMPLETO.md",
    "SISTEMA-FINALIZADO.md",
    "SISTEMA-NOTIFICACIONES-PRODUCTOS.md",
    "SOLUCION-FINAL-COMPLETA.md",
    "test-servicedetail.md"
)

Write-Host "📁 Moviendo archivos de documentación a docs/..." -ForegroundColor Yellow

foreach ($file in $docsFiles) {
    if (Test-Path $file) {
        Move-Item $file "docs/$file"
        Write-Host "  ✅ Movido: $file" -ForegroundColor Green
    }
}

# Archivos duplicados o innecesarios a eliminar
$filesToDelete = @(
    "firestore-simple.rules",
    "setup-firebase-data.html"
)

Write-Host "🗑️ Eliminando archivos duplicados..." -ForegroundColor Yellow

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item $file
        Write-Host "  ✅ Eliminado: $file" -ForegroundColor Green
    }
}

# Verificar archivos de configuración duplicados
Write-Host "🔍 Verificando configuraciones duplicadas..." -ForegroundColor Yellow

# Verificar si hay eslint.config.js en src/ también
if (Test-Path "src/eslint.config.js") {
    Write-Host "  ⚠️ Encontrado eslint.config.js duplicado en src/" -ForegroundColor Red
    Write-Host "  📝 Revisar manualmente cuál mantener" -ForegroundColor Yellow
}

# Limpiar archivos temporales si existen
$tempFiles = @(
    "*.tmp",
    "*.temp",
    ".DS_Store",
    "Thumbs.db"
)

foreach ($pattern in $tempFiles) {
    $files = Get-ChildItem -Path . -Name $pattern -Recurse -Force 2>$null
    foreach ($file in $files) {
        Remove-Item $file -Force
        Write-Host "  ✅ Eliminado archivo temporal: $file" -ForegroundColor Green
    }
}

Write-Host "✨ Limpieza completada!" -ForegroundColor Green
Write-Host "📋 Resumen:" -ForegroundColor Cyan
Write-Host "  - Documentación movida a docs/" -ForegroundColor White
Write-Host "  - Archivos duplicados eliminados" -ForegroundColor White
Write-Host "  - Archivos temporales limpiados" -ForegroundColor White