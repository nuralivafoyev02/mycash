import { Request, Response, NextFunction } from 'express';
import { CompanyService } from '../services/companyService';

const companyService = new CompanyService();

export class CompanyController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const companies = await companyService.getAllCompanies();
      res.status(200).json({ status: 'success', data: companies });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const company = await companyService.getCompanyById(id as string);
      res.status(200).json({ status: 'success', data: company });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const company = await companyService.createCompany(req.body);
      res.status(201).json({ status: 'success', data: company });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const company = await companyService.updateCompany(id, req.body);
      res.status(200).json({ status: 'success', data: company });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await companyService.deleteCompany(id);
      res.status(200).json({ status: 'success', message: 'Company deleted' });
    } catch (error) {
      next(error);
    }
  }
}
