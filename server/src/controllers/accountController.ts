import { Request, Response } from 'express';
import { AccountRepository } from '../repositories/accountRepository';

const accountRepository = new AccountRepository();

export class AccountController {
  async getAccounts(req: Request, res: Response) {
    try {
      const accounts = await accountRepository.findAll();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAccountById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const account = await accountRepository.findById(id);
      res.json(account);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAccount(req: Request, res: Response) {
    try {
      const accountData = req.body;
      const newAccount = await accountRepository.create(accountData);
      res.status(201).json(newAccount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAccount(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const accountData = req.body;
      const updatedAccount = await accountRepository.update(id, accountData);
      res.json(updatedAccount);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteAccount(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await accountRepository.delete(id);
      res.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
