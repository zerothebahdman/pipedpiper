import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { CompanyOnboardingService } from './company-onboarding.service';
import { CreateCompanyOnboardingRequest } from './dto/request/create-company-onboarding.request';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SUCCESS_MESSAGES } from 'src/constant/success-message';
import { CreateCompanyOnboardingResponse } from './dto/response/create-company-onboarding.response';
import { ERROR_MESSAGES } from 'src/constant/error-message';
import { HelperClass } from 'src/common/services/helper.service';
import pick from 'src/utils/pick';
import { JWTAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { UpdateCompanyOnboardingForm } from './dto/request/update-company-onboarding.request';
import { Usr } from 'src/user/user.decorator';
import { AuthUser } from 'src/auth/auth-user';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/role.guard';
import { UploadCompanyLogoForm } from './dto/request/upload-company-logo.form';
import { ImageService } from '../common/services/image.service';

@ApiTags('Company Onboarding')
@Controller('company')
export class CompanyOnboardingController {
  constructor(
    private readonly companyOnboardingService: CompanyOnboardingService,
    private readonly helper: HelperClass,
    private readonly imageService: ImageService,
  ) {}

  /**
   * @description Get all company onboarding, only users with user role can access this endpoint
   */
  @ApiOperation({
    summary:
      'This endpoint is used to create company and it is only accessible to users',
  })
  @Roles('user')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() body: CreateCompanyOnboardingRequest,
    @Usr() user: AuthUser,
  ) {
    const form = CreateCompanyOnboardingRequest.from(body);
    const errors = await CreateCompanyOnboardingRequest.validate(form);
    if (errors) throw new BadRequestException({ message: '', errors });
    const companyExists =
      await this.companyOnboardingService.queryCompanyDetails({
        userId: user.id,
      });
    if (companyExists)
      throw new BadRequestException({
        message: ERROR_MESSAGES.COMPANY_EXISTS,
      });
    const data = await this.companyOnboardingService.create(body, user.id);
    return {
      status: HttpStatus.CREATED,
      message: SUCCESS_MESSAGES.RECORD_SAVED,
      data,
    };
  }

  /**
   * @description Get all company onboarding, only users with admin role can access this endpoint
   */
  @ApiOperation({
    summary:
      'This endpoint is used to get all companies and it is only accessible to admins',
  })
  @Roles('user')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.RECORD_UPDATED,
    type: CreateCompanyOnboardingResponse,
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter companies by user id',
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'orderBy',
    required: false,
  })
  @ApiQuery({
    name: 'populate',
    required: false,
  })
  @Get()
  async findAll(@Query() query: { [key: string]: string }) {
    const isValidId = this.helper.isValidUUID(query?.userId);
    if (query.userId && !isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    const filter = pick(query, ['userId']);
    const options = pick(query, ['page', 'limit', 'orderBy', 'populate']);
    const data = await this.companyOnboardingService.findAll(filter, options);
    return {
      status: HttpStatus.OK,
      message: SUCCESS_MESSAGES.RECORD_RETRIEVED,
      data,
    };
  }

  @ApiOperation({
    summary:
      'This endpoint is used to compare two companies and it is only accessible to admins',
  })
  @Roles('user')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.RECORD_UPDATED,
    type: CreateCompanyOnboardingResponse,
  })
  @Get('/compare/:firstCompanyId/:secondCompanyId')
  async compareTwoUsersCompany(
    @Param('firstCompanyId') firstCompanyId: string,
    @Param('secondCompanyId') secondCompanyId: string,
  ) {
    let isValidId = this.helper.isValidUUID(firstCompanyId);
    console.log({ isValidId });
    if (firstCompanyId && !isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    isValidId = this.helper.isValidUUID(secondCompanyId);
    if (secondCompanyId && !isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    const firstCompany = await this.companyOnboardingService.findOne(
      firstCompanyId,
    );
    if (!firstCompany)
      throw new NotFoundException({
        message: ERROR_MESSAGES.DATA_NOT_FOUND,
      });
    const secondCompany = await this.companyOnboardingService.findOne(
      secondCompanyId,
    );
    if (!secondCompany)
      throw new NotFoundException({
        message: ERROR_MESSAGES.DATA_NOT_FOUND,
      });

    const message = `${firstCompany.name} has ${
      firstCompany.usersCount > secondCompany.usersCount ? `more` : `less`
    } users than ${secondCompany.name} and ${firstCompany.productsCount} ${
      firstCompany.productsCount > secondCompany.productsCount ? `more` : `less`
    } products than ${secondCompany.name} and ${firstCompany.percentage}% ${
      firstCompany.percentage > secondCompany.percentage ? `more` : `less`
    } than ${secondCompany.name}, below is the report`;

    return {
      status: HttpStatus.OK,
      report: message,
      data: {
        firstCompany: firstCompany,
        secondCompany: secondCompany,
      },
    };
  }

  @ApiOperation({
    summary:
      'This endpoint is used to get a single company and it is only accessible to admins and users',
  })
  @ApiParam({
    name: 'id',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.RECORD_SAVED,
    type: CreateCompanyOnboardingResponse,
  })
  @UseGuards(JWTAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const isValidId = this.helper.isValidUUID(id);
    if (!isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    const data = await this.companyOnboardingService.findOne(id);
    if (!data)
      throw new NotFoundException({
        message: ERROR_MESSAGES.DATA_NOT_FOUND,
      });
    return {
      status: HttpStatus.OK,
      message: SUCCESS_MESSAGES.RECORD_RETRIEVED,
      data,
    };
  }

  /**
   * @description Get all company onboarding, only users with admin role can access this endpoint
   */
  @Roles('user')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @ApiParam({
    name: 'companyId',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.RECORD_UPDATED,
    type: CreateCompanyOnboardingResponse,
  })
  @ApiOperation({
    summary:
      'This endpoint is used to upload company logo and it is only accessible to admins',
  })
  @Patch('image/:companyId')
  async uploadCompanyLogo(
    @Param('companyId') companyId: string,
    @Body() body: UploadCompanyLogoForm,
  ) {
    const isValidId = this.helper.isValidUUID(companyId);
    if (!isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    const form = UploadCompanyLogoForm.from(body);
    const errors = await UploadCompanyLogoForm.validate(form);
    if (errors) throw new BadRequestException({ message: '', errors });
    const exists = await this.companyOnboardingService.findOne(companyId);
    if (!exists)
      throw new NotFoundException({
        message: ERROR_MESSAGES.DATA_NOT_FOUND,
      });
    const { secure_url } = await this.imageService.uploadBase64File(
      body.companyLogo,
      'pipedpiper-company-logo',
      companyId,
    );
    const data = await this.companyOnboardingService.update(companyId, {
      companyLogo: secure_url,
      name: exists.name,
      usersCount: exists.usersCount,
      productsCount: exists.productsCount,
      percentage: exists.percentage,
    });
    return {
      status: HttpStatus.OK,
      message: SUCCESS_MESSAGES.RECORD_UPDATED,
      data,
    };
  }

  /**
   * @description Get all company onboarding, only users with admin role can access this endpoint
   */
  @ApiOperation({
    summary:
      'This endpoint is used to update company and it is only accessible to admins',
  })
  @UseGuards(JWTAuthGuard)
  @ApiParam({
    name: 'companyId',
    required: true,
  })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.RECORD_UPDATED,
    type: CreateCompanyOnboardingResponse,
  })
  @Patch(':companyId')
  async update(
    @Param('companyId') companyId: string,
    @Body() body: UpdateCompanyOnboardingForm,
  ) {
    const isValidId = this.helper.isValidUUID(companyId);
    if (!isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    const form = UpdateCompanyOnboardingForm.from(body);
    const errors = await UpdateCompanyOnboardingForm.validate(form);
    if (errors) throw new BadRequestException({ message: '', errors });
    const exists = await this.companyOnboardingService.findOne(companyId);
    if (!exists)
      throw new NotFoundException({
        message: ERROR_MESSAGES.DATA_NOT_FOUND,
      });
    const data = await this.companyOnboardingService.update(companyId, body);
    return {
      status: HttpStatus.OK,
      message: SUCCESS_MESSAGES.RECORD_UPDATED,
      data,
    };
  }

  @ApiOperation({
    summary:
      'This endpoint is used to delete company and it is only accessible to admins',
  })
  @Roles('admin')
  @UseGuards(JWTAuthGuard, RolesGuard)
  @ApiParam({
    name: 'companyId',
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: SUCCESS_MESSAGES.RECORD_DELETED,
  })
  @Delete(':companyId')
  async remove(@Param('companyId') companyId: string) {
    const isValidId = this.helper.isValidUUID(companyId);
    if (!isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    const data = await this.companyOnboardingService.findOne(companyId);
    if (!data)
      throw new NotFoundException({
        message: ERROR_MESSAGES.DATA_NOT_FOUND,
      });
    await this.companyOnboardingService.remove(companyId);
    return {
      status: HttpStatus.NO_CONTENT,
      message: SUCCESS_MESSAGES.RECORD_DELETED,
    };
  }
}
