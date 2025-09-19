FROM alpine:3.21

ENV NODE_VERSION=24.8.0
# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copiar archivos de configuración de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias de desarrollo para compilación
RUN npm ci --ignore-scripts

# Copiar código fuente
COPY src/ ./src/

# Compilar TypeScript
RUN npm run build

# Limpiar dependencias de desarrollo después de compilar
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Cambiar ownership de los archivos al usuario no-root
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicio
CMD ["node", "dist/app.js"]
