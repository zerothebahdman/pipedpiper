import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus, User } from '@prisma/client';

export class UserAccountResponse {
  @ApiProperty({ description: 'The user account id.' })
  id: string;

  @ApiProperty({ description: 'The user account email.' })
  email: string;

  @ApiProperty({ description: 'The user account creation date.' })
  createdAt: Date; // ISO Date

  @ApiProperty({ description: 'The user account last update date.' })
  updatedAt: Date | null; // ISO Date

  @ApiProperty({ description: 'The user account status.' })
  status: AccountStatus;

  @ApiProperty({
    description: 'The user account first name.',
    required: false,
  })
  firstName: string;

  @ApiProperty({
    description: 'The user account last name.',
    required: false,
  })
  lastName: string;

  @ApiProperty({
    description: 'User role',
    required: false,
  })
  role: string | null;

  static fromUserAccountEntity(entity: User) {
    const response = new UserAccountResponse();
    response.id = entity.id;
    response.firstName = entity.firstName;
    response.lastName = entity.lastName;
    response.email = entity.email;
    response.createdAt = entity.createdAt;
    response.updatedAt = entity.updatedAt;
    response.status = entity.status;
    response.role = entity.rolesId;
    return response;
  }
}
