// src/controllers/event.controller.ts
import { RequestHandler, Request } from 'express';
import prisma from '../services/prisma';
import { uploadToCloudinary } from '../services/cloudinary.service';

// Extensão da interface Request para incluir 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: number;
      [key: string]: any;
    };
  }
}

export const createEvent: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, location, price } = req.body;
    const organizerId = req.user!.userId; // entregue pelo ensureAuth

    if (!req.file) {
      res.status(400).json({ message: 'Banner do evento é obrigatório.' });
      return;
    }

    // Upload para Cloudinary
    const bannerUrl = await uploadToCloudinary(req.file.buffer);

    // Criação do evento no banco
    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        price: price ? Number(price) : null,
        bannerUrl,
        organizerId
      }
    });

    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
};

export const updateEvent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data: any = { ...req.body };

    // Se veio nova imagem, faz upload e atualiza bannerUrl
    if (req.file) {
      data.bannerUrl = await uploadToCloudinary(req.file.buffer);
    }

    const event = await prisma.event.update({
      where: { id: Number(id) },
      data
    });

    res.json(event);
  } catch (err) {
    next(err);
  }
};

// listEvents: retorna todos os eventos com dados do organizador e número de inscrições
export const listEvents: RequestHandler = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: { id: true, name: true, email: true }
        },
        subscriptions: {
          select: { id: true }  // só contar inscrições
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // ajusta para retornar count em vez de array de inscrições
    const result = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      bannerUrl: e.bannerUrl,
      price: e.price,
      createdAt: e.createdAt,
      organizer: e.organizer,
      subscriptionCount: e.subscriptions.length
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// getEvent: detalhes de um único evento, incluindo lista de participantes
export const getEvent: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: { select: { id: true, name: true, email: true } },
        subscriptions: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        }
      }
    });

    if (!event) {
      res.status(404).json({ message: 'Evento não encontrado.' });
      return;
    }

    // formato a resposta
    const result = {
      id: event.id,
      title: event.title,
      description: event.description,
      location: event.location,
      bannerUrl: event.bannerUrl,
      price: event.price,
      createdAt: event.createdAt,
      organizer: event.organizer,
      participants: event.subscriptions.map(s => ({
        subscriptionId: s.id,
        userId: s.user.id,
        name: s.user.name,
        email: s.user.email,
        message: s.message,
        subscribedAt: s.createdAt
      }))
    };

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// deleteEvent: apaga um evento pelo ID
export const deleteEvent: RequestHandler = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    // (Opcional) Verificar se o organizador é o mesmo que faz a requisição:
    const organizerId = (req as any).user.userId;
    const e = await prisma.event.findUnique({ where: { id } });
        if (!e || e.organizerId !== organizerId) {
            res.status(403).json({ message: 'Permissão negada.' });
            return;
        }

    await prisma.event.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const listMyEvents: RequestHandler = async (req, res, next) => {
  try {
    const organizerId = (req as any).user.userId;

    const events = await prisma.event.findMany({
      where: { organizerId },
      include: {
        subscriptions: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const result = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      location: e.location,
      bannerUrl: e.bannerUrl,
      price: e.price,
      createdAt: e.createdAt,
      subscriptionCount: e.subscriptions.length
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
};
