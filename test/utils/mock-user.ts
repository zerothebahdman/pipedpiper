import { AccountStatus } from '@prisma/client';
import { AuthUser } from '../../src/auth/auth-user';

export const mockUser = (fields?: Partial<AuthUser>) => {
  return {
    firstName: 'Ahmet',
    middleName: null,
    lastName: 'Uysal',
    avatar: null,
    email: 'auysal16@ku.edu.tr',
    id: '1',
    emailVerified: true,
    password: 'password',
    status: AccountStatus.confirmed,
    ...fields,
  };
};
