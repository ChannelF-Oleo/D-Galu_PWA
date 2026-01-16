# ✅ CHECKLIST DE VERIFICACIÓN - SISTEMA DE CURSOS

**Fecha**: 15 de Enero, 2026  
**Objetivo**: Verificar que todas las correcciones funcionan correctamente

---

## 🔍 VERIFICACIONES MANUALES

### 1. Validación en CourseModal

#### Test 1.1: Título inválido
- [ ] Abrir panel admin → Academy → Crear Curso
- [ ] Intentar guardar con título vacío
- [ ] **Esperado**: Error "El título debe tener al menos 3 caracteres"

#### Test 1.2: Descripción inválida
- [ ] Escribir descripción con menos de 10 caracteres
- [ ] Intentar guardar
- [ ] **Esperado**: Error "La descripción debe tener al menos 10 caracteres"

#### Test 1.3: Precio negativo
- [ ] Escribir precio negativo (ej: -100)
- [ ] Intentar guardar
- [ ] **Esperado**: Error "El precio debe ser mayor o igual a 0"

#### Test 1.4: Capacidad inválida
- [ ] Escribir capacidad 0 o negativa
- [ ] Intentar guardar
- [ ] **Esperado**: Error "La capacidad debe ser al menos 1"

#### Test 1.5: Curso válido
- [ ] Llenar todos los campos correctamente
- [ ] Guardar curso
- [ ] **Esperado**: Curso guardado exitosamente sin errores

---

### 2. Verificación de Duplicados en CourseDetail

#### Test 2.1: Primera inscripción
- [ ] Ir a `/academy` (lista de cursos)
- [ ] Hacer clic en un curso
- [ ] Hacer clic en "Inscribirse Ahora"
- [ ] **Esperado**: Mensaje "¡Inscripción exitosa!" + email de confirmación

#### Test 2.2: Inscripción duplicada
- [ ] En el mismo curso, hacer clic en "Inscribirse Ahora" de nuevo
- [ ] **Esperado**: Botón muestra "Inscrito" y está deshabilitado

#### Test 2.3: Verificación en Firebase
- [ ] Abrir Firebase Console → Firestore → `course_enrollments`
- [ ] Buscar inscripciones del usuario
- [ ] **Esperado**: Solo 1 inscripción por curso por usuario

---

### 3. Validación en StudentModal

#### Test 3.1: Nombre inválido
- [ ] Abrir panel admin → Academy → Registrar Estudiante
- [ ] Escribir nombre con 1 carácter
- [ ] Intentar guardar
- [ ] **Esperado**: Error "El nombre debe tener al menos 2 caracteres"

#### Test 3.2: Email inválido
- [ ] Escribir email sin @ (ej: "usuario.com")
- [ ] Intentar guardar
- [ ] **Esperado**: Error "Email inválido"

#### Test 3.3: Sin curso seleccionado
- [ ] Dejar dropdown de curso en "Seleccionar..."
- [ ] Intentar guardar
- [ ] **Esperado**: Error "Debes seleccionar un curso"

#### Test 3.4: Estudiante válido
- [ ] Llenar todos los campos correctamente
- [ ] Guardar estudiante
- [ ] **Esperado**: Estudiante guardado exitosamente

---

### 4. Índices de Firestore

#### Test 4.1: Desplegar índices
```powershell
# Ejecutar en terminal
.\deploy-firestore-indexes.ps1
```
- [ ] Script ejecutado sin errores
- [ ] **Esperado**: Mensaje "✅ ÍNDICES DESPLEGADOS EXITOSAMENTE"

#### Test 4.2: Verificar en Firebase Console
- [ ] Ir a Firebase Console → Firestore → Índices
- [ ] Buscar índices de `courses`
- [ ] **Esperado**: 3 índices para `courses`
- [ ] Buscar índices de `course_enrollments`
- [ ] **Esperado**: 2 índices para `course_enrollments`

#### Test 4.3: Estado de índices
- [ ] Verificar que todos los índices estén en estado "Enabled"
- [ ] **Esperado**: Ningún índice en "Building" o "Error"

---

### 5. Manejo de Errores

#### Test 5.1: Error de red simulado
- [ ] Abrir DevTools → Network → Offline
- [ ] Intentar crear un curso
- [ ] **Esperado**: Mensaje de error visible al usuario

#### Test 5.2: Error de Firebase
- [ ] Intentar inscribirse sin estar autenticado
- [ ] **Esperado**: Redirección a `/login`

#### Test 5.3: Email de confirmación
- [ ] Inscribirse en un curso
- [ ] Revisar email
- [ ] **Esperado**: Email recibido con detalles del curso

---

## 🔧 VERIFICACIONES TÉCNICAS

### 6. Sintaxis y Compilación

```powershell
# Verificar que no hay errores de sintaxis
npm run lint

# Compilar proyecto
npm run build
```

- [ ] Sin errores de lint
- [ ] Compilación exitosa
- [ ] **Esperado**: Build generado en `/dist`

---

### 7. Consola del Navegador

#### Test 7.1: Sin errores en consola
- [ ] Abrir DevTools → Console
- [ ] Navegar por todas las páginas de cursos
- [ ] **Esperado**: Sin errores rojos en consola

#### Test 7.2: Logs informativos
- [ ] Inscribirse en un curso
- [ ] Revisar consola
- [ ] **Esperado**: Logs como "Enrollment created successfully"

---

### 8. Firebase Console

#### Test 8.1: Estructura de datos
- [ ] Abrir Firestore → `courses`
- [ ] Verificar que todos los cursos tienen campo `title`
- [ ] Verificar que todos tienen `isActive`
- [ ] **Esperado**: Estructura consistente

#### Test 8.2: Enrollments
- [ ] Abrir Firestore → `course_enrollments`
- [ ] Verificar campos: `courseId`, `userId`, `enrolledAt`, `status`
- [ ] **Esperado**: Todos los enrollments tienen campos requeridos

---

## 📊 RESUMEN DE VERIFICACIÓN

### Resultados Esperados

| Categoría | Tests | Pasados | Estado |
|-----------|-------|---------|--------|
| Validación CourseModal | 5 | ___ / 5 | ⏳ |
| Verificación Duplicados | 3 | ___ / 3 | ⏳ |
| Validación StudentModal | 4 | ___ / 4 | ⏳ |
| Índices Firestore | 3 | ___ / 3 | ⏳ |
| Manejo de Errores | 3 | ___ / 3 | ⏳ |
| Verificaciones Técnicas | 2 | ___ / 2 | ⏳ |
| Consola Navegador | 2 | ___ / 2 | ⏳ |
| Firebase Console | 2 | ___ / 2 | ⏳ |
| **TOTAL** | **24** | **___ / 24** | ⏳ |

---

## ✅ CRITERIOS DE APROBACIÓN

Para considerar las correcciones exitosas:

- [ ] **Mínimo 22/24 tests pasados** (92%)
- [ ] **Todos los tests críticos pasados** (duplicados, validación)
- [ ] **Sin errores en consola del navegador**
- [ ] **Índices desplegados y activos en Firebase**
- [ ] **Build de producción exitoso**

---

## 🚨 SI ALGO FALLA

### Problema: Validación no funciona
**Solución**: Verificar que los archivos modificados estén guardados y el servidor reiniciado

### Problema: Duplicados aún ocurren
**Solución**: Verificar que el índice de `course_enrollments` esté activo en Firebase

### Problema: Errores no se muestran
**Solución**: Verificar que el estado `errors` esté correctamente implementado

### Problema: Índices no se despliegan
**Solución**: 
```powershell
# Verificar autenticación
firebase login

# Verificar proyecto
firebase use --add

# Desplegar manualmente
firebase deploy --only firestore:indexes
```

---

## 📝 NOTAS

- Completar este checklist antes de pasar a Fase 2
- Documentar cualquier test que falle
- Si encuentras bugs adicionales, reportarlos en un nuevo documento
- Guardar capturas de pantalla de tests exitosos

---

**Última actualización**: 15 de Enero, 2026  
**Versión**: 1.0.0
