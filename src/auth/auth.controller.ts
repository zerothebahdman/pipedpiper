import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  CheckEmailRequest,
  CheckEmailResponse,
  LoginRequest,
  LoginResponse,
  ResetPasswordRequest,
  SignupRequest,
} from './dtos';
import { UserService } from '../user/user.service';
import { HelperClass } from '../utils/helpers';
import { EmailService } from '../mail-sender/mail-sender.service';
import { AccountStatus } from '@prisma/client';
import { UserAccountResponse } from './dtos/response/user.response.dto';
import { Response } from 'express';
import { SUCCESS_MESSAGES } from '../constant/success-message';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly helperClass: HelperClass,
    private readonly emailService: EmailService,
  ) {}

  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmailAvailability(
    @Body() checkEmailRequest: CheckEmailRequest,
  ): Promise<CheckEmailResponse> {
    const isAvailable = await this.authService.isEmailAvailable(
      checkEmailRequest.email,
    );
    return new CheckEmailResponse(isAvailable);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User created successfully',
    type: UserAccountResponse,
  })
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupRequest: SignupRequest) {
    const token = this.helperClass.generateRandomString(6, 'num');
    const hashToken = await this.helperClass.hashString(token);
    const data = await this.authService.signup(signupRequest, hashToken);
    await this.emailService.sendVerifyEmailMail(
      signupRequest.firstName,
      signupRequest.email,
      token,
    );
    return {
      status: HttpStatus.CREATED,
      message: 'User created successfully',
      data: UserAccountResponse.fromUserAccountEntity(data),
    };
  }

  @Post('login')
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    type: LoginResponse,
  })
  @ApiOperation({
    summary:
      'For security reasons and best practices, we will not send the access token in the response body, we will send it as a cookie instead and set the cookie as httpOnly, so when you can go ahead and make a request to any protected endpoint, the access token will be sent as a cookie in the request header',
  })
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginRequest: LoginRequest, @Res() res: Response) {
    try {
      const { access_token, user } = await this.authService.login(loginRequest);

      // for security reasons, we will not send the access token in the response body, we will send it as a cookie instead and set the cookie as httpOnly
      res.cookie('__pipedpiper__', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
      });

      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        data: UserAccountResponse.fromUserAccountEntity(user),
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: SUCCESS_MESSAGES.EMAIL_VERIFIED,
    // type: EmailVerifiedResponse,
  })
  @Get('verify')
  async verifyMail(@Query('token') token: string) {
    const hashToken = await this.helperClass.hashString(token);
    await this.authService.verifyEmail(hashToken);
    return {
      statusCode: HttpStatus.OK,
      message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
    };
  }

  @Get('change-email')
  @HttpCode(HttpStatus.OK)
  async changeEmail(@Query('token') token: string): Promise<void> {
    await this.authService.changeEmail(token);
  }

  @Post('forgot-password')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset token sent successfully',
  })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() body: CheckEmailRequest) {
    const user = await this.userService.queryUserDetails({
      email: body.email.toLocaleLowerCase(),
    });
    const token = this.helperClass.generateRandomString(6, 'num');
    const hashToken = await this.helperClass.hashString(token);
    await this.authService.initiateResetPassword(user, hashToken);
    await this.emailService.sendResetPasswordMail(
      `${user.firstName} ${user.lastName}`,
      user.email,
      token,
    );
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordRequest: ResetPasswordRequest,
  ): Promise<void> {
    await this.authService.resetPassword(resetPasswordRequest);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerificationMail(@Body() body: CheckEmailRequest): Promise<void> {
    const user = await this.userService.queryUserDetails({
      email: body.email.toLocaleLowerCase(),
    });
    if (user.status === AccountStatus.confirmed)
      throw new Error(`Oops!, account has already been verified`);
    const token = this.helperClass.generateRandomString(6, 'num');
    const hashToken = await this.helperClass.hashString(token);
    await this.authService.resendVerificationMail(user.id, hashToken);
    await this.emailService.sendVerifyEmailMail(
      `${user.firstName} ${user.lastName}`,
      user.email,
      token,
    );
  }
}
