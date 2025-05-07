// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login } from '../controllers/auth.controller';
import { loginSchema, registerSchema, validate } from '../utils/validators';

const router = Router();

/**
 * @route POST /auth/register
 * @body { name: string, email: string, password: string, role: "ORGANIZER" | "PARTICIPANT" }
 */
router.post('/register', validate(registerSchema), register);

/**
 * @route POST /auth/login
 * @body { email: string, password: string }
 */
router.post('/login', validate(loginSchema), login);

export default router;
