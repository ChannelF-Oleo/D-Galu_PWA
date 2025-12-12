# cleanup-dead-code.ps1
# Script para limpiar código muerto y comentarios obsoletos

Write-Host "🧹 LIMPIEZA DE CÓDIGO MUERTO" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

# Buscar comentarios obsoletos
Write-Host "`n🔍 Buscando comentarios obsoletos..." -ForegroundColor Yellow

$obsoletePatterns = @(
    "React 18",
    "TODO.*old",
    "FIXME.*deprecated", 
    "HACK.*temporary",
    "XXX.*remove",
    "Ejemplo con React 18",
    "Versión antigua",
    "Temporal.*eliminar"
)

$foundObsolete = @()

foreach ($pattern in $obsoletePatterns) {
    $matches = Select-String -Path "src/**/*.jsx", "src/**/*.js", "src/**/*.tsx", "src/**/*.ts" -Pattern $pattern -AllMatches 2>$null
    if ($matches) {
        $foundObsolete += $matches
        Write-Host "⚠️  Encontrado patrón obsoleto: $pattern" -ForegroundColor Yellow
        foreach ($match in $matches) {
            Write-Host "   📁 $($match.Filename):$($match.LineNumber) - $($match.Line.Trim())" -ForegroundColor Gray
        }
    }
}

if ($foundObsolete.Count -eq 0) {
    Write-Host "✅ No se encontraron comentarios obsoletos" -ForegroundColor Green
}

# Buscar imports no utilizados
Write-Host "`n🔍 Buscando imports potencialmente no utilizados..." -ForegroundColor Yellow

$unusedImports = @()
$jsFiles = Get-ChildItem -Path "src" -Recurse -Include "*.jsx", "*.js", "*.tsx", "*.ts"

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Buscar imports que podrían no estar siendo usados
    $imports = [regex]::Matches($content, "import\s+(\w+)\s+from")
    foreach ($import in $imports) {
        $importName = $import.Groups[1].Value
        # Contar cuántas veces aparece el import en el archivo (excluyendo la línea de import)
        $usageCount = ([regex]::Matches($content, "\b$importName\b")).Count - 1
        
        if ($usageCount -eq 0) {
            $unusedImports += @{
                File = $file.Name
                Import = $importName
                Line = $import.Value
            }
        }
    }
}

if ($unusedImports.Count -gt 0) {
    Write-Host "⚠️  Posibles imports no utilizados encontrados:" -ForegroundColor Yellow
    foreach ($unused in $unusedImports) {
        Write-Host "   📁 $($unused.File) - $($unused.Import)" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ No se encontraron imports obviamente no utilizados" -ForegroundColor Green
}

# Buscar archivos duplicados o similares
Write-Host "`n🔍 Buscando archivos potencialmente duplicados..." -ForegroundColor Yellow

$duplicatePatterns = @(
    "*-old.*",
    "*-backup.*", 
    "*-copy.*",
    "*.bak",
    "*-temp.*"
)

$duplicates = @()
foreach ($pattern in $duplicatePatterns) {
    $matches = Get-ChildItem -Path "src" -Recurse -Include $pattern 2>$null
    if ($matches) {
        $duplicates += $matches
    }
}

if ($duplicates.Count -gt 0) {
    Write-Host "⚠️  Archivos potencialmente duplicados:" -ForegroundColor Yellow
    foreach ($dup in $duplicates) {
        Write-Host "   📁 $($dup.FullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ No se encontraron archivos duplicados obvios" -ForegroundColor Green
}

# Verificar rutas de desarrollo en bundle de producción
Write-Host "`n🔍 Verificando protección de rutas de desarrollo..." -ForegroundColor Yellow

$appJsxContent = Get-Content "src/App.jsx" -Raw
if ($appJsxContent -match "import\.meta\.env\.DEV") {
    Write-Host "✅ Rutas de desarrollo protegidas con import.meta.env.DEV" -ForegroundColor Green
} else {
    Write-Host "⚠️  Rutas de desarrollo podrían no estar protegidas" -ForegroundColor Yellow
}

# Buscar console.log en producción
Write-Host "`n🔍 Buscando console.log que deberían eliminarse..." -ForegroundColor Yellow

$consoleLogs = Select-String -Path "src/**/*.jsx", "src/**/*.js", "src/**/*.tsx", "src/**/*.ts" -Pattern "console\.(log|debug|info)" -AllMatches 2>$null
if ($consoleLogs) {
    Write-Host "⚠️  Console.log encontrados (considerar eliminar en producción):" -ForegroundColor Yellow
    foreach ($log in $consoleLogs) {
        Write-Host "   📁 $($log.Filename):$($log.LineNumber) - $($log.Line.Trim())" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ No se encontraron console.log" -ForegroundColor Green
}

# Resumen y recomendaciones
Write-Host "`n📊 RESUMEN DE LIMPIEZA:" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$totalIssues = $foundObsolete.Count + $unusedImports.Count + $duplicates.Count + $consoleLogs.Count

if ($totalIssues -eq 0) {
    Write-Host "🎉 ¡Código limpio! No se encontraron problemas obvios." -ForegroundColor Green
} else {
    Write-Host "📋 Elementos encontrados para revisar:" -ForegroundColor Yellow
    Write-Host "   - Comentarios obsoletos: $($foundObsolete.Count)" -ForegroundColor White
    Write-Host "   - Imports no utilizados: $($unusedImports.Count)" -ForegroundColor White  
    Write-Host "   - Archivos duplicados: $($duplicates.Count)" -ForegroundColor White
    Write-Host "   - Console.log: $($consoleLogs.Count)" -ForegroundColor White
}

Write-Host "`n🚀 RECOMENDACIONES:" -ForegroundColor Green
Write-Host "- Revisar manualmente los elementos encontrados" -ForegroundColor White
Write-Host "- Usar herramientas como ESLint para detección automática" -ForegroundColor White
Write-Host "- Configurar pre-commit hooks para prevenir código muerto" -ForegroundColor White
Write-Host "- Ejecutar este script regularmente durante desarrollo" -ForegroundColor White

Write-Host "`n✨ Limpieza completada!" -ForegroundColor Green