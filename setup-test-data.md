# Configuración de Datos de Prueba

## Problema Actual
Los servicios no se están mostrando porque:
1. No hay datos en Firebase Firestore
2. Las reglas de Firebase pueden estar bloqueando el acceso
3. La query con filtros puede estar fallando

## Solución Rápida

### 1. Aplicar Reglas Simples (TEMPORAL)
En la consola de Firebase:
1. Ve a Firestore Database → Reglas
2. Reemplaza las reglas con el contenido de `firestore-simple.rules`
3. Publica las reglas

### 2. Agregar Datos de Prueba

#### A. Servicios
En la consola de Firebase:
1. Ve a Firestore Database
2. Crea la colección "services"
3. Agrega los documentos del archivo `sample-data.json`

**Forma rápida:**
Para cada servicio en `sample-data.json`:
1. Clic en "Agregar documento"
2. ID del documento: usar el "id" del JSON (ej: "service-1")
3. Copiar todos los campos excepto "id"

#### B. Reservas (Opcional - para testing de disponibilidad)
1. Crea la colección "bookings"
2. Agrega los documentos del archivo `sample-bookings.json`
3. Usar los IDs: "booking-1", "booking-2", "booking-3"

**Nota**: Si no agregas reservas, el sistema funcionará igual pero no mostrará slots ocupados.

### 3. Verificar Funcionamiento
1. Abrir la app en el navegador
2. Verificar que aparezca "Firebase Test Results" en el Home
3. Debe mostrar los servicios cargados
4. Probar navegación a detalles de servicios
5. Probar selección de servicios en Booking

### 4. Estructura de Documento de Servicio
```
services/service-1
{
  name: "Manicura y Pedicura",
  description: "Servicios completos de cuidado de uñas",
  category: "uñas",
  basePrice: 25,
  duration: 60,
  isActive: true,
  image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
  subservices: [
    {
      id: "sub-1-1",
      name: "Manicura básica",
      description: "Limado, cutícula y esmaltado",
      price: 15,
      duration: 20
    },
    // ... más subservicios
  ]
}
```

## Debugging
Si los problemas persisten:

1. **Abrir DevTools del navegador**
2. **Ver Console** - debe mostrar logs de:
   - "Fetching services from Firebase..."
   - "Service found: [id] [data]"
   - "Total services loaded: [number]"

3. **Si no hay logs o hay errores:**
   - Verificar configuración de Firebase en `.env`
   - Verificar que las reglas permitan lectura
   - Verificar que existan documentos en la colección "services"

## Después de Probar
Una vez que funcione:
1. Remover el componente `FirebaseTest` del Home
2. Aplicar las reglas de seguridad completas (`firestore.rules`)
3. Agregar el filtro `isActive: true` de vuelta en las queries