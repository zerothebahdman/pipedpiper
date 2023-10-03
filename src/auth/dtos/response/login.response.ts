import { ApiProperty } from '@nestjs/swagger';
import { UserAccountResponse } from './user.response.dto';

export class LoginResponse {
  @ApiProperty({
    description: 'User details',
  })
  user: UserAccountResponse;

  static fromUserEntity(entity: any) {
    const response = new LoginResponse();
    response.user = UserAccountResponse.fromUserAccountEntity(entity);
    return response;
  }
}
