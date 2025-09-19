# 📚 API Reference - Fechas Hábiles Colombia

Documentación completa de la API REST para cálculo de fechas hábiles en Colombia.

## 🌐 Base URL

```
http://localhost:3000
```

## 🔗 Endpoints

### 1. Health Check

Verifica el estado de la API.

```http
GET /health
```

**Respuesta Exitosa (200):**

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

**Campos de Respuesta:**

- `name`: Nombre de la API
- `version`: Versión actual
- `status`: Estado de la API (`healthy` o `unhealthy`)
- `timestamp`: Timestamp actual en UTC
- `uptime`: Tiempo de ejecución en segundos
- `environment`: Entorno de ejecución

---

### 2. Calcular Fecha Hábil

Calcula una fecha hábil considerando días laborales, horarios de trabajo y días festivos.

```http
GET /business-date
```

#### Parámetros de Query

| Parámetro | Tipo   | Requerido | Descripción                           | Ejemplo                |
| --------- | ------ | --------- | ------------------------------------- | ---------------------- |
| `days`    | number | No\*      | Días hábiles a agregar                | `1`, `5`, `10`         |
| `hours`   | number | No\*      | Horas hábiles a agregar               | `1`, `8`, `24`         |
| `date`    | string | Sí        | Fecha inicial en formato ISO 8601 UTC | `2025-01-06T13:00:00Z` |

_\* Al menos uno de `days` o `hours` debe ser proporcionado._

#### Ejemplos de Uso

**Agregar 1 día hábil:**

```bash
curl "http://localhost:3000/business-date?days=1&date=2025-01-06T13:00:00Z"
```

**Agregar 2 horas hábiles:**

```bash
curl "http://localhost:3000/business-date?hours=2&date=2025-01-06T13:00:00Z"
```

**Agregar 1 día y 2 horas:**

```bash
curl "http://localhost:3000/business-date?days=1&hours=2&date=2025-01-06T13:00:00Z"
```

#### Respuesta Exitosa (200)

```json
{
  "date": "2025-01-08T18:00:00Z"
}
```

**Campos de Respuesta:**

- `date`: Fecha calculada en formato ISO 8601 UTC

#### Respuestas de Error

**Error de Validación (400):**

```json
{
  "error": "InvalidParameters",
  "message": "Parámetros inválidos: days debe ser un número positivo",
  "details": {
    "field": "days",
    "value": "invalid",
    "expected": "number >= 0"
  }
}
```

**Error de Servidor (500):**

```json
{
  "error": "InternalServerError",
  "message": "Error interno del servidor",
  "timestamp": "2025-01-06T13:00:00.000Z"
}
```

---

## 📋 Reglas de Negocio

### Días Laborales

- **Lunes a Viernes**: Días hábiles
- **Sábados y Domingos**: Días no hábiles
- **Días festivos**: No hábiles (obtenidos de API externa)

### Horarios de Trabajo

- **Inicio**: 8:00 AM (hora Colombia)
- **Fin**: 5:00 PM (hora Colombia)
- **Almuerzo**: 12:00 PM - 1:00 PM (no hábil)

### Zona Horaria

- **Entrada**: UTC (ISO 8601)
- **Procesamiento**: América/Bogotá
- **Salida**: UTC (ISO 8601)

### Cálculo de Fechas

1. **Conversión de zona horaria**: UTC → América/Bogotá
2. **Validación de día hábil**: Lunes-Viernes, no festivos
3. **Aplicación de horarios**: 8:00 AM - 5:00 PM
4. **Cálculo de tiempo**: Días y horas hábiles
5. **Conversión de salida**: América/Bogotá → UTC

---

## 🧪 Casos de Prueba

### Caso 1: Viernes 5:00 PM + 1 hora

```bash
# Entrada
GET /business-date?hours=1&date=2025-01-03T22:00:00Z

# Resultado esperado
{
  "date": "2025-01-06T14:00:00Z"  # Lunes 9:00 AM
}
```

### Caso 2: Lunes 9:00 AM + 1 día

```bash
# Entrada
GET /business-date?days=1&date=2025-01-06T14:00:00Z

# Resultado esperado
{
  "date": "2025-01-07T14:00:00Z"  # Martes 9:00 AM
}
```

### Caso 3: Viernes 4:00 PM + 2 horas

```bash
# Entrada
GET /business-date?hours=2&date=2025-01-03T21:00:00Z

# Resultado esperado
{
  "date": "2025-01-06T15:00:00Z"  # Lunes 10:00 AM
}
```

### Caso 4: Jueves 4:00 PM + 1 día

```bash
# Entrada
GET /business-date?days=1&date=2025-01-02T21:00:00Z

# Resultado esperado
{
  "date": "2025-01-07T14:00:00Z"  # Martes 9:00 AM
}
```

### Caso 5: Viernes 5:00 PM + 1 día

```bash
# Entrada
GET /business-date?days=1&date=2025-01-03T22:00:00Z

# Resultado esperado
{
  "date": "2025-01-07T14:00:00Z"  # Martes 9:00 AM
}
```

### Caso 6: Viernes 5:00 PM + 2 días

```bash
# Entrada
GET /business-date?days=2&date=2025-01-03T22:00:00Z

# Resultado esperado
{
  "date": "2025-01-08T14:00:00Z"  # Miércoles 9:00 AM
}
```

### Caso 7: Viernes 5:00 PM + 1 día + 1 hora

```bash
# Entrada
GET /business-date?days=1&hours=1&date=2025-01-03T22:00:00Z

# Resultado esperado
{
  "date": "2025-01-07T15:00:00Z"  # Martes 10:00 AM
}
```

### Caso 8: Viernes 5:00 PM + 1 día + 2 horas

```bash
# Entrada
GET /business-date?days=1&hours=2&date=2025-01-03T22:00:00Z

# Resultado esperado
{
  "date": "2025-01-07T16:00:00Z"  # Martes 11:00 AM
}
```

### Caso 9: Viernes 5:00 PM + 1 día + 3 horas

```bash
# Entrada
GET /business-date?days=1&hours=3&date=2025-01-03T22:00:00Z

# Resultado esperado
{
  "date": "2025-01-07T17:00:00Z"  # Martes 12:00 PM
}
```

---

## ⚠️ Códigos de Error

| Código | Descripción           | Causa Común                      |
| ------ | --------------------- | -------------------------------- |
| `400`  | Bad Request           | Parámetros inválidos o faltantes |
| `404`  | Not Found             | Ruta no encontrada               |
| `500`  | Internal Server Error | Error interno del servidor       |
| `503`  | Service Unavailable   | Servicio externo no disponible   |

---

## 🔧 Configuración

### Variables de Entorno

| Variable            | Descripción                 | Valor por Defecto                                       |
| ------------------- | --------------------------- | ------------------------------------------------------- |
| `NODE_ENV`          | Entorno de ejecución        | `development`                                           |
| `PORT`              | Puerto del servidor         | `3000`                                                  |
| `HOLIDAY_API_URL`   | URL de API de días festivos | `https://content.capta.co/Recruitment/WorkingDays.json` |
| `CACHE_TTL_MINUTES` | TTL del caché en minutos    | `60`                                                    |
| `API_TIMEOUT_MS`    | Timeout de API en ms        | `10000`                                                 |
| `MAX_RETRIES`       | Máximo número de reintentos | `3`                                                     |

### Headers de Respuesta

| Header            | Descripción               |
| ----------------- | ------------------------- |
| `Content-Type`    | `application/json`        |
| `X-Response-Time` | Tiempo de respuesta en ms |
| `X-Request-ID`    | ID único de la petición   |

---

## 🚀 Rate Limiting

- **Límite**: 10 requests por segundo por IP
- **Burst**: 20 requests adicionales
- **Header de respuesta**: `X-RateLimit-*`

---

## 📊 Monitoreo

### Health Check

```bash
curl http://localhost:3000/health
```

### Logs

Los logs incluyen:

- Timestamp
- Nivel de log
- Mensaje
- Contexto adicional
- Request ID

### Métricas

- Tiempo de respuesta
- Número de requests
- Errores por tipo
- Uso de caché

---

## 🔒 Seguridad

- ✅ Validación de entrada
- ✅ Sanitización de parámetros
- ✅ Rate limiting
- ✅ Headers de seguridad
- ✅ Logging de seguridad
- ✅ Manejo seguro de errores

---

## 📞 Soporte

Para soporte técnico:

1. Revisa esta documentación
2. Consulta los logs de la aplicación
3. Verifica la configuración
4. Contacta al equipo de desarrollo
