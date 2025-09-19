# 📮 Guía de Postman - API Fechas Hábiles

Guía completa para usar la colección de Postman de la API de Fechas Hábiles.

## 📥 Importar la Colección

### 1. Descargar archivos

```bash
# Los archivos están en la carpeta docs/
docs/postman_collection.json
docs/postman_environment.json
```

### 2. Importar en Postman

**Opción A: Importar desde archivo**

1. Abrir Postman
2. Click en "Import" (esquina superior izquierda)
3. Seleccionar "Upload Files"
4. Seleccionar `postman_collection.json`
5. Click "Import"

**Opción B: Importar desde URL**

1. En Postman, click "Import"
2. Seleccionar "Link"
3. Pegar la URL del archivo JSON
4. Click "Continue" → "Import"

### 3. Configurar Environment

1. Click en "Environments" en el sidebar izquierdo
2. Click "Import"
3. Seleccionar `postman_environment.json`
4. Click "Import"
5. Seleccionar el environment "API Fechas Hábiles - Environment"

## 🚀 Uso Básico

### 1. Seleccionar Environment

- En la esquina superior derecha, seleccionar "API Fechas Hábiles - Environment"
- Verificar que `baseUrl` esté configurado como `http://localhost:3000`

### 2. Ejecutar Health Check

1. Expandir "Health Check" en el sidebar
2. Seleccionar "Health Check - Estado de la API"
3. Click "Send"
4. Verificar respuesta exitosa (200)

### 3. Probar Endpoint Principal

1. Expandir "Business Date"
2. Seleccionar "Calcular Fecha Hábil - Solo Días"
3. Click "Send"
4. Verificar respuesta con fecha calculada

## 📋 Estructura de la Colección

### 🏥 Health Check

- **Health Check - Estado de la API**: Verifica el estado de la API

### 📅 Business Date

- **Calcular Fecha Hábil - Solo Días**: Agregar días hábiles
- **Calcular Fecha Hábil - Solo Horas**: Agregar horas hábiles
- **Calcular Fecha Hábil - Días y Horas**: Combinar días y horas

### 🧪 Casos de Ejemplo del Requerimiento

- **Caso 1**: Viernes 5:00 PM + 1 hora → Lunes 9:00 AM
- **Caso 2**: Lunes 9:00 AM + 1 día → Martes 9:00 AM
- **Caso 3**: Viernes 4:00 PM + 2 horas → Lunes 10:00 AM
- **Caso 4**: Jueves 4:00 PM + 1 día → Martes 9:00 AM
- **Caso 5**: Viernes 5:00 PM + 1 día → Martes 9:00 AM
- **Caso 6**: Viernes 5:00 PM + 2 días → Miércoles 9:00 AM
- **Caso 7**: Viernes 5:00 PM + 1 día + 1 hora → Martes 10:00 AM
- **Caso 8**: Viernes 5:00 PM + 1 día + 2 horas → Martes 11:00 AM
- **Caso 9**: Viernes 5:00 PM + 1 día + 3 horas → Martes 12:00 PM

### ❌ Casos de Error

- **Error - Parámetros faltantes**: Sin días ni horas
- **Error - Fecha inválida**: Formato de fecha incorrecto
- **Error - Valores negativos**: Días o horas negativos
- **Error - Ruta no encontrada**: Endpoint inexistente

## 🔧 Variables de Environment

| Variable                 | Valor por Defecto                    | Descripción                       |
| ------------------------ | ------------------------------------ | --------------------------------- |
| `baseUrl`                | `http://localhost:3000`              | URL base de la API                |
| `baseUrl_prod`           | `https://your-production-domain.com` | URL de producción                 |
| `baseUrl_staging`        | `https://your-staging-domain.com`    | URL de staging                    |
| `environment`            | `development`                        | Entorno actual                    |
| `api_version`            | `1.0.0`                              | Versión de la API                 |
| `test_date_monday`       | `2025-01-06T14:00:00Z`               | Fecha de prueba: Lunes            |
| `test_date_friday`       | `2025-01-03T22:00:00Z`               | Fecha de prueba: Viernes          |
| `test_date_thursday`     | `2025-01-02T21:00:00Z`               | Fecha de prueba: Jueves           |
| `expected_response_time` | `5000`                               | Tiempo de respuesta esperado (ms) |

## 🧪 Tests Automáticos

La colección incluye tests automáticos que se ejecutan en cada request:

### Tests Generales

- ✅ **Status code is successful**: Verifica código 200, 201, o 202
- ✅ **Response time is less than 5000ms**: Tiempo de respuesta < 5 segundos
- ✅ **Content-Type is JSON**: Header Content-Type correcto

### Tests Específicos

**Health Check:**

- ✅ **Health check response structure**: Verifica estructura de respuesta
  - `name`, `version`, `status`, `timestamp`, `uptime`, `environment`

**Business Date:**

- ✅ **Business date response structure**: Verifica estructura de respuesta
  - Campo `date` presente
  - Formato ISO 8601 válido

## 🚀 Ejecutar Colección Completa

### 1. Runner de Postman

1. Click en "Collections" en el sidebar
2. Click en "..." junto a "API Fechas Hábiles - Colombia"
3. Seleccionar "Run collection"
4. Configurar opciones:
   - **Environment**: "API Fechas Hábiles - Environment"
   - **Iterations**: 1
   - **Delay**: 100ms
5. Click "Run API Fechas Hábiles - Colombia"

### 2. Monitoreo de Tests

- Ver resultados en tiempo real
- Tests que pasan: ✅ Verde
- Tests que fallan: ❌ Rojo
- Ver detalles de errores

## 🔄 Configurar Diferentes Entornos

### 1. Desarrollo Local

```json
{
  "baseUrl": "http://localhost:3000",
  "environment": "development"
}
```

### 2. Staging

```json
{
  "baseUrl": "https://staging-api.example.com",
  "environment": "staging"
}
```

### 3. Producción

```json
{
  "baseUrl": "https://api.example.com",
  "environment": "production"
}
```

## 📊 Monitoreo y Métricas

### 1. Ver Métricas de Requests

- Tiempo de respuesta por request
- Tamaño de respuesta
- Status codes
- Tests ejecutados

### 2. Exportar Resultados

1. En el Runner, click "Export Results"
2. Seleccionar formato (JSON, CSV)
3. Descargar archivo

### 3. Integración con CI/CD

```bash
# Ejecutar desde línea de comandos
newman run docs/postman_collection.json \
  --environment docs/postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

## 🛠️ Personalización

### 1. Agregar Nuevos Tests

```javascript
// En la pestaña "Tests" de cualquier request
pm.test("Mi test personalizado", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("mi_campo");
});
```

### 2. Agregar Variables Dinámicas

```javascript
// En la pestaña "Pre-request Script"
pm.environment.set("timestamp", new Date().toISOString());
pm.environment.set("random_days", Math.floor(Math.random() * 10) + 1);
```

### 3. Agregar Headers Personalizados

```javascript
// En la pestaña "Headers"
Authorization: Bearer {{auth_token}}
X-Request-ID: {{$randomUUID}}
```

## 🔍 Troubleshooting

### Problemas Comunes

1. **Error de conexión**
   - Verificar que la API esté ejecutándose
   - Verificar URL en environment
   - Verificar puerto (3000 por defecto)

2. **Tests fallando**
   - Verificar que la API responda correctamente
   - Revisar logs de la aplicación
   - Verificar formato de respuesta

3. **Variables no definidas**
   - Verificar que el environment esté seleccionado
   - Verificar que las variables estén habilitadas
   - Verificar sintaxis de variables `{{variable}}`

### Debugging

```javascript
// Agregar logging en Pre-request Script
console.log("Environment:", pm.environment.get("baseUrl"));
console.log("Request URL:", pm.request.url.toString());

// Agregar logging en Tests
console.log("Response:", pm.response.json());
console.log("Status:", pm.response.status);
```

## 📚 Recursos Adicionales

- [Documentación de Postman](https://learning.postman.com/)
- [Newman CLI](https://github.com/postmanlabs/newman)
- [Postman API](https://www.postman.com/postman/workspace/postman-public-workspace/documentation/12959542-c8142d51-e97c-43b6-8c64-705bb5058dac)

## 🤝 Contribución

Para agregar nuevos casos de prueba:

1. Crear nuevo request en la colección
2. Configurar método, URL y parámetros
3. Agregar tests automáticos
4. Documentar el caso en la descripción
5. Actualizar esta guía

---

**¡Disfruta probando la API de Fechas Hábiles con Postman! 🚀**
