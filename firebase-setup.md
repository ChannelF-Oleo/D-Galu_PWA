# Configuración de Firebase para D'Galú

## 1. Reglas de Firestore

Para aplicar las reglas de Firestore:

1. Ve a la consola de Firebase: https://console.firebase.google.com
2. Selecciona tu proyecto D'Galú
3. Ve a "Firestore Database" → "Reglas"
4. Copia y pega el contenido del archivo `firestore.rules`
5. Haz clic en "Publicar"

## 2. Reglas de Storage

Para aplicar las reglas de Storage:

1. En la consola de Firebase, ve a "Storage" → "Reglas"
2. Copia y pega el contenido del archivo `storage.rules`
3. Haz clic en "Publicar"

## 3. Autenticación con Google

Para habilitar Google Auth:

1. Ve a "Authentication" → "Sign-in method"
2. Habilita "Google" como proveedor
3. Configura el nombre del proyecto y email de soporte
4. Guarda los cambios

## 4. Índices de Firestore

Crea estos índices compuestos en Firestore:

### Para servicios:
- Colección: `services`
- Campos: `isActive` (Ascending), `name` (Ascending)

### Para reservas:
- Colección: `bookings`
- Campos: `userId` (Ascending), `date` (Descending)
- Campos: `date` (Ascending), `time` (Ascending)

### Para productos:
- Colección: `products`
- Campos: `isActive` (Ascending), `category` (Ascending), `name` (Ascending)

## 5. Estructura de datos recomendada

### Usuarios (/users/{userId})
```json
{
  "email": "usuario@email.com",
  "displayName": "Nombre Usuario",
  "role": "customer", // admin, manager, staff, customer, student
  "phone": "+1234567890",
  "photoURL": "https://...",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "isActive": true
}
```

### Servicios (/services/{serviceId})
```json
{
  "name": "Manicura",
  "description": "Servicio de manicura profesional",
  "category": "uñas",
  "basePrice": 25.00,
  "duration": 60,
  "image": "https://...",
  "isActive": true,
  "subservices": [
    {
      "id": "sub1",
      "name": "Manicura básica",
      "description": "Manicura tradicional",
      "price": 20.00,
      "duration": 20
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Reservas (/bookings/{bookingId})
```json
{
  "userId": "user123",
  "services": [
    {
      "serviceId": "service123",
      "serviceName": "Manicura",
      "subserviceName": "Manicura básica",
      "price": 20.00,
      "duration": 20
    }
  ],
  "date": "2024-01-15",
  "time": "10:00",
  "totalPrice": 45.00,
  "totalDuration": 40,
  "customerName": "María García",
  "customerEmail": "maria@email.com",
  "customerPhone": "+1234567890",
  "notes": "Notas adicionales",
  "status": "pending", // pending, confirmed, completed, cancelled
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## 6. Comandos Firebase CLI (opcional)

Si tienes Firebase CLI instalado:

```bash
# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar reglas de Storage
firebase deploy --only storage

# Desplegar todo
firebase deploy
```

## 7. Variables de entorno

Asegúrate de que tu archivo `.env` tenga todas las variables necesarias:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

## 8. Datos de prueba

Para probar el sistema, puedes crear algunos servicios de ejemplo en Firestore:

1. Ve a Firestore Database
2. Crea la colección "services"
3. Agrega documentos con la estructura mostrada arriba
4. Asegúrate de que `isActive: true` para que aparezcan en la app

## Notas importantes:

- Las reglas están configuradas para requerir autenticación en todas las operaciones
- Los roles se validan desde la colección `users`
- Los archivos de imagen tienen un límite de 5MB
- Los PDFs tienen un límite de 10MB
- Solo los administradores pueden gestionar usuarios y cursos
- Los managers pueden gestionar servicios y productos
- El staff puede gestionar reservas y galería