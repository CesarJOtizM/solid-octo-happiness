import { BusinessDateRequest } from "./request";

/**
 * Extensión del tipo Request de Express para incluir parámetros validados
 */
declare global {
  namespace Express {
    interface Request {
      validatedParams?: BusinessDateRequest;
    }
  }
}

export {};
