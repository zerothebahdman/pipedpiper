import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import config from '../config';
import { JwtStrategy } from './jwt.strategy';
import { MailSenderModule } from '../mail-sender/mail-sender.module';
import { PrismaService } from '../common/services/prisma.service';
import { HelperClass } from 'src/utils/helpers';
import apiGatewayConfig from 'config/api-gateway.config';

@Module({
  imports: [
    UserModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: apiGatewayConfig().jwt_secret,
      signOptions: {
        expiresIn: config.jwt.expiresIn,
      },
    }),
    MailSenderModule,
  ],
  providers: [AuthService, JwtStrategy, PrismaService, HelperClass],
  controllers: [AuthController],
})
export class AuthModule {}
