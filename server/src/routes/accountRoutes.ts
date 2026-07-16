import { Router } from 'express';
import { AccountController } from '../controllers/accountController';

const router = Router();
const accountController = new AccountController();

router.get('/', accountController.getAccounts.bind(accountController));
router.get('/:id', accountController.getAccountById.bind(accountController));
router.post('/', accountController.createAccount.bind(accountController));
router.put('/:id', accountController.updateAccount.bind(accountController));
router.delete('/:id', accountController.deleteAccount.bind(accountController));

export default router;
