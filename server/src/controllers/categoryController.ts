import { Request, Response } from 'express';
import { CategoryRepository } from '../repositories/categoryRepository';

const repository = new CategoryRepository();

export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await repository.findAll();
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await repository.create(req.body);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const updatedCategory = await repository.update(req.params.id, req.body);
    res.json(updatedCategory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    await repository.delete(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
