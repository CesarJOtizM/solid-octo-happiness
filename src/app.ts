import express from "express";

const app = express();
const PORT = process.env["PORT"] || 3000;

app.get("/", (_req, res) => {
  res.json({ message: "API de Fechas Hábiles - Colombia" });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

export default app;
