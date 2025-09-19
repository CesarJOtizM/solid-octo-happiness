# 🚀 Guía de Despliegue - API Fechas Hábiles

Guía completa para desplegar la API de Fechas Hábiles en diferentes entornos.

## 📋 Prerrequisitos

### Requisitos Mínimos

- Node.js 18+
- npm 9+
- Docker 20.10+ (opcional)
- Git

### Requisitos Recomendados

- 2 CPU cores
- 4GB RAM
- 10GB almacenamiento
- Red estable

## 🐳 Despliegue con Docker (Recomendado)

### 1. Preparar el servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Desplegar la aplicación

```bash
# Clonar repositorio
git clone <repository-url>
cd businessDates

# Configurar variables de entorno
cp env.docker.example .env.docker
nano .env.docker

# Ejecutar en producción
npm run docker:prod
```

### 3. Verificar despliegue

```bash
# Verificar contenedores
docker ps

# Verificar logs
npm run docker:logs

# Probar API
curl http://localhost:3000/health
```

## 🖥️ Despliegue Local

### 1. Instalar dependencias

```bash
# Clonar repositorio
git clone <repository-url>
cd businessDates

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env
```

### 2. Compilar y ejecutar

```bash
# Compilar TypeScript
npm run build

# Ejecutar en producción
npm start
```

### 3. Configurar como servicio (systemd)

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/business-dates-api.service
```

**Contenido del archivo:**

```ini
[Unit]
Description=Business Dates API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/businessDates
ExecStart=/usr/bin/node dist/app.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar y iniciar servicio
sudo systemctl daemon-reload
sudo systemctl enable business-dates-api
sudo systemctl start business-dates-api
sudo systemctl status business-dates-api
```

## ☁️ Despliegue en la Nube

### AWS EC2

1. **Crear instancia EC2:**
   - AMI: Ubuntu 22.04 LTS
   - Tipo: t3.medium (2 vCPU, 4GB RAM)
   - Almacenamiento: 20GB SSD

2. **Configurar seguridad:**

```bash
# Abrir puertos necesarios
# Puerto 22 (SSH)
# Puerto 80 (HTTP)
# Puerto 443 (HTTPS)
# Puerto 3000 (API)
```

3. **Instalar Docker:**

```bash
# Conectar por SSH
ssh -i your-key.pem ubuntu@your-instance-ip

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

4. **Desplegar aplicación:**

```bash
# Clonar y configurar
git clone <repository-url>
cd businessDates
cp env.docker.example .env.docker

# Configurar variables de entorno
nano .env.docker
```

5. **Ejecutar con Docker:**

```bash
npm run docker:prod
```

### Google Cloud Platform

1. **Crear instancia Compute Engine:**
   - Imagen: Ubuntu 22.04 LTS
   - Tipo: e2-medium (2 vCPU, 4GB RAM)

2. **Configurar firewall:**

```bash
# Crear regla de firewall
gcloud compute firewall-rules create allow-api \
    --allow tcp:3000 \
    --source-ranges 0.0.0.0/0 \
    --description "Allow API access"
```

3. **Desplegar:**

```bash
# Conectar por SSH
gcloud compute ssh your-instance-name

# Instalar Docker y desplegar
# (mismos pasos que AWS)
```

### Azure

1. **Crear máquina virtual:**
   - Imagen: Ubuntu 22.04 LTS
   - Tamaño: Standard_B2s (2 vCPU, 4GB RAM)

2. **Configurar grupo de seguridad:**
   - Puerto 22 (SSH)
   - Puerto 3000 (API)

3. **Desplegar:**

```bash
# Conectar por SSH
ssh azureuser@your-vm-ip

# Instalar Docker y desplegar
# (mismos pasos que AWS)
```

## 🌐 Despliegue con Nginx

### 1. Instalar Nginx

```bash
sudo apt update
sudo apt install nginx
```

### 2. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/business-dates-api
```

**Configuración:**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Habilitar sitio

```bash
sudo ln -s /etc/nginx/sites-available/business-dates-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Configuración SSL

### 1. Instalar Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obtener certificado

```bash
sudo certbot --nginx -d your-domain.com
```

### 3. Verificar renovación automática

```bash
sudo certbot renew --dry-run
```

## 📊 Monitoreo y Logs

### 1. Configurar logs

```bash
# Crear directorio de logs
sudo mkdir -p /var/log/business-dates-api
sudo chown www-data:www-data /var/log/business-dates-api
```

### 2. Configurar logrotate

```bash
sudo nano /etc/logrotate.d/business-dates-api
```

**Contenido:**

```
/var/log/business-dates-api/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload business-dates-api
    endscript
}
```

### 3. Monitoreo con systemd

```bash
# Ver logs del servicio
sudo journalctl -u business-dates-api -f

# Ver estado del servicio
sudo systemctl status business-dates-api
```

## 🔄 Actualizaciones

### 1. Actualización con Docker

```bash
# Detener servicios
npm run docker:stop

# Actualizar código
git pull

# Reconstruir y ejecutar
npm run docker:prod
```

### 2. Actualización local

```bash
# Detener servicio
sudo systemctl stop business-dates-api

# Actualizar código
git pull

# Reinstalar dependencias
npm install

# Recompilar
npm run build

# Reiniciar servicio
sudo systemctl start business-dates-api
```

## 🚨 Troubleshooting

### Problemas Comunes

1. **Puerto ocupado:**

```bash
# Verificar puerto
sudo netstat -tlnp | grep :3000

# Cambiar puerto en configuración
nano .env
```

2. **Error de permisos:**

```bash
# Corregir permisos
sudo chown -R www-data:www-data /path/to/businessDates
```

3. **Error de memoria:**

```bash
# Verificar uso de memoria
free -h

# Aumentar límite de memoria
sudo nano /etc/systemd/system/business-dates-api.service
# Agregar: Environment=NODE_OPTIONS="--max-old-space-size=2048"
```

4. **Error de conexión a API externa:**

```bash
# Verificar conectividad
curl -I https://content.capta.co/Recruitment/WorkingDays.json

# Verificar logs
npm run docker:logs
```

### Logs de Debug

```bash
# Habilitar logs detallados
NODE_ENV=development npm run dev

# Ver logs de Docker
docker-compose logs -f app

# Ver logs del sistema
sudo journalctl -u business-dates-api -f
```

## 📈 Escalabilidad

### 1. Load Balancer con Nginx

```nginx
upstream api {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    location / {
        proxy_pass http://api;
    }
}
```

### 2. Escalado horizontal con Docker

```bash
# Escalar a 3 instancias
docker-compose up --scale app=3 -d
```

### 3. Monitoreo de recursos

```bash
# Instalar htop
sudo apt install htop

# Monitorear recursos
htop
```

## 🔧 Mantenimiento

### 1. Backup de configuración

```bash
# Crear backup
tar -czf backup-$(date +%Y%m%d).tar.gz \
    .env \
    docker-compose.yml \
    nginx.conf
```

### 2. Limpieza de logs

```bash
# Limpiar logs antiguos
sudo find /var/log -name "*.log" -mtime +30 -delete
```

### 3. Actualización de dependencias

```bash
# Verificar dependencias desactualizadas
npm outdated

# Actualizar dependencias
npm update
```

## 📞 Soporte

Para soporte técnico:

1. Revisa los logs de la aplicación
2. Verifica la configuración
3. Consulta la documentación
4. Contacta al equipo de desarrollo
