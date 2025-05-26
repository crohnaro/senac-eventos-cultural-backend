// src/controllers/subscription.controller.ts
import { RequestHandler } from 'express';
import prisma from '../services/prisma';


export const createSubscription: RequestHandler = async (req, res, next) => {
    try {
        const eventId = Number(req.params.id);
        const userId = (req as any).user.userId;

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) {
            res.status(404).json({ message: 'Evento não encontrado.' });
            return;
        }

        // 2) Evita duplicata
        const exists = await prisma.subscription.findUnique({
            where: { eventId_userId: { eventId, userId } }
        });
        if (exists) {
            res.status(400).json({ message: 'Você já está inscrito neste evento.' });
            return;
        }

        // 3) Cria inscrição
        const subscription = await prisma.subscription.create({
            data: { eventId, userId }
        });
        res.status(201).json(subscription);
    } catch (err) {
        next(err);
    }
};

export const listSubscriptionsForEvent: RequestHandler = async (req, res, next) => {
    try {
        const eventId = Number(req.params.id);
        const organizerId = (req as any).user.userId;

        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event || event.organizerId !== organizerId) {
            res.status(403).json({ message: 'Acesso negado.' });
            return;
        }


        const subs = await prisma.subscription.findMany({
            where: { eventId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json(
            subs.map(s => ({
                id: s.id,
                userId: s.userId,
                userName: s.user.name,
                userEmail: s.user.email,
                subscribedAt: s.createdAt
            }))
        );
    } catch (err) {
        next(err);
    }
};

export const deleteSubscription: RequestHandler = async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const userId = (req as any).user.userId;

        const sub = await prisma.subscription.findUnique({
            where: { id },
            include: { event: true }
        });
        if (!sub) {
            res.status(404).json({ message: 'Inscrição não encontrada.' });
            return;
        }

        if (sub.userId !== userId && sub.event.organizerId !== userId) {
            res.status(403).json({ message: 'Acesso negado.' });
            return;
        }

        await prisma.subscription.delete({ where: { id } });
        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
