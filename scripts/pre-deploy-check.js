#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Verificando preparación para despliegue en Vercel...\n");

// Verificar archivos requeridos
const requiredFiles = [
  "vercel.json",
  "api/index.js",
  "package.json",
  "tsconfig.build.json",
];

console.log("📁 Verificando archivos requeridos:");
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    process.exit(1);
  }
});

// Verificar que el build funcione
console.log("\n🔨 Verificando build:");
try {
  const { execSync } = require("child_process");
  execSync("npm run build", { stdio: "pipe" });
  console.log("✅ Build exitoso");
} catch (error) {
  console.log("❌ Build falló");
  console.error(error.message);
  process.exit(1);
}

// Verificar que dist/app.js existe
if (fs.existsSync("dist/app.js")) {
  console.log("✅ dist/app.js generado correctamente");
} else {
  console.log("❌ dist/app.js no encontrado");
  process.exit(1);
}

// Verificar configuración de package.json
console.log("\n📦 Verificando package.json:");
const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

if (packageJson.scripts.build) {
  console.log("✅ Script de build configurado");
} else {
  console.log("❌ Script de build faltante");
  process.exit(1);
}

if (packageJson.scripts["vercel:deploy"]) {
  console.log("✅ Script de despliegue de Vercel configurado");
} else {
  console.log("❌ Script de despliegue de Vercel faltante");
  process.exit(1);
}

console.log("\n🎉 ¡Todo listo para el despliegue en Vercel!");
console.log("\nPróximos pasos:");
console.log("1. Configurar variables de entorno en el dashboard de Vercel");
console.log("2. Ejecutar: npm run vercel:preview (para probar)");
console.log("3. Ejecutar: npm run vercel:deploy (para producción)");
