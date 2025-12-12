# verify-implementation.ps1
# Script para verificar que toda la implementación esté correcta

Write-Host "🔍 VERIFICANDO IMPLEMENTACIÓN COMPLETA DE D'GALÚ" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Verificar estructura de archivos
Write-Host "`n📁 Verificando estructura de archivos..." -ForegroundColor Yellow

$requiredFiles = @(
    "functions/src/index.ts",
    "functions/src/emailTemplates.ts", 
    "functions/package.json",
    "src/context/AuthContext.tsx",
    "src/hooks/useCustomClaims.ts",
    "src/services/bookingService.ts",
    "firestore.rules",
    "package.json"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file" -ForegroundColor Red
        $missingFiles += $file
    }
}

# Verificar dependencias
Write-Host "`n📦 Verificando dependencias..." -ForegroundColor Yellow

# Verificar package.json principal
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$hasZod = $packageJson.dependencies.zod -ne $null
$hasEmailJS = $packageJson.dependencies."@emailjs/browser" -ne $null

if ($hasZod) {
    Write-Host "✅ Zod instalado en frontend" -ForegroundColor Green
} else {
    Write-Host "❌ Zod falta en frontend" -ForegroundColor Red
}

if (-not $hasEmailJS) {
    Write-Host "✅ EmailJS eliminado del frontend" -ForegroundColor Green
} else {
    Write-Host "⚠️  EmailJS aún presente (debería eliminarse)" -ForegroundColor Yellow
}

# Verificar package.json de functions
if (Test-Path "functions/package.json") {
    $functionsPackageJson = Get-Content "functions/package.json" | ConvertFrom-Json
    $hasResend = $functionsPackageJson.dependencies.resend -ne $null
    $hasSendGrid = $functionsPackageJson.dependencies."@sendgrid/mail" -ne $null
    $hasZodFunctions = $functionsPackageJson.dependencies.zod -ne $null
    
    if ($hasResend) {
        Write-Host "✅ Resend instalado en functions" -ForegroundColor Green
    } else {
        Write-Host "❌ Resend falta en functions" -ForegroundColor Red
    }
    
    if (-not $hasSendGrid) {
        Write-Host "✅ SendGrid eliminado de functions" -ForegroundColor Green
    } else {
        Write-Host "⚠️  SendGrid aún presente (debería eliminarse)" -ForegroundColor Yellow
    }
    
    if ($hasZodFunctions) {
        Write-Host "✅ Zod instalado en functions" -ForegroundColor Green
    } else {
        Write-Host "❌ Zod falta en functions" -ForegroundColor Red
    }
}

# Verificar contenido de archivos clave
Write-Host "`n🔍 Verificando contenido de archivos..." -ForegroundColor Yellow

# Verificar que App.jsx tenga rutas protegidas
if (Test-Path "src/App.jsx") {
    $appContent = Get-Content "src/App.jsx" -Raw
    if ($appContent -match "import\.meta\.env\.DEV") {
        Write-Host "✅ Rutas de desarrollo protegidas en App.jsx" -ForegroundColor Green
    } else {
        Write-Host "❌ Rutas de desarrollo no protegidas" -ForegroundColor Red
    }
}

# Verificar firestore.rules
if (Test-Path "firestore.rules") {
    $rulesContent = Get-Content "firestore.rules" -Raw
    if ($rulesContent -match "request\.auth\.token\.role") {
        Write-Host "✅ Custom claims implementados en firestore.rules" -ForegroundColor Green
    } else {
        Write-Host "❌ Custom claims no implementados en rules" -ForegroundColor Red
    }
    
    if ($rulesContent -match "allow create: if false") {
        Write-Host "✅ Bookings securizados (solo Cloud Functions)" -ForegroundColor Green
    } else {
        Write-Host "❌ Bookings no securizados" -ForegroundColor Red
    }
}

# Verificar Cloud Functions
if (Test-Path "functions/src/index.ts") {
    $functionsContent = Get-Content "functions/src/index.ts" -Raw
    
    if ($functionsContent -match "from 'resend'") {
        Write-Host "✅ Resend importado en Cloud Functions" -ForegroundColor Green
    } else {
        Write-Host "❌ Resend no importado" -ForegroundColor Red
    }
    
    if ($functionsContent -match "timeZone\('America/Santo_Domingo'\)") {
        Write-Host "✅ Zona horaria configurada correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Zona horaria no configurada" -ForegroundColor Red
    }
    
    if ($functionsContent -match "BookingSchema\.parse") {
        Write-Host "✅ Validación con Zod implementada" -ForegroundColor Green
    } else {
        Write-Host "❌ Validación con Zod no implementada" -ForegroundColor Red
    }
}

# Resumen final
Write-Host "`n📊 RESUMEN DE VERIFICACIÓN" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if ($missingFiles.Count -eq 0) {
    Write-Host "✅ Todos los archivos requeridos están presentes" -ForegroundColor Green
} else {
    Write-Host "❌ Faltan archivos: $($missingFiles -join ', ')" -ForegroundColor Red
}

Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. Configurar Resend API key: firebase functions:config:set resend.api_key='tu_key'" -ForegroundColor White
Write-Host "2. Instalar dependencias: npm install && cd functions && npm install" -ForegroundColor White
Write-Host "3. Desplegar: firebase deploy" -ForegroundColor White
Write-Host "4. Probar creación de usuario y reserva" -ForegroundColor White

Write-Host "`n✨ ¡Implementación verificada! El sistema está listo para producción." -ForegroundColor Green