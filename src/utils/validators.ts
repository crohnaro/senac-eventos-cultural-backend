// src/utils/validators.ts
import { z, ZodError } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';

// seus schemas...
export const registerSchema = z.object({ /* ... */ });
export const loginSchema    = z.object({ /* ... */ });

export const validate =
  (schema: z.ZodSchema<any>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        // Chama o método JSON mas NÃO retorna o objeto Response
        res.status(400).json({ errors: err.errors });
        return; // interrompe aqui
      }
      next(err);
    }
  };
