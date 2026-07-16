import { CompanyRepository } from '../repositories/companyRepository';

export class CompanyService {
  private companyRepository: CompanyRepository;

  constructor() {
    this.companyRepository = new CompanyRepository();
  }

  async getAllCompanies() {
    return await this.companyRepository.findAll();
  }

  async getCompanyById(id: string) {
    return await this.companyRepository.findById(id);
  }

  async createCompany(companyData: any) {
    // Generate a simple slug from name if not provided
    if (!companyData.slug && companyData.name) {
      companyData.slug = companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    return await this.companyRepository.create(companyData);
  }

  async updateCompany(id: string, companyData: any) {
    if (!companyData.slug && companyData.name) {
      companyData.slug = companyData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    return await this.companyRepository.update(id, companyData);
  }

  async deleteCompany(id: string) {
    return await this.companyRepository.delete(id);
  }
}
