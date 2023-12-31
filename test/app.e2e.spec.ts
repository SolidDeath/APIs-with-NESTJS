import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import {
    INestApplication,
    ValidationPipe,
} from '@nestjs/common';

import { AuthDto } from '@/auth/dto';
import { EditUserDto } from '@/user/dto';
import { PrismaService } from '@/prisma/prisma.service';
import { AppModule } from '@/app.module';

describe('App e2e', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    beforeAll(async () => {
        const moduleRef =
            await Test.createTestingModule({
                imports: [AppModule],
            }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true, // remove all properties that are not in the DTO
            }),
        );
        await app.init();
        await app.listen(3333);

        prisma = app.get(PrismaService);
        await prisma.cleanDb();
        pactum.request.setBaseUrl(
            'http://localhost:3333',
        );
    });

    afterAll(() => {
        app.close();
    });

    describe('Auth', () => {
        const dto: AuthDto = {
            email: 'test@test.test',
            password: 'test',
        };
        describe('Signup', () => {
            it('should fail if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        password: dto.password,
                    })
                    .expectStatus(400);
            });
            it('should fail if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({
                        email: dto.email,
                    })
                    .expectStatus(400);
            });
            it('should fail if no body provided', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody({})
                    .expectStatus(400);
            });
            it('should sign up', () => {
                return pactum
                    .spec()
                    .post('/auth/signup')
                    .withBody(dto)
                    .expectStatus(201);
            });
        });
        describe('Signin', () => {
            it('should fail if email empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({
                        password: dto.password,
                    })
                    .expectStatus(400);
            });
            it('should fail if password empty', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({
                        email: dto.email,
                    })
                    .expectStatus(400);
            });
            it('should fail if no body provided', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody({})
                    .expectStatus(400);
            });
            it('should sign in', () => {
                return pactum
                    .spec()
                    .post('/auth/signin')
                    .withBody(dto)
                    .expectStatus(200)
                    .stores(
                        'userAt',
                        'access_token',
                    );
            });
        });
    });
    describe('User', () => {
        describe('Get me', () => {
            it('should get current user', () => {
                return pactum
                    .spec()
                    .get('/users/me')
                    .withHeaders({
                        Authorization:
                            'Bearer $S{userAt}',
                    })
                    .expectStatus(200);
            });
        });
        describe('Update current user', () => {
            it('should edit the user', () => {
                const dto: EditUserDto = {
                    firstName: 'testchan',
                    email: 'test1@test.test',
                };
                return pactum
                    .spec()
                    .patch('/users')
                    .withHeaders({
                        Authorization:
                            'Bearer $S{userAt}',
                    })
                    .withBody(dto)
                    .expectStatus(200)
                    .expectBodyContains(
                        dto.firstName,
                    )
                    .expectBodyContains(
                        dto.email,
                    );
            });
        });
    });
    describe('Bookmarks', () => {
        describe('Create bookmark', () => {});
        describe('Get bookmarks', () => {});
        describe('Get bookmark by id', () => {});
        describe('Edit bookmark by id', () => {});
        describe('Delete bookmark', () => {});
    });
    it.todo('should pass');
});
