# ✅ CHECKLIST DE DESPLIEGUE - D'Galú Sistema Optimizado

## 🔧 PRE-DESPLIEGUE

### 1. Configuración de Resend
- [ ] Crear cuenta en [resend.com](https://resend.com)
- [ ] Obtener API key (empieza con `re_`)
- [ ] Configurar en Firebase: `firebase functions:config:set resend.api_key="tu_key"`
- [ ] (Opcional) Configurar dominio personalizado en Resend

### 2. Instalación de Dependencias
- [ ] Frontend: `npm install`
- [ ] Backend: `cd functions && npm install && cd ..`
- [ ] Verificar que no hay errores de dependencias

### 3. Verificación de Archivos
- [ ] Ejecutar: `powershell -ExecutionPolicy Bypass -File verify-implementation.ps1`
- [ ] Corregir cualquier archivo faltante o error reportado

## 🚀 DESPLIEGUE

### 1. Desplegar Reglas de Firestore
```bash
firebase deploy --only firestore:rules
```
- [ ] Verificar que no hay errores de sintaxis
- [ ] Confirmar que las reglas se aplicaron correctamente

### 2. Desplegar Cloud Functions
```bash
firebase deploy --only functions
```
- [ ] Verificar que todas las funciones se desplegaron:
  - `createUserProfile`
  - `updateUserClaims`
  - `refreshUserClaims`
  - `createBooking`
  - `updateBooking`
  - `sendBookingConfirmation`
  - `sendBookingReminders`
  - `updateBookingStatus`

### 3. Desplegar Frontend (si es necesario)
```bash
npm run build
firebase deploy --only hosting
```

## 🧪 PRUEBAS POST-DESPLIEGUE

### 1. Prueba de Creación de Usuario
- [ ] Registrar nuevo usuario
- [ ] Verificar que se crea perfil automáticamente en Firestore
- [ ] Confirmar que se asignan custom claims (rol: customer)
- [ ] Verificar que no hay errores en logs de Cloud Functions

### 2. Prueba de Sistema de Emails
- [ ] Crear una reserva de prueba
- [ ] Verificar que llega email de confirmación
- [ ] Revisar que el template se ve correctamente
- [ ] Confirmar que se registra en `email_logs`

### 3. Prueba de Custom Claims
- [ ] Cambiar rol de un usuario en Firestore (admin panel)
- [ ] Verificar que se actualizan los custom claims automáticamente
- [ ] Probar acceso a rutas administrativas
- [ ] Confirmar que las reglas de Firestore respetan los nuevos permisos

### 4. Prueba de Validación
- [ ] Intentar crear reserva con datos inválidos
- [ ] Verificar que se rechaza con mensaje de error claro
- [ ] Confirmar que no se guarda nada en Firestore

### 5. Prueba de Rutas de Desarrollo
- [ ] En producción, verificar que `/diagnostic`, `/upload-services`, `/test-notifications` no son accesibles
- [ ] En desarrollo (`npm run dev`), confirmar que sí son accesibles

## 📊 MONITOREO

### 1. Logs de Cloud Functions
```bash
firebase functions:log
```
- [ ] Verificar que no hay errores críticos
- [ ] Confirmar que los emails se envían correctamente
- [ ] Revisar logs de creación de usuarios

### 2. Métricas de Firestore
- [ ] Verificar lecturas/escrituras en consola de Firebase
- [ ] Confirmar que las lecturas de verificación de roles han disminuido
- [ ] Revisar uso de custom claims vs consultas directas

### 3. Métricas de Resend
- [ ] Verificar deliverability en dashboard de Resend
- [ ] Confirmar que no hay bounces o spam reports
- [ ] Revisar límites de uso (3,000 emails/mes gratis)

## 🔒 SEGURIDAD

### 1. Verificación de Reglas
- [ ] Intentar acceso no autorizado a colecciones sensibles
- [ ] Verificar que solo staff puede actualizar bookings
- [ ] Confirmar que usuarios no pueden cambiar sus propios roles

### 2. Validación de Endpoints
- [ ] Probar Cloud Functions con datos maliciosos
- [ ] Verificar que Zod rechaza inputs inválidos
- [ ] Confirmar autenticación requerida donde corresponde

## 📋 CONFIGURACIÓN DE PRODUCCIÓN

### 1. Variables de Entorno
- [ ] `resend.api_key` configurada
- [ ] Verificar que no hay keys de desarrollo en producción
- [ ] Confirmar configuración de zona horaria

### 2. Dominios y CORS
- [ ] Configurar dominios permitidos en Firebase
- [ ] Verificar CORS en Cloud Functions si es necesario
- [ ] Confirmar configuración de dominio en Resend

## 🆘 ROLLBACK (Si algo falla)

### Plan de Contingencia
- [ ] Backup de reglas de Firestore anteriores
- [ ] Versión anterior de Cloud Functions disponible
- [ ] Procedimiento para revertir custom claims
- [ ] Contactos de soporte técnico

### Comandos de Rollback
```bash
# Revertir Cloud Functions
firebase functions:delete nombreFuncion

# Revertir reglas de Firestore
firebase deploy --only firestore:rules --project=backup-rules
```

## ✅ SIGN-OFF

### Aprobaciones Requeridas
- [ ] **Desarrollador**: Todas las pruebas técnicas pasadas
- [ ] **QA**: Funcionalidad verificada end-to-end  
- [ ] **Administrador**: Configuración de producción aprobada
- [ ] **Usuario Final**: UX y emails aprobados

### Documentación
- [ ] README actualizado con nuevas instrucciones
- [ ] Documentación de API actualizada
- [ ] Guías de usuario actualizadas
- [ ] Procedimientos de soporte documentados

---

**Fecha de despliegue**: ___________
**Responsable**: ___________
**Versión**: v2.0 - Sistema Optimizado
**Estado**: [ ] Completado [ ] Pendiente [ ] Con issues