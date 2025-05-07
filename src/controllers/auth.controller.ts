// src/controllers/auth.controller.ts
import { RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma';

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET não definido em .env');

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1) Verificar se o email já existe
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      res.status(400).json({ message: 'Email já cadastrado.' });
      return;  // interrompe sem retornar o Response
    }

    // 2) Hash da senha
    const hashed = await bcrypt.hash(password, 10);

    // 3) Criar usuário
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role }
    });

    // 4) Retornar sem a senha
    const { password: _, ...rest } = user;
    res.status(201).json(rest);
    return;
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      // 1) Encontrar o usuário
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return;
      }
  
      // 2) Comparar senha
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(401).json({ message: 'Credenciais inválidas.' });
        return;
      }
  
      // 3) Gerar token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        JWT_SECRET,
        { expiresIn: '8h' }
      );
  
      res.json({ token });
      return;
    } catch (err) {
      next(err);
    }
  };
  