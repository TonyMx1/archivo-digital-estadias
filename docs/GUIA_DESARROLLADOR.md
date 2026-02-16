# Guía para Desarrolladores - Sistema de Archivo Digital

## Introducción

Esta guía está diseñada para nuevos desarrolladores que se unen al proyecto del Sistema de Archivo Digital del Municipio de San Juan del Río. Aquí encontrarás todo lo necesario para configurar tu entorno de desarrollo y entender la arquitectura del sistema.

## Prerrequisitos

### Software Requerido

- **Node.js**: Versión 18 o superior
- **PostgreSQL**: Versión 14 o superior
- **Git**: Para control de versiones
- **VS Code**: Recomendado (con extensiones específicas)

### Extensiones VS Code Recomendadas

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## Configuración Inicial

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd archivo-digital
```

### 2. Instalar Dependencias

```bash
npm install
# o si usas yarn
yarn install
```

### 3. Configurar Variables de Entorno

Crea el archivo `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=archivo_digital_dev
DB_USER=postgres
DB_PASSWORD=tu_password
DB_SSL=false

# JWT
JWT_SECRET=genera-un-secret-unico-aqui

# API CUS (opcional para desarrollo)
CUS_API_URL=https://sanjuandelrio.gob.mx/tramites-sjr/Api/principal/login
```

### 4. Configurar Base de Datos

```bash
# Crear base de datos
createdb archivo_digital_dev

# Ejecutar migraciones (si existen)
npm run migrate
```

### 5. Iniciar Desarrollo

```bash
npm run dev
```

Visita http://localhost:3000

---

## Estructura del Código

### Convenciones de Nomenclatura

- **Componentes**: PascalCase (`DocumentosModal.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useDocumentos.ts`)
- **API Routes**: kebab-case (`/api/documentos/search`)
- **Variables**: camelCase
- **Constantes**: UPPER_SNAKE_CASE (`PERMISOS_USUARIO`)

### Organización de Archivos

```
src/
├── app/                    # Next.js App Router
│   ├── (routes)/          # Rutas agrupadas
│   ├── api/               # API Routes
│   └── globals/           # Configuración global
├── components/            # Componentes UI
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── forms/            # Formularios
│   ├── modals/           # Componentes modales
│   └── layout/           # Componentes de layout
├── hooks/                # Hooks personalizados
├── lib/                  # Utilidades y configuración
├── types/                # Definiciones TypeScript
└── utils/                # Funciones helper
```

---

## Flujo de Trabajo de Desarrollo

### 1. Crear Nueva Feature

```bash
# Crear branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# Desarrollar cambios
# ...

# Commits descriptivos
git add .
git commit -m "feat: agregar búsqueda avanzada de documentos"

# Push y crear PR
git push origin feature/nueva-funcionalidad
```

### 2. Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Documentación
- `style`: Formato/código style
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Tareas de mantenimiento

Ejemplos:
```bash
feat(auth): agregar sistema de roles granular
fix(ocr): resolver timeout en procesamiento de PDFs grandes
docs(api): actualizar documentación de endpoints
```

### 3. Code Review Process

1. **Self-review**: Revisa tu propio código
2. **PR Creation**: Crea Pull Request con descripción clara
3. **Peer Review**: Al menos otro desarrollador debe revisar
4. **Testing**: Verificar que no rompe funcionalidad existente
5. **Merge**: A develop después de aprobación

---

## Arquitectura Técnica

### Frontend Architecture

#### Component Structure

```typescript
// Componente típico
interface ComponentProps {
  // Props tipadas
}

export function ComponentName({ prop }: ComponentProps) {
  // Hooks al inicio
  const [state, setState] = useState();
  const { data, loading } = useCustomHook();
  
  // Event handlers
  const handleClick = useCallback(() => {
    // Lógica
  }, []);
  
  // Render
  return (
    <div className="estilos-tailwind">
      {/* JSX */}
    </div>
  );
}
```

#### State Management

Usamos combinación de:
- **React State**: Para estado local de componentes
- **Custom Hooks**: Para lógica de negocio compartida
- **Server State**: Directamente desde API calls

#### Styling

- **TailwindCSS**: Para estilos principales
- **CSS Modules**: Para estilos específicos de componente
- **shadcn/ui**: Componentes UI base

### Backend Architecture

#### API Routes Structure

```typescript
// /api/documentos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { DocumentService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyToken(request);
    
    // Extraer query params
    const { search, page } = Object.fromEntries(request.nextUrl.searchParams);
    
    // Lógica de negocio
    const documents = await DocumentService.getDocuments({ search, page });
    
    return NextResponse.json({ success: true, data: documents });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

#### Database Layer

```typescript
// lib/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}
```

---

## Desarrollo de Features

### Agregar Nuevo Componente

1. **Crear componente**:
```typescript
// components/NuevoComponente.tsx
interface NuevoComponenteProps {
  title: string;
  onSubmit: (data: any) => void;
}

export function NuevoComponente({ title, onSubmit }: NuevoComponenteProps) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">{title}</h2>
      {/* Component content */}
    </div>
  );
}
```

2. **Crear tests** (si aplica):
```typescript
// __tests__/NuevoComponente.test.tsx
import { render, screen } from '@testing-library/react';
import { NuevoComponente } from '../NuevoComponente';

test('renders title correctly', () => {
  render(<NuevoComponente title="Test Title" onSubmit={jest.fn()} />);
  expect(screen.getByText('Test Title')).toBeInTheDocument();
});
```

### Agregar Nuevo API Endpoint

1. **Crear route**:
```typescript
// app/api/nuevo-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar input
    if (!body.requiredField) {
      return NextResponse.json(
        { error: 'Campo requerido faltante' },
        { status: 400 }
      );
    }
    
    // Procesar lógica
    const result = await processRequest(body);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error en nuevo-endpoint:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
```

2. **Agregar tipos**:
```typescript
// types/api.ts
export interface NuevoEndpointRequest {
  requiredField: string;
  optionalField?: number;
}

export interface NuevoEndpointResponse {
  id: string;
  processedAt: Date;
}
```

### Agregar Nuevo Hook

```typescript
// hooks/useNuevoHook.ts
import { useState, useEffect } from 'react';
import { NuevoEndpointRequest, NuevoEndpointResponse } from '@/types/api';

export function useNuevoHook() {
  const [data, setData] = useState<NuevoEndpointResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (request: NuevoEndpointRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/nuevo-endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) throw new Error('Request failed');
      
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
}
```

---

## Testing

### Estrategia de Testing

- **Unit Tests**: Para funciones puras y hooks
- **Integration Tests**: Para API endpoints
- **E2E Tests**: Para flujos críticos de usuario

### Ejemplos de Tests

#### Unit Test
```typescript
// __tests__/utils/formatDate.test.ts
import { formatDate } from '@/utils/date';

test('formats date correctly', () => {
  const date = new Date('2024-01-15');
  expect(formatDate(date)).toBe('15/01/2024');
});
```

#### Integration Test
```typescript
// __tests__/api/documentos.test.ts
import { GET } from '@/app/api/documentos/route';
import { NextRequest } from 'next/server';

test('GET /api/documentos returns documents', async () => {
  const request = new NextRequest('http://localhost:3000/api/documentos');
  const response = await GET(request);
  
  expect(response.status).toBe(200);
  const data = await response.json();
  expect(data.success).toBe(true);
});
```

---

## Debugging

### Herramientas de Debug

1. **Browser DevTools**: Para frontend
2. **VS Code Debugger**: Para Node.js
3. **Postman/Insomnia**: Para API testing
4. **Logs**: Console.log estructurados

### Configuración VS Code Debug

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logging Strategy

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error);
  },
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  }
};
```

---

## Performance

### Optimizaciones Implementadas

1. **Code Splitting**: Automático con Next.js
2. **Image Optimization**: Next.js Image component
3. **Bundle Analysis**: webpack-bundle-analyzer
4. **Caching**: Estrategias de cache en API

### Monitoreo de Performance

```typescript
// lib/performance.ts
export function measurePerformance<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`${name} took ${end - start} milliseconds`);
  }
  
  return result;
}
```

---

## Despliegue

### Environment Setup

#### Development
```bash
npm run dev
```

#### Production Build
```bash
npm run build
npm start
```

#### Docker (opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Variables de Entorno por Ambiente

| Variable | Development | Production |
|----------|-------------|------------|
| NODE_ENV | development | production |
| DB_HOST | localhost | production-db |
| JWT_SECRET | dev-secret | production-secret |

---

## Recursos y Referencias

### Documentación Importante

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Guide](https://tailwindcss.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [JWT Specification](https://jwt.io/)

### Herramientas Útiles

- **Database GUI**: pgAdmin, DBeaver
- **API Testing**: Postman, Insomnia
- **Performance**: Lighthouse, Bundle Analyzer
- **Code Quality**: ESLint, Prettier

---

## Preguntas Frecuentes

### ¿Cómo agrego una nueva tabla a la base de datos?

1. Diseña el esquema SQL
2. Crea script de migración
3. Actualiza tipos TypeScript
4. Crea servicios y endpoints
5. Agrega componentes UI

### ¿Cómo manejo archivos grandes?

1. Configura límites en Next.js
2. Implementa streaming si es necesario
3. Considera almacenamiento externo (S3)

### ¿Cómo agrego tests a código existente?

1. Identifica funciones puras
2. Escribe unit tests primero
3. Agrega integration tests para APIs
4. Considera E2E para flujos críticos

---

## Contacto

Para dudas o soporte:

- **Tech Lead**: [Contacto]
- **Equipo de Desarrollo**: [Slack/Teams]
- **Documentation Issues**: GitHub Issues

---

**Última actualización**: Enero 2026
