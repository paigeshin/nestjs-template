import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 999999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('asdf@asdf.com', '123123');

    expect(user.password).not.toEqual('asdf');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('asdf@adf.com', 'asdf');
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);

    const asyncTask = service.signup('asdf@asdf.com', 'asdf');
    expect(asyncTask).rejects.toThrowError(BadRequestException);
  });

  it('throws if signin is called with an unused email', () => {
    const asyncTask = service.signin('asdflkj@asdlfkj.com', 'passdflkj');
    expect(asyncTask).rejects.toThrowError(NotFoundException);
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('asdf@asdf.com', 'asdifaiosj');
    const asyncTask = service.signin('asdf@asdf.com', 'asdf123');
    expect(asyncTask).rejects.toThrowError(BadRequestException);
  });

  it('returns a user if correct password is provided', async () => {
    await service.signup('test@test.com', 'mypassword');
    const user = await service.signin('test@test.com', 'mypassword');
    expect(user).toBeDefined();
    // const user = await service.signup('test@test.com', 'mypassword'); // to check hashed password
    // console.log(user);
  });
});
