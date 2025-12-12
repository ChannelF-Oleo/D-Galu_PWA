# Información sobre .gitignore

## Archivos Excluidos del Repositorio

### 🔒 Archivos Sensibles
- `.env` - Variables de entorno con claves de API
- `functions/.env` - Variables de entorno de Firebase Functions
- `*.pem`, `*.key`, `*.crt` - Certificados y claves privadas
- `secrets.json` - Archivos de configuración con datos sensibles

### 📁 Directorios de Build y Cache
- `node_modules/` - Dependencias de Node.js
- `dist/`, `build/` - Archivos compilados
- `.firebase/` - Cache de Firebase
- `.vite/`, `.cache/` - Cache de herramientas de desarrollo

### 📝 Documentación Temporal
- `DIAGNOSTICO-*.md` - Diagnósticos de desarrollo
- `SISTEMA-*.md` - Documentación de sistema interna
- `PROBLEMAS-*.md` - Registro de problemas
- `FIXES-*.md` - Registro de correcciones
- `ACCIONES-*.md` - Planes de acción internos

### 🛠️ Archivos de Desarrollo
- `setup-*.ps1`, `setup-*.sh` - Scripts de configuración
- `deploy-*.ps1`, `deploy-*.sh` - Scripts de deployment
- `sample-*.json` - Datos de prueba
- `test-*.md` - Documentación de testing

### 💻 Configuración de Editores
- `.vscode/` - Configuración de Visual Studio Code
- `.idea/` - Configuración de JetBrains IDEs
- `.kiro/` - Configuración de Kiro IDE

## Archivos Importantes que SÍ están en el Repo

### ✅ Configuración Esencial
- `.env.example` - Plantilla de variables de entorno
- `firebase.json` - Configuración de Firebase
- `firestore.rules` - Reglas de seguridad de Firestore
- `firestore.indexes.json` - Índices de Firestore
- `storage.rules` - Reglas de Firebase Storage

### ✅ Código Fuente
- `src/` - Todo el código fuente de la aplicación
- `functions/` - Código de Firebase Functions (sin node_modules)
- `public/` - Archivos públicos estáticos

### ✅ Configuración del Proyecto
- `package.json` - Dependencias y scripts
- `vite.config.js` - Configuración de Vite
- `tailwind.config.js` - Configuración de Tailwind CSS
- `eslint.config.js` - Configuración de ESLint

## Comandos Útiles

### Verificar archivos ignorados
```bash
git status --ignored
```

### Ver archivos trackeados que coinciden con .gitignore
```bash
git ls-files -i --exclude-standard
```

### Remover archivo del tracking pero mantenerlo localmente
```bash
git rm --cached <archivo>
```

### Agregar excepción a .gitignore
```bash
# En .gitignore, usar ! para excepciones
!archivo-importante.json
```

## Notas Importantes

1. **Variables de Entorno**: Siempre usar `.env.example` como plantilla
2. **Archivos Sensibles**: Nunca commitear claves de API o credenciales
3. **Documentación**: La documentación pública va en `README.md`, la interna se ignora
4. **Build Files**: Los archivos compilados se generan automáticamente
5. **Cache**: Los archivos de cache se regeneran automáticamente

## Estructura Recomendada

```
proyecto/
├── .env.example          ✅ (plantilla)
├── .env                  ❌ (ignorado)
├── README.md             ✅ (documentación pública)
├── SISTEMA-*.md          ❌ (documentación interna)
├── src/                  ✅ (código fuente)
├── functions/
│   ├── src/              ✅ (código functions)
│   ├── .env              ❌ (ignorado)
│   └── node_modules/     ❌ (ignorado)
└── node_modules/         ❌ (ignorado)
```