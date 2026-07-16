import { Router } from 'express';
import { TransactionController } from '../controllers/transactionController';

const router = Router();
const transactionController = new TransactionController();

router.get('/', transactionController.getTransactions.bind(transactionController));
router.get('/account/:accountId', transactionController.getTransactionsByAccountId.bind(transactionController));
router.post('/', transactionController.createTransaction.bind(transactionController));
router.put('/:id', transactionController.updateTransaction.bind(transactionController));
router.delete('/:id', transactionController.deleteTransaction.bind(transactionController));

export default router;
