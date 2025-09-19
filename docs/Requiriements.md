# Prueba Técnica: API de Fechas Hábiles

El objetivo de esta prueba es construir una **API funcional y precisa** que calcule fechas hábiles en Colombia. La solución debe ser robusta, modular y seguir estrictamente las reglas de negocio definidas.

## 🎯 Objetivo

Desarrollar una API REST que, a partir de una fecha/hora dada y una cantidad de horas y/o días hábiles, calcule la fecha y hora resultante. Este cálculo debe considerar el calendario laboral de Colombia, incluyendo días hábiles, horarios de trabajo, zonas horarias y días festivos.

---

## 🛠️ Instrucciones Técnicas

### 1. Endpoint y Parámetros

La API debe ser un **endpoint GET** en cualquier ruta de tu elección y debe aceptar los siguientes parámetros en la _query string_:

- **`days`**: Número de días hábiles a sumar.
  - _Tipo_: entero positivo.
  - _Opcional_.
- **`hours`**: Número de horas hábiles a sumar.
  - _Tipo_: entero positivo.
  - _Opcional_.
- **`date`**: Fecha/hora inicial en **UTC** (formato `ISO 8601` con sufijo `Z`).
  - _Opcional_. Si se omite, el cálculo inicia desde la hora actual de Colombia.

---

### 2. Lógica de Suma

Si se envían ambos parámetros (`days` y `hours`), la suma debe realizarse en orden: **primero los días y luego las horas**.

Si no se envía **ningún parámetro** (`days` o `hours`), la API debe retornar un error.

---

### 3. Respuesta de la API

### Éxito (Código de estado `200 OK`)

La respuesta debe ser un objeto JSON con una única clave:

```json
{ "date": "YYYY-MM-DDTHH:mm:ssZ" }
```

- La clave `date` es obligatoria.
- El valor debe estar en formato **UTC `ISO 8601` con `Z`**.
- No debe haber campos adicionales.

### Errores (Códigos de estado `400`, `503`, etc.)

La respuesta debe ser un objeto JSON con el siguiente formato:

```json
{
  "error": "InvalidParameters",
  "message": "Detalle del error"
}
```

- La clave `error` debe ser un identificador del problema.
- La clave `message` debe contener una descripción del error.

---

### 4. Requisitos de Código

- La solución completa debe estar implementada en **TypeScript**.
- Se debe utilizar **tipado explícito** en todas las funciones, interfaces, tipos de respuesta y estructuras de datos.
- No se aceptará código en JavaScript ni tipado implícito.

---

## 📚 Reglas de Negocio

- **Zona horaria**: Todos los cálculos deben realizarse en la hora local de **Colombia (`America/Bogota`)**. El resultado final debe ser convertido y retornado en **UTC**.
- **Punto de partida**:
  - Si se provee el parámetro `date`, este será el punto de partida (y se convertirá a la hora local de Colombia para el cálculo).
  - Si no se provee, el cálculo debe iniciar desde el **momento actual en Colombia**.
- **Días y Horas Hábiles**:
  - **Días**: Lunes a Viernes.
  - **Horario**: 8:00 a.m. a 5:00 p.m.
  - **Almuerzo**: 12:00 p.m. a 1:00 p.m. (no laborable).
- **Fechas fuera del horario**: Si la fecha inicial (`date`) cae fuera del horario laboral (por la noche, fin de semana o feriado), el cálculo debe iniciar desde el **día y/o hora laboral más cercano hacia atrás**.
- Días Festivos: Debes excluir los días festivos nacionales de Colombia. Puedes obtener la lista actualizada desde la siguiente URL: https://content.capta.co/Recruitment/WorkingDays.json

---

## 📌 Ejemplos

1. **Petición:** un viernes a las 5:00 p.m. con `hours=1`
   - **Resultado esperado**: lunes a las 9:00 a.m. (hora Colombia)
2. **Petición:** un sábado a las 2:00 p.m. con `hours=1`
   - **Resultado esperado**: lunes a las 9:00 a.m. (hora Colombia)
3. **Petición:** un martes a las 3:00 p.m. con `days=1` y `hours=4`
   - **Resultado esperado**: jueves a las 10:00 a.m. (hora Colombia)
4. **Petición:** un domingo a las 6:00 p.m. con `days=1`
   - **Resultado esperado**: lunes a las 5:00 p.m. (hora Colombia)
5. **Petición:** un día laboral a las 8:00 a.m. con `hours=8`
   - **Resultado esperado**: mismo día a las 5:00 p.m. (hora Colombia)
6. **Petición:** un día laboral a las 8:00 a.m. con `days=1`
   - **Resultado esperado**: siguiente día laboral a las 8:00 a.m. (hora Colombia)
7. **Petición:** un día laboral a las 12:30 p.m. con `days=1`
   - **Resultado esperado**: siguiente día laboral a las 12:00 p.m. (hora Colombia)
8. **Petición:** un día laboral a las 11:30 a.m. con `hours=3`
   - **Resultado esperado**: mismo día laboral a las 3:30 p.m. (hora Colombia)
9. **Petición:** `date=2025-04-10T15:00:00.000Z` con `days=5` y `hours=4` (considerando que el 17 y 18 de abril son festivos)
   - **Resultado esperado**: 21 de abril a las 3:00 p.m. (hora Colombia)

---

## 🤖 Uso de Herramientas de IA

El uso de herramientas de asistencia como **ChatGPT**, **GitHub Copilot**, **Stack Overflow**, etc., está completamente permitido. Lo importante es que la solución sea funcional, clara y que la domines. En una posible entrevista, se te podría preguntar sobre tus decisiones técnicas, así que asegúrate de entender tu propio código.

---

## ✅ Criterios de Evaluación

- **Correctitud**: Precisiónalementación clara, modular y mantenible.
- **Manejo de zonas horarias**: Uso correcto de la zona horaria de Colombia para los cálculos y la conversión final a UTC.
- **Manejo de errores**: Validación robusta para parámetros faltantes, inválidos, etc.
- **Eficiencia**: Optimización en el uso de recursos, complejidad algorítmica y claridad estructural.
- **Uso de TypeScript**: Correcto y consistente uso del tipado explícito.

---

## 🚀 Entrega

Para la entrega, deberás proporcionar:

1. **URL de un repositorio público en GitHub** con la solución completa. Incluye un archivo `README.md` con instrucciones claras para su instalación y ejecución local.
2. **La URL exacta de despliegue** del endpoint, accesible públicamente (Vercel, Railway, Render, etc.).
   - **Bonus**: Es un plus si la solución se despliega como una función Lambda utilizando AWS CDK.

---

## ⚠️ Validación

Tu API será verificada automáticamente para asegurar que cumple con lo solicitado:

- Los nombres de los parámetros deben coincidir exactamente (`days`, `hours`, `date`).
- La estructura de la respuesta debe ajustarse al contrato definido, tanto en éxito como en error.
- Los códigos de estado HTTP y el `Content-Type` deben ser correctos.

**Importante**: Si tu API no cumple con el contrato en cualquiera de estos puntos, la entrega podría ser rechazada automáticamente.
