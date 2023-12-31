import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { nanoid } from 'nanoid';
import { AccountStatus, Prisma } from '@prisma/client';
import { UserService } from '../user/user.service';
import { JwtPayload } from '../security/jwt-payload';
import {
  ChangeEmailRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignupRequest,
} from './dtos';
import { AuthUser } from './auth-user';
import { PrismaService } from '../common/services/prisma.service';
import { UserAccountResponse } from './dtos/response/user.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupRequest: SignupRequest, token: string) {
    try {
      const role = await this.prisma.roles.findFirst({
        where: { title: signupRequest.role || 'user' },
      });
      if (!role) throw new BadRequestException('Role not found');
      const user = await this.prisma.user.create({
        data: {
          email: signupRequest.email.toLowerCase(),
          password: await bcrypt.hash(signupRequest.password, 14),
          firstName: signupRequest.firstName,
          lastName: signupRequest.lastName,
          middleName: signupRequest.middleName,
          rolesId: role.id,
          emailVerification: {
            create: {
              token,
            },
          },
        },
        select: null,
      });
      return user;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          // unique constraint
          throw new BadRequestException('Username or email already exists');
        } else throw e;
      } else throw e;
    }
  }

  async resendVerificationMail(userId: string, token: string): Promise<void> {
    // delete old email verification tokens if exist
    const deletePrevEmailVerificationIfExist =
      this.prisma.emailVerification.deleteMany({
        where: { userId },
      });

    const createEmailVerification = this.prisma.emailVerification.create({
      data: {
        userId,
        token,
      },
      select: null,
    });

    await this.prisma.$transaction([
      deletePrevEmailVerificationIfExist,
      createEmailVerification,
    ]);
  }

  async verifyEmail(token: string): Promise<void> {
    const emailVerification = await this.prisma.emailVerification.findUnique({
      where: { token },
    });

    if (
      emailVerification !== null &&
      emailVerification.validUntil > new Date()
    ) {
      await this.prisma.user.update({
        where: { id: emailVerification.userId },
        data: {
          emailVerified: true,
          status: AccountStatus.confirmed,
        },
        select: null,
      });
    } else {
      Logger.log(`Verify email called with invalid email token ${token}`);
      throw new NotFoundException();
    }
  }

  async sendChangeEmailMail(
    changeEmailRequest: ChangeEmailRequest,
    userId: string,
    // name: string,
    // oldEmail: string,
  ): Promise<void> {
    const emailAvailable = await this.isEmailAvailable(
      changeEmailRequest.newEmail,
    );
    if (!emailAvailable) {
      Logger.log(
        `User with id ${userId} tried to change its email to already used ${changeEmailRequest.newEmail}`,
      );
      throw new ConflictException();
    }

    const deletePrevEmailChangeIfExist = this.prisma.emailChange.deleteMany({
      where: { userId },
    });

    const token = nanoid();

    const createEmailChange = this.prisma.emailChange.create({
      data: {
        userId,
        token,
        newEmail: changeEmailRequest.newEmail,
      },
      select: null,
    });

    await this.prisma.$transaction([
      deletePrevEmailChangeIfExist,
      createEmailChange,
    ]);

    // await this.emailService.sendChangeEmailMail(name, oldEmail, token);
  }

  async changeEmail(token: string): Promise<void> {
    const emailChange = await this.prisma.emailChange.findUnique({
      where: { token },
    });

    if (emailChange !== null && emailChange.validUntil > new Date()) {
      await this.prisma.user.update({
        where: { id: emailChange.userId },
        data: {
          email: emailChange.newEmail.toLowerCase(),
        },
        select: null,
      });
    } else {
      Logger.log(`Invalid email change token ${token} is rejected.`);
      throw new NotFoundException();
    }
  }

  async initiateResetPassword(
    user: UserAccountResponse,
    token: string,
  ): Promise<void> {
    const deletePrevPasswordResetIfExist = this.prisma.passwordReset.deleteMany(
      {
        where: { userId: user.id },
      },
    );

    const createPasswordReset = this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        token,
      },
      select: null,
    });

    await this.prisma.$transaction([
      deletePrevPasswordResetIfExist,
      createPasswordReset,
    ]);
  }

  async resetPassword(resetPasswordRequest: ResetPasswordRequest) {
    const passwordReset = await this.prisma.passwordReset.findFirstOrThrow({
      where: { token: resetPasswordRequest.token },
    });
    if (passwordReset === null)
      throw new NotFoundException('Oops!, invalid token');
    if (passwordReset.validUntil < new Date())
      throw new BadRequestException('Token expired');
    return await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: {
        password: await bcrypt.hash(resetPasswordRequest.newPassword, 10),
      },
      select: null,
    });
  }

  async validateUser(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (user !== null && user.email === payload.email) {
      return user;
    }
    throw new UnauthorizedException();
  }

  async login(loginRequest: LoginRequest) {
    const normalizedIdentifier = loginRequest.identifier.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          {
            email: normalizedIdentifier,
          },
        ],
      },
    });

    if (
      user === null ||
      !bcrypt.compareSync(loginRequest.password, user.password)
    ) {
      throw new UnauthorizedException();
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload);
    return { user, access_token: token };
  }

  async isEmailAvailable(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { email: true },
    });
    return user === null;
  }
}
