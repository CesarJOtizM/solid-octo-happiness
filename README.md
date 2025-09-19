# 📅 API de Fechas Hábiles - Colombia

Una API REST que calcula fechas hábiles considerando días laborales, horarios de trabajo, días festivos de Colombia y zona horaria.

## 🚀 Características

- ✅ **Cálculo de fechas hábiles** considerando días laborales (lunes a viernes)
- ✅ **Horarios de trabajo** (8:00 AM - 5:00 PM, hora Colombia)
- ✅ **Días festivos de Colombia** obtenidos de API externa
- ✅ **Zona horaria** América/Bogotá con conversión a UTC
- ✅ **Validación robusta** con Zod schemas
- ✅ **Caché inteligente** para días festivos
- ✅ **Manejo de errores** completo
- ✅ **Logging estructurado** con Winston
- ✅ **Tests completos** (unitarios e integración)
- ✅ **Docker** para despliegue fácil
- ✅ **TypeScript** para type safety

## 📋 Requisitos

- Node.js 18+
- npm 9+
- Docker (opcional)

## 🛠️ Instalación

### Opción 1: Instalación Local

```bash
# Clonar el repositorio
git clone [<repository-url>](https://github.com/CesarJOtizM/solid-octo-happiness)
cd businessDates

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Compilar TypeScript
npm run build

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start
```

### Opción 2: Docker

```bash
# Clonar el repositorio
git clone <repository-url>
cd businessDates

# Configurar variables de entorno
cp env.docker.example .env.docker

# Ejecutar con Docker
npm run docker:prod
```

## 🚀 Uso Rápido

### Endpoint Principal

```bash
GET /business-date?days=1&hours=2&date=2025-01-06T13:00:00Z
```

**Respuesta:**

```json
{
  "date": "2025-01-08T18:00:00Z"
}
```

### Health Check

```bash
GET /health
```

**Respuesta:**

```json
{
  "name": "API de Fechas Hábiles - Colombia",
  "version": "1.0.0",
  "status": "healthy",
  "timestamp": "2025-01-06T13:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

## 📚 Documentación Completa

- **[API Reference](./docs/API.md)** - Documentación completa de endpoints
- **[Requirements](./Requirements.md)** - Especificaciones del proyecto
- **[Work Plan](./docs/work_plan.md)** - Plan de desarrollo
- **[Postman Collection](./docs/POSTMAN_GUIDE.md)** - Colección de Postman para pruebas
- **[Despliegue en Vercel](./docs/VERCEL_DEPLOYMENT.md)** - Guía completa de despliegue

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 📮 Postman Collection

Para facilitar las pruebas de la API, hemos incluido una colección completa de Postman:

### Importar Colección

1. Descargar `docs/postman_collection.json`
2. Importar en Postman
3. Configurar environment con `docs/postman_environment.json`

### Características

- ✅ **Todos los endpoints** documentados
- ✅ **9 casos de ejemplo** del requerimiento
- ✅ **Tests automáticos** incluidos
- ✅ **Casos de error** para validación
- ✅ **Variables de entorno** configurables

### Uso Rápido

```bash
# 1. Importar colección en Postman
# 2. Seleccionar environment "API Fechas Hábiles"
# 3. Ejecutar "Health Check" para verificar conexión
# 4. Probar casos de ejemplo
```

Ver **[Guía completa de Postman](./docs/POSTMAN_GUIDE.md)** para más detalles.

## 🚀 Despliegue en Vercel

Para desplegar la API en Vercel de forma rápida:

### Despliegue Rápido

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login en Vercel
vercel login

# 3. Desplegar
vercel --prod
```

### Configuración Automática

- ✅ **vercel.json** configurado
- ✅ **Variables de entorno** predefinidas
- ✅ **Scripts npm** para Vercel
- ✅ **CI/CD automático** con GitHub

### Características

- 🌐 **Serverless**: Escalado automático
- ⚡ **Edge Functions**: Respuesta rápida global
- 🔄 **Deploy automático**: Con cada push a GitHub
- 📊 **Analytics**: Métricas de rendimiento
- 🔒 **HTTPS**: Certificado SSL automático

Ver **[Guía completa de Vercel](./docs/VERCEL_DEPLOYMENT.md)** para más detalles.

## 🔧 Scripts Disponibles

| Script           | Descripción                 |
| ---------------- | --------------------------- |
| `npm run dev`    | Ejecutar en modo desarrollo |
| `npm run build`  | Compilar TypeScript         |
| `npm start`      | Ejecutar en producción      |
| `npm test`       | Ejecutar tests              |
| `npm run lint`   | Verificar código            |
| `npm run format` | Formatear código            |

## 🐳 Docker Scripts

| Script                 | Descripción             |
| ---------------------- | ----------------------- |
| `npm run docker:build` | Construir imagen Docker |
| `npm run docker:dev`   | Ejecutar en desarrollo  |
| `npm run docker:prod`  | Ejecutar en producción  |
| `npm run docker:logs`  | Ver logs                |
| `npm run docker:clean` | Limpiar Docker          |

## 🚀 Scripts Vercel

| Script                   | Descripción                 |
| ------------------------ | --------------------------- |
| `npm run vercel:dev`     | Desarrollo local con Vercel |
| `npm run vercel:deploy`  | Desplegar en producción     |
| `npm run vercel:preview` | Desplegar preview           |
| `npm run vercel:logs`    | Ver logs de Vercel          |

## 📊 Casos de Ejemplo

### Caso 1: Viernes 5:00 PM + 1 hora

```bash
curl "http://localhost:3000/business-date?hours=1&date=2025-01-03T22:00:00Z"
# Resultado: Lunes 9:00 AM (2025-01-06T14:00:00Z)
```

### Caso 2: Lunes 9:00 AM + 1 día

```bash
curl "http://localhost:3000/business-date?days=1&date=2025-01-06T14:00:00Z"
# Resultado: Martes 9:00 AM (2025-01-07T14:00:00Z)
```

### Caso 3: Viernes 4:00 PM + 2 horas

```bash
curl "http://localhost:3000/business-date?hours=2&date=2025-01-03T21:00:00Z"
# Resultado: Lunes 10:00 AM (2025-01-06T15:00:00Z)
```

## 🏗️ Arquitectura

```
src/
├── controllers/     # Controladores de endpoints
├── services/        # Lógica de negocio
├── middleware/      # Middleware personalizado
├── routes/          # Definición de rutas
├── utils/           # Utilidades y helpers
├── types/           # Definiciones de tipos
├── config/          # Configuración
└── app.ts           # Punto de entrada
```

## 🔒 Seguridad

- ✅ Validación de entrada con Zod
- ✅ Sanitización de parámetros
- ✅ Rate limiting (con Nginx)
- ✅ Headers de seguridad
- ✅ Usuario no-root en Docker
- ✅ Logging de seguridad

## 📈 Monitoreo

- ✅ Health checks automáticos
- ✅ Logging estructurado
- ✅ Métricas de rendimiento
- ✅ Manejo de errores centralizado

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:

1. Revisa la [documentación](./docs/)
2. Consulta los [issues](../../issues)
3. Crea un nuevo issue si no encuentras solución

## 🎯 Roadmap

- [ ] Implementar caché distribuido (Redis)
- [ ] Agregar más países/regiones
- [ ] API GraphQL
- [ ] SDK para diferentes lenguajes
- [ ] Dashboard de monitoreo

---

**Desarrollado con ❤️ para facilitar el cálculo de fechas hábiles en Colombia**
