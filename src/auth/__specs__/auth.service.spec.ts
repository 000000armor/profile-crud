import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenService } from '@token/token.service';
import { USER_REPOSITORY, UserRepository } from '@user/user.repository';
import bcrypt from 'bcrypt';
import { JWT_REFRESH_SECRET } from '@common/constants';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;

  let jwtService: {
    verifyAsync: jest.Mock;
  };
  let tokenService: {
    issueTokens: jest.Mock;
  };

  let configService: {
    getOrThrow: jest.Mock;
  };

  beforeEach(async () => {
    tokenService = {
      issueTokens: jest.fn(),
    };

    userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByLogin: jest.fn(),
      findUsers: jest.fn(),
      softDelete: jest.fn(),
      updateUser: jest.fn(),
    };

    jwtService = {
      verifyAsync: jest.fn(),
    };

    configService = {
      getOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
        {
          provide: USER_REPOSITORY,
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('login: successful login with token issued', async () => {
    const issuedTokens = {
      accessToken: 'access-tooken',
      refreshToken: 'refresh-token',
    };

    const password = await bcrypt.hash('password-hash', 10);

    userRepository.findByLogin.mockResolvedValue({
      id: 'user-id',
      login: 'testuser',
      email: 'test@example.com',
      age: 25,
      description: 'Test user',
      deletedAt: null,
      password,
    });

    tokenService.issueTokens.mockResolvedValue(issuedTokens);

    const result = await service.login({
      login: 'testuser',
      password: 'password-hash',
    });

    expect(result).toEqual(issuedTokens);
  });

  it('login: invalid credentials because password did not match', async () => {
    const password = await bcrypt.hash('password-hash', 10);

    userRepository.findByLogin.mockResolvedValue({
      id: 'user-id',
      login: 'testuser',
      email: 'test@example.com',
      age: 25,
      description: 'Test user',
      deletedAt: null,
      password,
    });

    expect(tokenService.issueTokens).not.toHaveBeenCalled();
    await expect(
      service.login({
        login: 'testuser',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("login: invalid credentials because password user with login doesn't exist ", async () => {
    userRepository.findByLogin.mockResolvedValue(null);

    expect(tokenService.issueTokens).not.toHaveBeenCalled();
    await expect(
      service.login({
        login: 'not-existed',
        password: 'some pass',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('refresh: tokens are successfully issued', async () => {
    const refreshToken = 'valid refresh token';
    const refreshSecret = 'valid refresh secret';

    const successfulPayload = {
      login: 'test login',
      sub: 'test id',
    };
    const issuedTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    configService.getOrThrow.mockReturnValue(refreshSecret);
    jwtService.verifyAsync.mockResolvedValue(successfulPayload);
    userRepository.findById.mockResolvedValue({
      id: 'user-id',
      login: 'testuser',
      email: 'test@example.com',
      age: 25,
      description: 'Test user',
      deletedAt: null,
      password: 'test-password',
    });
    tokenService.issueTokens.mockResolvedValue(issuedTokens);

    const serviceResult = await service.refresh(refreshToken);

    expect(configService.getOrThrow).toHaveBeenCalledWith(JWT_REFRESH_SECRET);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: refreshSecret,
    });

    expect(userRepository.findById).toHaveBeenCalledWith({
      id: successfulPayload.sub,
    });

    expect(serviceResult).toEqual(issuedTokens);

    expect(tokenService.issueTokens).toHaveBeenCalledWith({
      sub: 'user-id',
      login: 'testuser',
    });
  });

  it('refresh: tokens verification error because of invalid token', async () => {
    const refreshToken = 'invalid refresh token';
    const refreshSecret = 'valid refresh secret';

    configService.getOrThrow.mockReturnValue(refreshSecret);

    jwtService.verifyAsync.mockRejectedValue(new Error('verification error'));

    await expect(service.refresh(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: refreshSecret,
    });

    expect(userRepository.findById).not.toHaveBeenCalled();
    expect(tokenService.issueTokens).not.toHaveBeenCalled();
  });

  it('refresh: tokens verification error because of invalid user', async () => {
    const refreshSecret = 'valid refresh secret';
    const refreshToken = 'refresh token';

    const successfulPayload = {
      login: 'test login',
      sub: 'test id',
    };

    configService.getOrThrow.mockReturnValue(refreshSecret);
    jwtService.verifyAsync.mockResolvedValue(successfulPayload);
    userRepository.findById.mockResolvedValue(null);

    await expect(service.refresh(refreshToken)).rejects.toThrow(
      UnauthorizedException,
    );

    expect(configService.getOrThrow).toHaveBeenCalledWith(JWT_REFRESH_SECRET);

    expect(jwtService.verifyAsync).toHaveBeenCalledWith(refreshToken, {
      secret: refreshSecret,
    });

    expect(userRepository.findById).toHaveBeenCalledWith({
      id: successfulPayload.sub,
    });

    expect(tokenService.issueTokens).not.toHaveBeenCalled();
  });
});
