# 📚 Documentación - API Fechas Hábiles

Bienvenido a la documentación completa de la API de Fechas Hábiles para Colombia.

## 📖 Índice de Documentación

### 🚀 Guías Principales

- **[README Principal](../README.md)** - Introducción y uso rápido
- **[API Reference](./API.md)** - Documentación completa de la API
- **[Ejemplos de Uso](./EXAMPLES.md)** - Casos prácticos y ejemplos de código
- **[Guía de Despliegue](./DEPLOYMENT.md)** - Instrucciones de despliegue
- **[Guía de Postman](./POSTMAN_GUIDE.md)** - Colección de Postman para pruebas

### 🐳 Docker

- **[Guía de Docker](../DOCKER.md)** - Configuración y uso de Docker
- **[Docker Compose](../docker-compose.yml)** - Configuración de servicios
- **[Dockerfile](../Dockerfile)** - Imagen de producción

### 📋 Especificaciones

- **[Requerimientos](../Requirements.md)** - Especificaciones del proyecto
- **[Plan de Trabajo](./work_plan.md)** - Plan de desarrollo y progreso

### 📮 Postman

- **[Colección de Postman](./postman_collection.json)** - Archivo JSON para importar
- **[Environment de Postman](./postman_environment.json)** - Variables de entorno
- **[Guía de Postman](./POSTMAN_GUIDE.md)** - Instrucciones de uso

## 🎯 Inicio Rápido

### 1. Instalación

```bash
git clone <repository-url>
cd businessDates
npm install
npm run build
npm start
```

### 2. Uso Básico

```bash
# Health check
curl http://localhost:3000/health

# Calcular fecha hábil
curl "http://localhost:3000/business-date?days=1&date=2025-01-06T13:00:00Z"
```

### 3. Docker

```bash
npm run docker:prod
```

## 📊 Estado del Proyecto

### ✅ Fases Completadas

- **Fase 1**: Configuración inicial del proyecto
- **Fase 2**: Estructura de directorios y configuración
- **Fase 3**: Implementación de servicios core
- **Fase 4**: Implementación de controladores y rutas
- **Fase 5**: Implementación de middleware y manejo de errores
- **Fase 6**: Configuración de logging y monitoreo
- **Fase 7**: Testing completo
- **Fase 8**: Documentación exhaustiva
- **Fase 9**: Docker para despliegue

### 🔄 Próximos Pasos

- Despliegue en plataforma cloud
- Configuración de CI/CD
- Monitoreo en producción

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm run test:coverage

# Tests en modo watch
npm run test:watch
```

## 🔧 Scripts Disponibles

| Script           | Descripción               |
| ---------------- | ------------------------- |
| `npm run dev`    | Desarrollo con hot reload |
| `npm run build`  | Compilar TypeScript       |
| `npm start`      | Ejecutar en producción    |
| `npm test`       | Ejecutar tests            |
| `npm run lint`   | Verificar código          |
| `npm run format` | Formatear código          |

## 🐳 Scripts Docker

| Script                 | Descripción           |
| ---------------------- | --------------------- |
| `npm run docker:build` | Construir imagen      |
| `npm run docker:dev`   | Desarrollo con Docker |
| `npm run docker:prod`  | Producción con Docker |
| `npm run docker:logs`  | Ver logs              |
| `npm run docker:clean` | Limpiar Docker        |

## 📞 Soporte

### Problemas Comunes

1. **Puerto ocupado**: Cambiar `PORT` en `.env`
2. **Error de conexión**: Verificar que la API esté ejecutándose
3. **Error de validación**: Verificar formato de fecha ISO 8601

### Recursos de Ayuda

- [API Reference](./API.md) - Documentación completa
- [Ejemplos](./EXAMPLES.md) - Casos de uso prácticos
- [Troubleshooting](./DEPLOYMENT.md#troubleshooting) - Resolución de problemas
- [Issues](../../issues) - Reportar problemas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](../LICENSE) para más detalles.

---

**Desarrollado con ❤️ para facilitar el cálculo de fechas hábiles en Colombia**
