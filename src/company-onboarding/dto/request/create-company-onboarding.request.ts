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
  numberOfUsers: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    description: 'Number of products',
    required: true,
  })
  numberOfProducts: number;

  static from(form: CreateCompanyOnboardingRequest) {
    const it = new CreateCompanyOnboardingRequest();
    it.name = form.name;
    it.numberOfUsers = form.numberOfUsers;
    it.numberOfProducts = form.numberOfProducts;

    return it;
  }

  static async validate(form: CreateCompanyOnboardingRequest) {
    const errors = await validate(form);
    if (errors.length) {
      return errors;
    }
  }
}
