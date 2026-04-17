import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller.js';

const router = Router();

router.get('/stats', getDashboardStats);

export default router;
