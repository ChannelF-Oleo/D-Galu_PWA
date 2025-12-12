# Configuración de Resend para D'Galú

## 1. Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com) y crea una cuenta
2. Verifica tu email
3. Ve al dashboard

## 2. Configurar dominio (Opcional pero recomendado)

1. En el dashboard, ve a "Domains"
2. Agrega tu dominio: `dgalu.com`
3. Configura los registros DNS según las instrucciones de Resend
4. Verifica el dominio

## 3. Obtener API Key

1. Ve a "API Keys" en el dashboard
2. Crea una nueva API key con permisos de "Send emails"
3. Copia la API key (empieza con `re_`)

## 4. Configurar Firebase Functions

Ejecuta este comando para configurar la API key en Firebase:

```bash
firebase functions:config:set resend.api_key="tu_api_key_aqui"
```

## 5. Configurar email "From"

Si configuraste un dominio personalizado, puedes usar:
- `noreply@dgalu.com`
- `contacto@dgalu.com`

Si no tienes dominio personalizado, usa:
- `onboarding@resend.dev` (solo para testing)

## 6. Desplegar las funciones

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## 7. Verificar configuración

Puedes probar el envío de emails usando la función de test en el dashboard de Firebase Functions.

## Ventajas de Resend vs SendGrid

✅ **Más fácil de configurar**
✅ **Mejor deliverability**
✅ **Templates más modernos**
✅ **Mejor pricing para volúmenes pequeños**
✅ **API más simple**
✅ **Soporte nativo para React/HTML moderno**

## Costos

- **Gratis**: 3,000 emails/mes
- **Pro**: $20/mes por 50,000 emails
- **Business**: $80/mes por 100,000 emails

Para D'Galú, el plan gratuito debería ser suficiente inicialmente.