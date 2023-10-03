import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { DeepMockProxy } from 'jest-mock-extended/lib/Mock';
import { UserService } from './user.service';
import { PrismaService } from '../common/services/prisma.service';
import { mockUser } from '../../test/utils/mock-user';

describe('UserService', () => {
  let service: UserService;
  let spyPrismaService: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useFactory: () => mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    spyPrismaService = module.get(
      PrismaService,
    ) as DeepMockProxy<PrismaService>;
  });

  describe('getUserEntityById', () => {
    it('should call repository with correct id', async () => {
      const id = '12313242';

      await service.getUserEntityById(id);

      expect(spyPrismaService.user.findUnique).toBeCalledTimes(1);
      expect(spyPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should return the result from repository', async () => {
      const userId = '123123';
      const user = mockUser({ id: userId });

      spyPrismaService.user.findUnique.mockResolvedValue(user);

      expect(await service.getUserEntityById(userId)).toStrictEqual(user);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
