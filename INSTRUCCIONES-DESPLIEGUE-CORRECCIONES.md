# 🚀 INSTRUCCIONES DE DESPLIEGUE - CORRECCIONES FASE 1

**Fecha**: 15 de Enero, 2026  
**Tiempo estimado**: 15-20 minutos

---

## 📋 PRE-REQUISITOS

Antes de comenzar, asegúrate de tener:

- [ ] Node.js instalado (v18 o superior)
- [ ] Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Acceso al proyecto Firebase
- [ ] Git instalado (para control de versiones)

---

## 🔧 PASO 1: VERIFICAR CAMBIOS LOCALES

### 1.1 Revisar archivos modificados

```powershell
# Ver archivos modificados
git status

# Deberías ver:
# - src/components/ui/CourseModal.jsx
# - src/pages/Academy/CourseDetail.jsx
# - src/components/ui/StudentModal.jsx
# - firestore.indexes.json
```

### 1.2 Verificar que no hay errores de sintaxis

```powershell
# Ejecutar linter
npm run lint

# Si hay errores, corregirlos antes de continuar
```

### 1.3 Compilar proyecto localmente

```powershell
# Compilar
npm run build

# Verificar que no hay errores de compilación
```

✅ **Checkpoint**: Si todo compila sin errores, continuar al Paso 2

---

## 🔥 PASO 2: DESPLEGAR ÍNDICES DE FIRESTORE

### 2.1 Autenticarse en Firebase

```powershell
# Login en Firebase
firebase login

# Verificar proyecto actual
firebase projects:list
```

### 2.2 Seleccionar proyecto correcto

```powershell
# Si no estás en el proyecto correcto
firebase use <nombre-del-proyecto>

# Ejemplo:
# firebase use dgalu-pwa
```

### 2.3 Desplegar índices

**Opción A: Script automatizado (Recomendado)**
```powershell
.\deploy-firestore-indexes.ps1
```

**Opción B: Manual**
```powershell
firebase deploy --only firestore:indexes
```

### 2.4 Verificar despliegue

1. Ir a [Firebase Console](https://console.firebase.google.com)
2. Seleccionar tu proyecto
3. Ir a Firestore Database → Índices
4. Verificar que aparecen los nuevos índices:
   - `courses` (3 índices)
   - `course_enrollments` (2 índices)

⏳ **Nota**: Los índices pueden tardar 5-10 minutos en estar completamente activos

✅ **Checkpoint**: Índices desplegados y en estado "Enabled"

---

## 📦 PASO 3: DESPLEGAR APLICACIÓN

### 3.1 Compilar para producción

```powershell
# Limpiar build anterior
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Compilar
npm run build
```

### 3.2 Probar build localmente (Opcional)

```powershell
# Previsualizar build
npm run preview

# Abrir http://localhost:4173 y probar funcionalidad
```

### 3.3 Desplegar a Firebase Hosting

```powershell
# Desplegar hosting
firebase deploy --only hosting

# O desplegar todo (hosting + functions + rules)
firebase deploy
```

✅ **Checkpoint**: Aplicación desplegada exitosamente

---

## 🧪 PASO 4: VERIFICACIÓN POST-DESPLIEGUE

### 4.1 Verificar URL de producción

```powershell
# Obtener URL de producción
firebase hosting:channel:list
```

### 4.2 Tests básicos en producción

1. **Test de Validación**
   - Ir a `/admin/academy`
   - Intentar crear curso con datos inválidos
   - ✅ Debe mostrar errores

2. **Test de Duplicados**
   - Ir a `/academy`
   - Inscribirse en un curso
   - Intentar inscribirse de nuevo
   - ✅ Debe prevenir duplicado

3. **Test de Email**
   - Inscribirse en un curso
   - Verificar email recibido
   - ✅ Debe llegar confirmación

### 4.3 Verificar consola del navegador

```
1. Abrir DevTools (F12)
2. Ir a Console
3. Navegar por páginas de cursos
4. ✅ No debe haber errores rojos
```

### 4.4 Verificar Firebase Console

```
1. Ir a Firestore Database
2. Verificar colección `course_enrollments`
3. ✅ No debe haber duplicados
```

✅ **Checkpoint**: Todos los tests pasan en producción

---

## 📊 PASO 5: MONITOREO POST-DESPLIEGUE

### 5.1 Configurar alertas (Opcional)

```powershell
# Ver logs en tiempo real
firebase functions:log --only course-related-functions
```

### 5.2 Monitorear métricas

1. Firebase Console → Analytics
2. Verificar:
   - Errores de aplicación
   - Tiempo de respuesta
   - Uso de Firestore

### 5.3 Revisar logs de errores

```
Firebase Console → Firestore → Logs
- Buscar errores relacionados con cursos
- Verificar que no hay "index required" errors
```

---

## 🔄 PASO 6: ROLLBACK (Si es necesario)

### Si algo sale mal:

#### 6.1 Rollback de Hosting

```powershell
# Ver versiones anteriores
firebase hosting:channel:list

# Rollback a versión anterior
firebase hosting:rollback
```

#### 6.2 Rollback de Índices

```powershell
# Restaurar firestore.indexes.json anterior
git checkout HEAD~1 firestore.indexes.json

# Redesplegar
firebase deploy --only firestore:indexes
```

#### 6.3 Rollback de Código

```powershell
# Ver commits recientes
git log --oneline -5

# Rollback a commit anterior
git revert <commit-hash>

# Redesplegar
npm run build
firebase deploy
```

---

## ✅ CHECKLIST FINAL DE DESPLIEGUE

Antes de considerar el despliegue completo:

- [ ] Código compilado sin errores
- [ ] Índices desplegados en Firebase
- [ ] Aplicación desplegada en Hosting
- [ ] Tests de validación pasados
- [ ] Tests de duplicados pasados
- [ ] Emails de confirmación funcionando
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en Firebase Console
- [ ] Documentación actualizada
- [ ] Equipo notificado del despliegue

---

## 📞 SOPORTE Y TROUBLESHOOTING

### Problema: "Firebase CLI not found"
```powershell
npm install -g firebase-tools
```

### Problema: "Permission denied"
```powershell
firebase login --reauth
```

### Problema: "Index already exists"
```
Esto es normal. Firebase detecta que el índice ya existe.
Continuar con el despliegue.
```

### Problema: "Build failed"
```powershell
# Limpiar node_modules
Remove-Item -Recurse -Force node_modules
npm install

# Reintentar build
npm run build
```

### Problema: "Deployment failed"
```powershell
# Ver logs detallados
firebase deploy --debug

# Verificar cuota de Firebase
# Firebase Console → Usage and billing
```

---

## 📝 NOTAS IMPORTANTES

### Tiempo de Propagación
- **Índices**: 5-10 minutos
- **Hosting**: 1-2 minutos
- **Functions**: 2-5 minutos

### Backup Recomendado
Antes de desplegar, hacer backup de:
- Firestore data (exportar colecciones críticas)
- Configuración actual de Firebase
- Código en Git (commit + push)

### Horario Recomendado
- Desplegar en horario de bajo tráfico
- Evitar viernes/fines de semana
- Tener equipo disponible para monitoreo

---

## 🎉 DESPLIEGUE EXITOSO

Si llegaste aquí y todos los checks están ✅:

**¡FELICIDADES! Las correcciones están en producción.**

Próximos pasos:
1. Monitorear por 24-48 horas
2. Recopilar feedback de usuarios
3. Documentar cualquier issue
4. Planificar Fase 2 de mejoras

---

**Última actualización**: 15 de Enero, 2026  
**Versión**: 1.0.0  
**Responsable**: Kiro AI Assistant
