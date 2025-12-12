// Script para corregir permisos de administrador
// Ejecutar con: node fix-admin-permissions.mjs

import admin from 'firebase-admin';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

async function fixAdminPermissions() {
  try {
    console.log('🔧 Corrigiendo permisos de administrador...');
    
    // UID del usuario admin (del log de consola)
    const adminUid = 'gNPraTjK1eQWr4D1q9rHZ1jINwk1';
    const adminEmail = 'channelf.oleo@gmail.com';
    
    console.log(`👤 Procesando usuario: ${adminEmail} (${adminUid})`);
    
    // 1. Actualizar custom claims
    console.log('📝 Actualizando custom claims...');
    await admin.auth().setCustomUserClaims(adminUid, {
      role: 'admin',
      permissions: {
        canBook: true,
        canViewBookings: true,
        canCancelBookings: true,
        canManageUsers: true,
        canManageServices: true,
        canManageProducts: true,
        canViewReports: true,
        canManageSystem: true
      },
      lastUpdated: Date.now()
    });
    
    // 2. Verificar que el documento del usuario existe en Firestore
    console.log('📄 Verificando documento de usuario en Firestore...');
    const userRef = admin.firestore().collection('users').doc(adminUid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log('➕ Creando documento de usuario...');
      await userRef.set({
        uid: adminUid,
        email: adminEmail,
        displayName: 'Channel',
        role: 'admin',
        permissions: {
          canBook: true,
          canViewBookings: true,
          canCancelBookings: true,
          canManageUsers: true,
          canManageServices: true,
          canManageProducts: true,
          canViewReports: true,
          canManageSystem: true
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        preferences: {
          notifications: {
            email: true,
            sms: false,
            reminders: true
          },
          language: 'es'
        }
      });
    } else {
      console.log('🔄 Actualizando documento de usuario existente...');
      await userRef.update({
        role: 'admin',
        permissions: {
          canBook: true,
          canViewBookings: true,
          canCancelBookings: true,
          canManageUsers: true,
          canManageServices: true,
          canManageProducts: true,
          canViewReports: true,
          canManageSystem: true
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // 3. Verificar los custom claims
    console.log('🔍 Verificando custom claims...');
    const userRecord = await admin.auth().getUser(adminUid);
    console.log('Custom Claims:', userRecord.customClaims);
    
    console.log('✅ ¡Permisos de administrador corregidos exitosamente!');
    console.log('');
    console.log('📋 Resumen:');
    console.log('- Custom claims actualizados ✅');
    console.log('- Documento de usuario verificado/actualizado ✅');
    console.log('');
    console.log('🔄 Por favor, cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto.');
    
  } catch (error) {
    console.error('❌ Error al corregir permisos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
fixAdminPermissions()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });