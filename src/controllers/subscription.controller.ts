// src/controllers/subscription.controller.ts
import { RequestHandler } from 'express';
import prisma from '../services/prisma';

/**
 * POST /events/:id/subscribe
 * Inscrição simples: só registra eventId e userId
 */
export const createSubscription: RequestHandler = async (req, res, next) => {
    try {
        const eventId = Number(req.params.id);
        const userId = (req as any).user.userId;

        console.log('createSubscription: eventId=', eventId, 'userId=', userId);

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        console.log('createSubscription: fetched event=', event);
        if (!event) {
            res.status(404).json({ message: 'Evento não encontrado.' });
            return;
        }

        const exists = await prisma.subscription.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });
        console.log('createSubscription: existing subscription=', exists);
        if (exists) {
            res.status(400).json({ message: 'Você já está inscrito neste evento.' });
            return;
        }

        const subscription = await prisma.subscription.create({
            data: { eventId, userId }
        });
        console.log('createSubscription: new subscription=', subscription);
        res.status(201).json(subscription);
    } catch (err) {
        console.error('createSubscription error:', err);
        next(err);
    }
};

/**
 * GET /events/:id/subscriptions
 * Lista inscrições de um evento (organizador)
 */
// src/controllers/subscription.controller.ts
/**
 * GET /events/:id/subscriptions
 * Lista todos os participantes inscritos em um evento
 */
export const listSubscriptionsForEvent: RequestHandler = async (req, res, next) => {
    try {
        const eventId = Number(req.params.id);

        if (isNaN(eventId)) {
            return res.status(400).json({ message: 'ID de evento inválido.' });
        }

        // Busca todas as subscriptions para esse eventId, trazendo o usuário completo
        const subs = await prisma.subscription.findMany({
            where: { eventId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Formata a resposta: só os dados de usuário
        const users = subs.map(s => ({
            subscriptionId: s.id,
            userId: s.user.id,
            name: s.user.name,
            email: s.user.email,
            joinedAt: s.createdAt
        }));

        res.json(users);
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /subscriptions/:id
 * Cancela inscrição (participante) ou remove (organizador)
 */
export const deleteSubscription: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const userId = (req as any).user.userId;

        console.log('deleteSubscription: subscriptionId=', id, 'userId=', userId);

        const sub = await prisma.subscription.findUnique({
            where: { id },
            include: { event: true }
        });
        console.log('deleteSubscription: fetched sub=', sub);
        if (!sub) {
            res.status(404).json({ message: 'Inscrição não encontrada.' });
            return;
        }

        if (sub.userId !== userId && sub.event.organizerId !== userId) {
            console.log('deleteSubscription: permission denied: sub.userId=', sub.userId, 'event.organizerId=', sub.event.organizerId);
            res.status(403).json({ message: 'Acesso negado.' });
            return;
        }

        await prisma.subscription.delete({ where: { id } });
        console.log('deleteSubscription: deleted subscription id=', id);
        res.status(204).send();
    } catch (err) {
        console.error('deleteSubscription error:', err);
        next(err);
    }
};
