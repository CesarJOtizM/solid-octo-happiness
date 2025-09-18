# 📋 Plan de Trabajo - API de Fechas Hábiles

## 🎯 Objetivo Principal

Desarrollar una API REST que calcule fechas hábiles en Colombia considerando:

- **Días laborales**: Lunes a Viernes
- **Horario**: 8:00 AM - 5:00 PM (con almuerzo 12:00 PM - 1:00 PM)
- **Zona horaria**: `America/Bogota` (conversión final a UTC)
- **Días festivos**: Obtenidos desde API externa

## 🛠️ Stack Tecnológico

- **Backend**: Express.js con TypeScript
- **HTTP Client**: Axios para consultar días festivos
- **Zona Horaria**: date-fns con soporte para zonas horarias
- **Validación**: express-validator
- **Testing**: Jest con supertest
- **Calidad de Código**: ESLint, Prettier, Husky
- **Deployment**: Vercel/Railway/Render

## 📁 Estructura del Proyecto

```
businessDates/
├── src/
│   ├── controllers/
│   │   └── businessDateController.ts
│   ├── services/
│   │   ├── holidayService.ts
│   │   └── businessDateService.ts
│   ├── middleware/
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── types/
│   │   ├── request.ts
│   │   ├── response.ts
│   │   └── businessDate.ts
│   ├── utils/
│   │   ├── dateUtils.ts
│   │   └── timezoneUtils.ts
│   ├── routes/
│   │   └── businessDateRoutes.ts
│   └── app.ts
├── tests/
│   ├── businessDate.test.ts
│   ├── holidayService.test.ts
│   └── setup.ts
├── .husky/
│   └── pre-commit
├── package.json
├── tsconfig.json
├── jest.config.js
├── eslint.config.js
├── .prettierrc
├── .prettierignore
├── .gitignore
├── env.example
└── README.md
```

## 🔄 Fases de Implementación

### ✅ Fase 1: Configuración del Proyecto

- [x] Inicializar proyecto Node.js con TypeScript
- [x] Instalar dependencias: Express, Axios, date-fns, express-validator
- [x] Configurar tsconfig.json
- [x] Configurar Jest para testing
- [x] Crear estructura de carpetas
- [x] Configurar ESLint con reglas TypeScript
- [x] Configurar Prettier para formateo de código
- [x] Configurar Husky con pre-commit hooks
- [x] Configurar lint-staged para optimizar commits

### 🔄 Fase 2: Definición de Tipos

- [ ] Crear interfaces para parámetros de entrada
- [ ] Definir tipos para respuestas de éxito y error
- [ ] Tipos para manejo de fechas y zonas horarias
- [ ] Interfaces para servicio de días festivos

### 🔄 Fase 3: Servicio de Días Festivos

- [ ] Implementar cliente Axios para API externa
- [ ] Crear servicio para obtener días festivos de Colombia
- [ ] Implementar caché para optimizar consultas
- [ ] Manejo de errores en consultas externas

### 🔄 Fase 4: Lógica de Negocio

- [ ] Implementar cálculo de fechas hábiles
- [ ] Manejo de zona horaria Colombia (America/Bogota)
- [ ] Lógica para horarios laborales (8AM-5PM, almuerzo 12PM-1PM)
- [ ] Algoritmo para días fuera del horario laboral
- [ ] Conversión final a UTC

### 🔄 Fase 5: Validación y Middleware

- [ ] Middleware de validación para parámetros
- [ ] Validación de formato de fecha ISO 8601
- [ ] Validación de números positivos para days/hours
- [ ] Middleware de manejo de errores

### 🔄 Fase 6: Endpoint Principal

- [ ] Crear endpoint GET /business-date
- [ ] Integrar toda la lógica de negocio
- [ ] Implementar respuestas según especificación
- [ ] Manejo de casos edge

### 🔄 Fase 7: Testing

- [ ] Tests unitarios para servicio de días festivos
- [ ] Tests para lógica de cálculo de fechas
- [ ] Tests de integración para endpoint completo
- [ ] Validar todos los casos de ejemplo del requerimiento

### 🔄 Fase 8: Documentación

- [ ] Crear README.md con instrucciones de instalación
- [ ] Documentar endpoints y parámetros
- [ ] Ejemplos de uso y casos de prueba
- [ ] Instrucciones de despliegue

### 🔄 Fase 9: Despliegue

- [ ] Configurar despliegue en Vercel/Railway/Render
- [ ] Configurar variables de entorno
- [ ] Validar funcionamiento en producción
- [ ] Documentar URL de despliegue

## 🎯 Casos de Prueba Críticos

### Casos Básicos

1. **Viernes 5:00 PM + 1 hora** → Lunes 9:00 AM
2. **Sábado 2:00 PM + 1 hora** → Lunes 9:00 AM
3. **Martes 3:00 PM + 1 día + 4 horas** → Jueves 10:00 AM

### Casos Edge

4. **Domingo 6:00 PM + 1 día** → Lunes 5:00 PM
5. **Día laboral 8:00 AM + 8 horas** → Mismo día 5:00 PM
6. **Día laboral 8:00 AM + 1 día** → Siguiente día laboral 8:00 AM
7. **Día laboral 12:30 PM + 1 día** → Siguiente día laboral 12:00 PM
8. **Día laboral 11:30 AM + 3 horas** → Mismo día 3:30 PM

### Caso con Festivos

9. **2025-04-10T15:00:00Z + 5 días + 4 horas** → 21 abril 3:00 PM (considerando festivos 17-18 abril)

## 🔧 Especificaciones Técnicas

### Endpoint

- **Método**: GET
- **Ruta**: `/business-date`
- **Parámetros**:
  - `days`: número entero positivo (opcional)
  - `hours`: número entero positivo (opcional)
  - `date`: fecha UTC en formato ISO 8601 con Z (opcional)

### Respuestas

**Éxito (200)**:

```json
{
  "date": "YYYY-MM-DDTHH:mm:ssZ"
}
```

**Error (400/503)**:

```json
{
  "error": "InvalidParameters",
  "message": "Detalle del error"
}
```

## 📊 Criterios de Evaluación

- ✅ **Correctitud**: Precisión en cálculos y lógica de negocio
- ✅ **Calidad del código**: Implementación clara, modular y mantenible
- ✅ **Manejo de zonas horarias**: Uso correcto de Colombia → UTC
- ✅ **Manejo de errores**: Validación robusta de parámetros
- ✅ **Eficiencia**: Optimización de recursos y claridad estructural
- ✅ **TypeScript**: Tipado explícito y consistente

## 🚀 Entregables

1. **Repositorio GitHub** con código completo y README
2. **URL de despliegue** accesible públicamente
3. **Bonus**: Despliegue como función Lambda con AWS CDK

---

**Estado**: 🔄 En progreso
**Última actualización**: 18 de septiembre de 2024
