import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validate,
} from 'class-validator';

export class UpdateCompanyOnboardingForm {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Company name',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Number of users',
    required: true,
  })
  numberOfUsers: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  @ApiProperty({
    description: 'Number of products',
    required: true,
  })
  numberOfProducts: number;

  static from(form: UpdateCompanyOnboardingForm) {
    const it = new UpdateCompanyOnboardingForm();
    it.name = form.name;
    it.numberOfUsers = form.numberOfUsers;
    it.numberOfProducts = form.numberOfProducts;

    return it;
  }

  static async validate(form: UpdateCompanyOnboardingForm) {
    const errors = await validate(form);
    if (errors.length) {
      return errors;
    }
  }
}
