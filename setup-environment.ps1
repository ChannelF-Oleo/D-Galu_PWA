# setup-environment.ps1
# Script para configurar variables de entorno de Firebase Functions

Write-Host "🔧 CONFIGURANDO VARIABLES DE ENTORNO" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Verificar si Firebase CLI está instalado
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI detectado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI no encontrado. Instálalo con: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# Verificar configuración actual
Write-Host "`n📋 Verificando configuración actual..." -ForegroundColor Yellow
try {
    $currentConfig = firebase functions:config:get 2>$null
    if ($currentConfig) {
        Write-Host "Configuración actual:" -ForegroundColor Cyan
        Write-Host $currentConfig -ForegroundColor White
    } else {
        Write-Host "No hay configuración previa" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  No se pudo obtener configuración actual" -ForegroundColor Yellow
}

# Configurar Resend API Key
Write-Host "`n🔑 Configurando Resend API Key..." -ForegroundColor Yellow
$resendKey = Read-Host "Ingresa tu Resend API Key (empieza con 're_')"

if ($resendKey -and $resendKey.StartsWith("re_")) {
    try {
        firebase functions:config:set resend.api_key="$resendKey"
        Write-Host "✅ Resend API Key configurada correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error configurando Resend API Key: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ API Key inválida. Debe empezar con 're_'" -ForegroundColor Red
    Write-Host "💡 Obtén tu API Key en: https://resend.com/api-keys" -ForegroundColor Cyan
}

# Configurar zona horaria (opcional)
Write-Host "`n🌍 Configurando zona horaria..." -ForegroundColor Yellow
$timezone = Read-Host "Zona horaria para recordatorios (default: America/Santo_Domingo)"
if (-not $timezone) {
    $timezone = "America/Santo_Domingo"
}

try {
    firebase functions:config:set app.timezone="$timezone"
    Write-Host "✅ Zona horaria configurada: $timezone" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando zona horaria: $_" -ForegroundColor Red
}

# Configurar dominio de email (opcional)
Write-Host "`n📧 Configurando dominio de email..." -ForegroundColor Yellow
$emailDomain = Read-Host "Dominio para emails (default: dgalu.com)"
if (-not $emailDomain) {
    $emailDomain = "dgalu.com"
}

try {
    firebase functions:config:set app.email_domain="$emailDomain"
    Write-Host "✅ Dominio de email configurado: $emailDomain" -ForegroundColor Green
} catch {
    Write-Host "❌ Error configurando dominio: $_" -ForegroundColor Red
}

# Mostrar configuración final
Write-Host "`n📋 Configuración final:" -ForegroundColor Cyan
try {
    $finalConfig = firebase functions:config:get
    Write-Host $finalConfig -ForegroundColor White
} catch {
    Write-Host "⚠️  No se pudo obtener configuración final" -ForegroundColor Yellow
}

# Instrucciones finales
Write-Host "`n🚀 PRÓXIMOS PASOS:" -ForegroundColor Green
Write-Host "1. Instalar dependencias: cd functions && npm install" -ForegroundColor White
Write-Host "2. Desplegar funciones: firebase deploy --only functions" -ForegroundColor White
Write-Host "3. Probar envío de emails desde la aplicación" -ForegroundColor White

Write-Host "`n⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "- Las variables se aplicarán después del próximo deploy" -ForegroundColor White
Write-Host "- Guarda tu API Key de Resend en un lugar seguro" -ForegroundColor White
Write-Host "- No compartas las variables de entorno en repositorios públicos" -ForegroundColor White

Write-Host "`n✨ Configuración completada!" -ForegroundColor Green