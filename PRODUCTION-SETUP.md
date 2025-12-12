# Configuración Completa para Producción - D'Galú

## 🚀 Sistema Completamente Real y Funcional

### 1. Cloud Functions (Envío de Emails Real)

#### A. Configurar SendGrid
1. **Crear cuenta en SendGrid**: https://sendgrid.com/
2. **Obtener API Key**: Settings → API Keys → Create API Key
3. **Verificar dominio**: Settings → Sender Authentication

#### B. Configurar Firebase Functions
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Inicializar proyecto
firebase login
firebase init functions

# Configurar variables de entorno
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set email.from="noreply@dgalu.com"
firebase functions:config:set email.from_name="D'Galú Salón"

# Desplegar functions
cd functions
npm install
cd ..
firebase deploy --only functions
```

#### C. Verificar Functions Desplegadas
- `sendBookingConfirmation` - Envía emails de confirmación
- `createBooking` - Crea reserva y envía email automáticamente
- `sendBookingReminders` - Recordatorios automáticos (cron diario)
- `updateBookingStatus` - Notifica cambios de estado

### 2. Firestore Database (Datos Reales)

#### A. Aplicar Reglas de Seguridad
```bash
firebase deploy --only firestore:rules
```

#### B. Crear Índices
```bash
firebase deploy --only firestore:indexes
```

#### C. Estructura de Datos Requerida

**Servicios** (`/services/{serviceId}`):
```json
{
  "name": "Manicura y Pedicura",
  "description": "Servicios completos de cuidado de uñas",
  "category": "uñas",
  "basePrice": 25,
  "duration": 60,
  "isActive": true,
  "image": "https://...",
  "subservices": [
    {
      "id": "sub-1",
      "name": "Manicura básica",
      "description": "Limado, cutícula y esmaltado",
      "price": 15,
      "duration": 20
    }
  ],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Reservas** (`/bookings/{bookingId}`):
```json
{
  "services": [
    {
      "serviceId": "service-1",
      "serviceName": "Manicura",
      "subserviceName": "Manicura básica",
      "price": 15,
      "duration": 20
    }
  ],
  "date": "2024-01-15",
  "time": "10:00",
  "totalDuration": 40,
  "totalPrice": 35,
  "customerName": "María García",
  "customerEmail": "maria@email.com",
  "customerPhone": "+1234567890",
  "notes": "Primera cita",
  "status": "pending",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Usuarios** (`/users/{userId}`):
```json
{
  "email": "usuario@email.com",
  "displayName": "Nombre Usuario",
  "role": "customer",
  "phone": "+1234567890",
  "photoURL": "https://...",
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 3. Autenticación (Google Auth)

#### A. Configurar Google Auth
1. **Firebase Console** → Authentication → Sign-in method
2. **Habilitar Google** como proveedor
3. **Configurar OAuth consent screen** en Google Cloud Console
4. **Agregar dominios autorizados**

#### B. Configurar Dominios
- Desarrollo: `localhost:5173`
- Producción: `tu-dominio.com`

### 4. Storage (Imágenes Reales)

#### A. Aplicar Reglas
```bash
firebase deploy --only storage
```

#### B. Estructura de Carpetas
```
/services/{serviceId}/image.jpg
/products/{productId}/image.jpg
/gallery/{imageId}.jpg
/avatars/{userId}/profile.jpg
/course-materials/{courseId}/material.pdf
```

### 5. Hosting (Despliegue)

#### A. Build y Deploy
```bash
# Build del proyecto
npm run build

# Deploy completo
firebase deploy

# Deploy específico
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore
```

#### B. Configurar Dominio Personalizado
1. **Firebase Console** → Hosting
2. **Add custom domain**
3. **Configurar DNS** según instrucciones

### 6. Notificaciones WhatsApp (Opcional)

#### A. Configurar Twilio
1. **Crear cuenta Twilio**: https://twilio.com/
2. **Configurar WhatsApp Business**: Console → Messaging → WhatsApp
3. **Obtener credenciales**:
   ```bash
   firebase functions:config:set twilio.account_sid="YOUR_SID"
   firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
   firebase functions:config:set twilio.whatsapp_from="whatsapp:+14155238886"
   ```

#### B. Agregar Function para WhatsApp
```typescript
// En functions/src/index.ts
export const sendWhatsAppNotification = functions.https.onCall(async (data) => {
  const client = twilio(twilioSid, twilioToken);
  
  await client.messages.create({
    from: 'whatsapp:+14155238886',
    to: `whatsapp:${data.phone}`,
    body: data.message
  });
});
```

### 7. Monitoreo y Analytics

#### A. Firebase Analytics
```javascript
// En src/main.jsx
import { getAnalytics } from 'firebase/analytics';
const analytics = getAnalytics(app);
```

#### B. Error Reporting
```javascript
// En src/utils/ErrorHandler.js
import { getFunctions, httpsCallable } from 'firebase/functions';

const logError = httpsCallable(getFunctions(), 'logError');
await logError({ error: error.message, context: 'booking' });
```

### 8. Variables de Entorno

#### A. Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### B. Functions (.env)
```env
SENDGRID_API_KEY=your_sendgrid_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
FROM_EMAIL=noreply@dgalu.com
ADMIN_EMAILS=admin@dgalu.com,manager@dgalu.com
```

### 9. Testing

#### A. Emuladores Locales
```bash
firebase emulators:start
```

#### B. Testing de Functions
```bash
cd functions
npm test
```

### 10. Backup y Seguridad

#### A. Backup Automático
```bash
# Configurar backup diario
firebase functions:config:set backup.enabled=true
```

#### B. Reglas de Seguridad
- ✅ Autenticación requerida para todas las operaciones
- ✅ Validación de datos en Firestore rules
- ✅ Permisos granulares por rol
- ✅ Rate limiting en Functions

## 🎯 Resultado Final

### Funcionalidades Completamente Operativas:
- ✅ **Reservas reales** guardadas en Firestore
- ✅ **Emails automáticos** con SendGrid
- ✅ **Disponibilidad real** basada en reservas existentes
- ✅ **Autenticación Google** funcional
- ✅ **Panel administrativo** con datos reales
- ✅ **Notificaciones** para administradores
- ✅ **Recordatorios automáticos** programados
- ✅ **Subida de imágenes** a Firebase Storage
- ✅ **Seguridad completa** con reglas granulares

### Flujo Completo Real:
1. **Usuario** hace reserva → Datos guardados en Firestore
2. **Email automático** enviado vía SendGrid
3. **Administradores** notificados en tiempo real
4. **Disponibilidad** actualizada automáticamente
5. **Recordatorios** enviados 24h antes
6. **Panel admin** para gestionar todas las citas

## 🚀 Comandos de Despliegue

```bash
# Despliegue completo
firebase deploy

# Solo functions
firebase deploy --only functions

# Solo hosting
firebase deploy --only hosting

# Solo reglas
firebase deploy --only firestore:rules,storage
```

**El sistema D'Galú estará completamente funcional en producción con todas las integraciones reales.**