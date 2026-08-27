import { IdGenerator, UUID_GENERATOR } from '@common/id-generator';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '@token/token.service';
import { USER_REPOSITORY, UserRepository } from '@user/user.repository';
import { UserService } from '@user/user.service';
import bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;
  let idGenerator: jest.Mocked<IdGenerator>;
  let tokenService: {
    issueTokens: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByLogin: jest.fn(),
      findUsers: jest.fn(),
      softDelete: jest.fn(),
      updateUser: jest.fn(),
    };

    idGenerator = {
      generate: jest.fn(),
    };

    tokenService = {
      issueTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPOSITORY,
          useValue: repository,
        },
        {
          provide: UUID_GENERATOR,
          useValue: idGenerator,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('findById: returns a user without password and deletedAt', async () => {
    repository.findById.mockResolvedValue({
      id: 'user-id',
      login: 'testuser',
      email: 'test@example.com',
      password: 'password-hash',
      age: 25,
      description: 'Test user',
      deletedAt: null,
    });

    const result = await service.findById('user-id');

    expect(repository.findById).toHaveBeenCalledWith({
      id: 'user-id',
    });

    expect(result).toEqual({
      id: 'user-id',
      login: 'testuser',
      email: 'test@example.com',
      age: 25,
      description: 'Test user',
    });

    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('deletedAt');
  });

  it('findById: throws NotFoundException when user not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById('user-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('softDelete: successful deletion', async () => {
    repository.softDelete.mockResolvedValue(true);
    await service.softDelete('user-id');

    expect(repository.softDelete).toHaveBeenCalledWith('user-id');
  });

  it('softDelete: throws NotFoundException when user not found', async () => {
    repository.softDelete.mockResolvedValue(false);
    await expect(service.softDelete('user-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('createUser: creates a user, hashes password and issues tokens', async () => {
    const dto = {
      login: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      age: 25,
      description: 'Test user',
    };

    idGenerator.generate.mockReturnValue('user-id');

    repository.create.mockResolvedValue({
      id: 'user-id',
      login: dto.login,
      email: dto.email,
      password: 'stored-hash',
      age: dto.age,
      description: dto.description,
      deletedAt: null,
    });

    tokenService.issueTokens.mockResolvedValueOnce({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const result = await service.createUser(dto);

    expect(idGenerator.generate).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledTimes(1);

    const savedUser = repository.create.mock.calls[0][0];

    expect(savedUser).toMatchObject({
      id: 'user-id',
      login: dto.login,
      email: dto.email,
      age: dto.age,
      description: dto.description,
    });

    expect(savedUser.password).not.toBe(dto.password);
    const passwordMatches = await bcrypt.compare(
      dto.password,
      savedUser.password,
    );

    expect(passwordMatches).toBe(true);

    expect(tokenService.issueTokens).toHaveBeenCalledWith({
      sub: 'user-id',
      login: dto.login,
    });

    expect(result).toEqual({
      user: {
        id: 'user-id',
        login: dto.login,
        email: dto.email,
        age: dto.age,
        description: dto.description,
      },
      tokens: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
    });
  });

  it('findUsers: successfully returns found users', async () => {
    repository.findUsers.mockResolvedValue({
      users: [
        {
          id: 'some-id-1',
          login: 'testuser1',
          email: 'test1@example.com',
          password: 'password123',
          age: 25,
          description: 'Test user',
          deletedAt: null,
        },
        {
          id: 'some-id-2',
          login: 'testuser2',
          email: 'test2@example.com',
          password: 'password123',
          age: 25,
          description: 'Test user',
          deletedAt: null,
        },
      ],
      total: 3,
    });

    const result = await service.findUsers({
      page: 2,
      limit: 2,
      login: 'test',
    });

    expect(repository.findUsers).toHaveBeenCalledWith({
      skip: 2,
      take: 2,
      login: 'test',
    });

    expect(result.users).toEqual([
      {
        id: 'some-id-1',
        login: 'testuser1',
        email: 'test1@example.com',
        age: 25,
        description: 'Test user',
      },
      {
        id: 'some-id-2',
        login: 'testuser2',
        email: 'test2@example.com',
        age: 25,
        description: 'Test user',
      },
    ]);
    expect(result.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 3,
      totalPages: 2,
    });
  });
});
