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
    const id = Number(req.params.id);

    // 1) Extrair apenas os campos válidos do corpo
    const { title, description, location, price } = req.body;

    // 2) Montar o objeto de atualização
    const updateData: any = {
      title,
      description,
      location,
    };

    // Só define price se vier no body e for um número válido
    if (price !== undefined) {
      const parsed = Number(price);
      if (isNaN(parsed)) {
        res.status(400).json({ message: 'O campo price deve ser um número.' });
        return;
      }
      updateData.price = parsed;
    }

    // 3) Se veio arquivo novo, faz upload e atualiza bannerUrl
    if (req.file) {
      updateData.bannerUrl = await uploadToCloudinary(req.file.buffer);
    }

    // 4) Executa o update no Prisma
    const event = await prisma.event.update({
      where: { id },
      data: updateData,
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

export const subscribeEvent: RequestHandler = async (req, res, next) => {
  try {
    const eventId = Number(req.params.id);
    const userId = (req as any).user.userId;

    // 1) Verifica se o evento existe
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      res.status(404).json({ message: 'Evento não encontrado.' });
      return;
    }

    // 2) Checa inscrição duplicada
    const already = await prisma.subscription.findUnique({
      where: {
        eventId_userId: { eventId, userId }
      }
    });
    if (already) {
      res.status(400).json({ message: 'Você já está inscrito neste evento.' });
      return;
    }

    // 3) Cria a inscrição
    const subscription = await prisma.subscription.create({
      data: { eventId, userId }
    });

    res.status(201).json(subscription);
  } catch (err) {
    next(err);
  }
};