# Migración a TypeScript - D'Galú

## Estado Actual

### ✅ Archivos Migrados a TypeScript

1. **functions/src/index.ts** - Cloud Functions (ya estaba en TS)
2. **functions/src/emailTemplates.ts** - Templates de email
3. **src/context/AuthContext.tsx** - Contexto de autenticación
4. **src/hooks/useCustomClaims.ts** - Hook para custom claims
5. **src/services/bookingService.ts** - Servicio de reservas

### 📋 Próximos Archivos a Migrar (Prioridad)

#### Alta Prioridad
- [ ] `src/components/common/ProtectedRoute.jsx` → `.tsx`
- [ ] `src/hooks/useUserProfile.js` → `.ts`
- [ ] `src/hooks/useUserPermissions.js` → `.ts`
- [ ] `src/utils/rolePermissions.js` → `.ts`
- [ ] `src/utils/ErrorHandler.js` → `.ts`

#### Media Prioridad
- [ ] `src/components/layout/Navbar.jsx` → `.tsx`
- [ ] `src/components/layout/Footer.jsx` → `.tsx`
- [ ] `src/components/common/LoadingSpinner.jsx` → `.tsx`
- [ ] `src/components/common/ErrorBoundary.jsx` → `.tsx`

#### Baja Prioridad
- [ ] `src/pages/Home.jsx` → `.tsx`
- [ ] `src/pages/Login.jsx` → `.tsx`
- [ ] `src/pages/Booking.jsx` → `.tsx`
- [ ] Otros componentes de páginas

## Configuración TypeScript

### 1. Instalar Dependencias

```bash
npm install --save-dev typescript @types/react @types/react-dom
```

### 2. Crear tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3. Actualizar Vite Config

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

## Estrategia de Migración

### Fase 1: Infraestructura (✅ Completada)
- [x] Cloud Functions
- [x] Servicios principales
- [x] Hooks críticos
- [x] Contextos principales

### Fase 2: Componentes Core (En progreso)
- [ ] Componentes de autenticación
- [ ] Componentes de layout
- [ ] Componentes comunes

### Fase 3: Páginas y Features
- [ ] Páginas principales
- [ ] Componentes específicos de features
- [ ] Formularios complejos

### Fase 4: Refinamiento
- [ ] Tipos más específicos
- [ ] Interfaces compartidas
- [ ] Optimizaciones de tipos

## Beneficios Esperados

### 🚀 Desarrollo
- **Autocompletado mejorado**: IntelliSense más preciso
- **Detección temprana de errores**: Errores de tipo en tiempo de compilación
- **Refactoring seguro**: Cambios con confianza
- **Documentación viva**: Los tipos sirven como documentación

### 🛡️ Calidad
- **Menos bugs en producción**: Validación de tipos previene errores runtime
- **Código más mantenible**: Interfaces claras entre componentes
- **Mejor colaboración**: Contratos de API explícitos

### 📈 Escalabilidad
- **Codebase más robusta**: Estructura más sólida para crecimiento
- **Onboarding más fácil**: Nuevos desarrolladores entienden el código más rápido
- **Testing mejorado**: Tipos ayudan a escribir tests más efectivos

## Comandos Útiles

```bash
# Verificar tipos sin compilar
npx tsc --noEmit

# Migrar archivo específico
# 1. Renombrar .jsx a .tsx
# 2. Agregar tipos gradualmente
# 3. Verificar con tsc

# Verificar todo el proyecto
npm run type-check
```

## Notas de Migración

### Patrones Comunes

#### Props de Componentes
```typescript
interface ComponentProps {
  title: string;
  optional?: boolean;
  children: React.ReactNode;
}

const Component: React.FC<ComponentProps> = ({ title, optional = false, children }) => {
  // ...
}
```

#### Hooks Personalizados
```typescript
interface UseHookReturn {
  data: DataType | null;
  loading: boolean;
  error: string | null;
}

const useCustomHook = (): UseHookReturn => {
  // ...
}
```

#### Event Handlers
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // ...
}

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // ...
}
```

### Archivos de Tipos Compartidos

Crear `src/types/` para interfaces compartidas:
- `src/types/user.ts` - Tipos de usuario
- `src/types/booking.ts` - Tipos de reservas
- `src/types/api.ts` - Tipos de API
- `src/types/common.ts` - Tipos comunes

## Estado de Migración

**Progreso actual: 30%**
- ✅ Backend (Cloud Functions)
- ✅ Servicios principales
- ✅ Contexto de autenticación
- 🔄 Hooks y utilidades
- ⏳ Componentes
- ⏳ Páginas