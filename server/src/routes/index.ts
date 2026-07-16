import { Router } from 'express';
import companyRoutes from './companyRoutes';
import accountRoutes from './accountRoutes';
import transactionRoutes from './transactionRoutes';
import userRoutes from './userRoutes';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/accounts', accountRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

export default router;
