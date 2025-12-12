// Simple script to check current user role in Firebase Auth
// This will help us understand what's happening with the authentication

import { auth } from './src/config/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

console.log('🔍 Checking current user authentication...');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('✅ User is authenticated');
    console.log('📧 Email:', user.email);
    console.log('🆔 UID:', user.uid);
    console.log('✉️ Email verified:', user.emailVerified);
    
    try {
      // Get the ID token to see custom claims
      const idTokenResult = await user.getIdTokenResult();
      console.log('🎫 Custom claims:', idTokenResult.claims);
      console.log('🔑 Role from claims:', idTokenResult.claims.role);
      
      if (!idTokenResult.claims.role) {
        console.log('⚠️ No role found in custom claims!');
        console.log('💡 This is likely why storage permissions are failing.');
      } else if (idTokenResult.claims.role === 'admin') {
        console.log('✅ User has admin role in custom claims');
      } else {
        console.log('⚠️ User role is:', idTokenResult.claims.role);
      }
      
    } catch (error) {
      console.error('❌ Error getting ID token:', error);
    }
  } else {
    console.log('❌ No user is authenticated');
  }
  
  process.exit(0);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.log('⏰ Timeout - no authentication detected');
  process.exit(1);
}, 10000);