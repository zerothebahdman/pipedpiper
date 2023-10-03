import { ApiProperty } from '@nestjs/swagger';
import { Company, User } from '@prisma/client';

export class CreateCompanyOnboardingResponse {
  @ApiProperty({ description: 'The company id.' })
  id: string;

  @ApiProperty({
    description: 'Name of company',
    required: true,
    default: 'Test company',
  })
  name: string | null;

  @ApiProperty({
    description: 'Number of users in the company',
    required: true,
    default: 10,
  })
  usersCount: number;

  @ApiProperty({
    description: 'Number of products in the company',
    required: true,
    default: 10,
  })
  productCount: number;
  @ApiProperty({
    description: 'Percentage of company users and product',
    required: true,
    default: 10,
  })
  percentage: number;

  @ApiProperty({
    description: 'Created date of company',
    required: true,
    default: '2021-01-01',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated date of company',
    required: true,
    default: '2021-01-01',
  })
  updatedAt: Date | null;

  @ApiProperty({
    description: 'User account',
    required: true,
  })
  user: User;

  static fromEntity(entity: Company & { user: User }) {
    const it = new CreateCompanyOnboardingResponse();
    it.id = entity.id;
    it.name = entity.name;
    it.usersCount = entity.usersCount;
    it.productCount = entity.productsCount;
    it.percentage = entity.percentage;
    it.createdAt = entity.createdAt;
    it.updatedAt = entity.updatedAt;
    it.user = entity.user;

    return it;
  }
}
