// Configuración global para Jest
// Este archivo se ejecuta antes de cada test

// Configurar timeout para tests que hacen llamadas HTTP
jest.setTimeout(10000);

// Mock de console para evitar logs durante los tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
