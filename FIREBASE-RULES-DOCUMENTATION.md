# Firebase Security Rules Documentation

## Overview

This document explains the comprehensive Firebase Security Rules implemented for the D'Galú Salon application, covering both Firestore Database and Cloud Storage.

## 🔐 Security Principles

### 1. **Principle of Least Privilege**
- Users only have access to resources they absolutely need
- Default deny for all undefined paths
- Explicit permissions for each collection/folder

### 2. **Role-Based Access Control (RBAC)**
- **Admin**: Full system access
- **Manager**: Business operations (services, products, bookings)
- **Staff**: Day-to-day operations (bookings, gallery)
- **Customer**: Personal data and bookings
- **Student**: Course access and enrollments

### 3. **Data Validation**
- Required fields validation for all document types
- Type checking for critical fields (prices, quantities, etc.)
- Size limits for file uploads
- Content type validation for media files

## 📊 Firestore Rules Breakdown

### Collections Overview

| Collection | Public Read | Customer | Staff | Manager | Admin |
|------------|-------------|----------|-------|---------|-------|
| `users` | ❌ | Own profile | All profiles | All profiles | Full access |
| `services` | Active only | Active only | All | Full CRUD | Full CRUD |
| `products` | Active only | Active only | All | Full CRUD | Full CRUD |
| `bookings` | ❌ | Own bookings | All | Full CRUD | Full CRUD |
| `courses` | Active only | Active only | ❌ | ❌ | Full CRUD |
| `course_enrollments` | ❌ | Own enrollments | ❌ | ❌ | Full CRUD |
| `gallery` | ✅ Public | ✅ Public | Upload/Edit | Full CRUD | Full CRUD |
| `notifications` | ❌ | Role-based | Role-based | Create/Edit | Full CRUD |
| `system_logs` | ❌ | ❌ | ❌ | ❌ | Read only |

### Key Security Features

#### User Management
```javascript
// Users can only update safe fields
allow update: if isOwner(userId) && 
                 request.resource.data.diff(resource.data).affectedKeys()
                   .hasOnly(['displayName', 'phone', 'preferences', 'updatedAt'])
```

#### Booking Security
```javascript
// Customers can only create bookings for themselves
allow create: if isAuthenticated() && hasRequiredBookingFields() &&
                 (request.resource.data.userId == request.auth.uid || 
                  !('userId' in request.resource.data))
```

#### Data Validation
```javascript
function hasRequiredServiceFields() {
  return request.resource.data.keys().hasAll(['name', 'price', 'duration', 'category']) &&
         request.resource.data.price is number && request.resource.data.price >= 0 &&
         request.resource.data.duration is number && request.resource.data.duration > 0;
}
```

## 💾 Storage Rules Breakdown

### Folder Structure & Permissions

| Folder | Public Read | Upload Access | Delete Access | File Types | Size Limit |
|--------|-------------|---------------|---------------|------------|-------------|
| `/services/` | ✅ Public | Manager+ | Admin | Images | 10MB |
| `/products/` | ✅ Public | Manager+ | Admin | Images | 10MB |
| `/courses/` | Students/Admin | Admin | Admin | Images/Videos/Docs | 500MB |
| `/gallery/` | ✅ Public | Staff+ | Manager+ | Images | 10MB |
| `/users/{userId}/` | ✅ Public | Owner/Admin | Owner/Admin | Images | 10MB |
| `/bookings/` | Staff+ | Staff+ | Manager+ | Images/Docs | 50MB |
| `/temp/{userId}/` | Owner/Admin | Owner | Owner/Admin | Images/Docs | 50MB |
| `/system/` | Admin | Admin | Admin | All | No limit |

### File Type Validation

#### Images (10MB limit)
```javascript
function isValidImageFile() {
  return request.resource.contentType.matches('image/.*') &&
         request.resource.size < 10 * 1024 * 1024;
}
```

#### Documents (50MB limit)
```javascript
function isValidDocumentFile() {
  return request.resource.contentType in ['application/pdf', 'application/msword', 
                                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'] &&
         request.resource.size < 50 * 1024 * 1024;
}
```

#### Videos (500MB limit)
```javascript
function isValidVideoFile() {
  return request.resource.contentType.matches('video/.*') &&
         request.resource.size < 500 * 1024 * 1024;
}
```

## 🎯 Role-Based Access Patterns

### Admin Role
- **Full system access** to all collections and storage
- Can manage users, roles, and permissions
- Access to system logs and administrative functions
- Can delete any resource

### Manager Role
- **Business operations** focus
- Full CRUD on services and products
- Full access to bookings management
- Can upload/delete business-related media
- Cannot manage users or system settings

### Staff Role
- **Day-to-day operations** focus
- Read access to services and products
- Full booking management capabilities
- Can upload gallery images and booking documents
- Limited administrative access

### Customer Role
- **Personal data** access only
- Can view active services and products
- Can create and manage own bookings
- Can upload personal profile images
- Cannot access administrative functions

### Student Role
- **Educational content** access
- Can view and enroll in active courses
- Access to course materials and resources
- Can manage own enrollments
- Limited to academic features

## 🔧 Implementation Features

### Custom Claims Integration
```javascript
function getUserRole() {
  return request.auth.token.role != null ? request.auth.token.role : 
         firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role;
}
```

### Ownership Validation
```javascript
function isOwner(userId) {
  return isAuthenticated() && request.auth.uid == userId;
}
```

### Field-Level Security
```javascript
// Users can only update safe fields
request.resource.data.diff(resource.data).affectedKeys()
  .hasOnly(['displayName', 'phone', 'preferences', 'updatedAt'])
```

## 🚀 Deployment Commands

### Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Storage Rules
```bash
firebase deploy --only storage
```

### Deploy Both
```bash
firebase deploy --only firestore:rules,storage
```

### Test Rules Locally
```bash
firebase emulators:start --only firestore,storage
```

## 🧪 Testing Security Rules

### Firestore Rules Testing
```bash
# Test with Firebase Emulator
firebase emulators:exec --only firestore "npm test"

# Manual testing with Firebase Console
# Use the Rules Playground in Firebase Console
```

### Storage Rules Testing
```bash
# Test file uploads with different user roles
# Verify file type and size restrictions
# Check folder access permissions
```

## 📝 Maintenance Notes

### Regular Security Audits
1. **Monthly**: Review access logs for unusual patterns
2. **Quarterly**: Update role permissions based on business needs
3. **Annually**: Complete security rules review and optimization

### Performance Considerations
- Rules are evaluated on every request
- Complex nested queries may impact performance
- Use indexes for frequently queried fields
- Monitor rule evaluation metrics in Firebase Console

### Common Pitfalls to Avoid
1. **Don't use `allow read, write: if true`** - Always be specific
2. **Validate all user input** - Never trust client-side data
3. **Use custom claims** - More efficient than Firestore lookups
4. **Test edge cases** - Especially role transitions and permissions
5. **Monitor rule performance** - Complex rules can slow down requests

## 🔗 Related Documentation

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Custom Claims Documentation](https://firebase.google.com/docs/auth/admin/custom-claims)

---

**Last Updated**: December 12, 2025  
**Version**: 1.0  
**Maintainer**: Development Team