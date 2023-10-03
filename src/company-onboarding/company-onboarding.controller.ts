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
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SUCCESS_MESSAGES } from 'src/constant/success-message';
import { CreateCompanyOnboardingResponse } from './dto/response/create-company-onboarding.response';
import { ERROR_MESSAGES } from 'src/constant/error-message';
import { HelperClass } from 'src/common/services/helper.service';
import pick from 'src/utils/pick';
import { JWTAuthGuard } from 'src/security/guards/jwt-auth.guard';
import { UpdateCompanyOnboardingForm } from './dto/request/update-company-onboarding.request';
import { Usr } from 'src/user/user.decorator';
import { AuthUser } from 'src/auth/auth-user';

@ApiTags('Company Onboarding')
@Controller('company')
export class CompanyOnboardingController {
  constructor(
    private readonly companyOnboardingService: CompanyOnboardingService,
    private readonly helper: HelperClass,
  ) {}

  @UseGuards(JWTAuthGuard)
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

  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.RECORD_UPDATED,
    type: CreateCompanyOnboardingResponse,
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'user_id',
    required: false,
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
  @UseGuards(JWTAuthGuard)
  @Get()
  async findAll(@Query() query: { [key: string]: string }) {
    const isValidId = this.helper.isValidUUID(query?.user_id);
    if (query.user_id && !isValidId)
      throw new BadRequestException({
        message: ERROR_MESSAGES.INVALID_UUID,
      });
    const filter = pick(query, ['user_id']);
    const options = pick(query, ['page', 'limit', 'orderBy', 'populate']);
    const data = await this.companyOnboardingService.findAll(filter, options);
    return {
      status: HttpStatus.OK,
      message: SUCCESS_MESSAGES.RECORD_RETRIEVED,
      data,
    };
  }

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
  @UseGuards(JWTAuthGuard)
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
