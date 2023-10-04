import { Injectable, Logger } from '@nestjs/common';
import { CreateCompanyOnboardingRequest } from './dto/request/create-company-onboarding.request';
import { PrismaService } from 'src/common/services/prisma.service';
import { PaginationService } from '../common/services/paginate.service';
import { Company } from '@prisma/client';
import { UpdateCompanyOnboardingForm } from './dto/request/update-company-onboarding.request';

@Injectable()
export class CompanyOnboardingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}
  async create(body: CreateCompanyOnboardingRequest, actor: string) {
    const percentage = Math.round((body.usersCount / body.productsCount) * 100);
    const data = await this.prisma.company.create({
      data: {
        name: body.name,
        usersCount: body.usersCount,
        productsCount: body.productsCount,
        percentage,
        userId: actor,
      },
    });
    return data;
  }

  async findAll(
    filter: Partial<Company>,
    options: {
      orderBy?: string;
      page?: string;
      limit?: string;
      populate?: string;
    } = {},
    ignorePagination = false,
  ) {
    const data = ignorePagination
      ? await this.prisma.company.findMany({
          where: filter,
          include: {
            user: true,
          },
        })
      : await this.paginationService.paginate<
          Company,
          typeof this.prisma.company
        >(filter, options, this.prisma.company);
    return data;
  }

  async queryCompanyDetails(filter: Partial<Company>) {
    const company = await this.prisma.company.findFirst({
      where: filter,
    });
    return company;
  }

  async findOne(id: string) {
    const data = await this.prisma.company.findUnique({
      where: { id },
    });

    return data;
  }

  update(id: string, body: UpdateCompanyOnboardingForm) {
    const data = this.prisma.company.update({
      where: { id },
      data: body,
    });
    return data;
  }

  remove(id: string) {
    const data = this.prisma.company.delete({
      where: { id },
    });
    return data;
  }
}
