import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, validate } from 'class-validator';

export class CreateCompanyOnboardingRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Company name',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of users',
    required: true,
  })
  usersCount: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of products',
    required: true,
  })
  productsCount: number;

  static from(form: CreateCompanyOnboardingRequest) {
    const it = new CreateCompanyOnboardingRequest();
    it.name = form.name;
    it.usersCount = form.usersCount;
    it.productsCount = form.productsCount;

    return it;
  }

  static async validate(form: CreateCompanyOnboardingRequest) {
    const errors = await validate(form);
    if (errors.length) {
      return errors;
    }
  }
}
