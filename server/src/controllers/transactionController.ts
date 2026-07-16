import { Request, Response } from 'express';
import { TransactionRepository } from '../repositories/transactionRepository';

const transactionRepository = new TransactionRepository();

export class TransactionController {
  async getTransactions(req: Request, res: Response) {
    try {
      const transactions = await transactionRepository.findAll();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTransactionsByAccountId(req: Request, res: Response) {
    try {
      const accountId = req.params.accountId as string;
      const transactions = await transactionRepository.findByAccountId(accountId);
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }



  async createTransaction(req: Request, res: Response) {
    try {
      const transactionData = req.body;
      const newTransaction = await transactionRepository.create(transactionData);
      res.status(201).json(newTransaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTransaction(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const transactionData = req.body;
      const updatedTransaction = await transactionRepository.update(id, transactionData);
      res.json(updatedTransaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteTransaction(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      await transactionRepository.delete(id);
      res.json({ message: 'Transaction deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
