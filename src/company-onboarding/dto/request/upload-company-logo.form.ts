import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, validate } from 'class-validator';

export class UploadCompanyLogoForm {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Company logo',
    required: true,
  })
  companyLogo: string;

  static from(form: UploadCompanyLogoForm) {
    const it = new UploadCompanyLogoForm();
    it.companyLogo = form.companyLogo;

    return it;
  }

  static async validate(form: UploadCompanyLogoForm) {
    const errors = await validate(form);
    if (errors.length) {
      return errors;
    }
  }
}
