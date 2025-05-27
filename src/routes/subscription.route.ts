// src/routes/subscription.routes.ts
import { Router } from 'express';
import { ensureAuth, ensureRole } from '../middlewares/auth.middleware';
import {
    createSubscription,
    listSubscriptionsForEvent,
    deleteSubscription
} from '../controllers/subscription.controller';

const router = Router();

router.post(
    '/events/:id/subscribe',
    ensureAuth,
    ensureRole('PARTICIPANT'),
    createSubscription
);

router.get(
    '/events/:id/subscriptions',
    listSubscriptionsForEvent
);

router.delete(
    '/subscriptions/:id',
    ensureAuth,
    deleteSubscription
);

export default router;
