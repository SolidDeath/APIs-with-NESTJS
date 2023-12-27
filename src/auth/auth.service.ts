import {
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon from 'argon2';

import { AuthDto } from './dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) {}

    async signup(dto: AuthDto) {
        // generate the password hash
        const hash = await argon.hash(
            dto.password,
        );
        try {
            // Save ths new user in the db
            const user =
                await this.prisma.user.create({
                    data: {
                        email: dto.email,
                        hash,
                    },
                });

            return this.signToken(
                user.id,
                user.email,
            );
        } catch (error) {
            if (
                error instanceof
                PrismaClientKnownRequestError
            ) {
                // if is prisma error
                if (error.code === 'P2002') {
                    //Error code defined in prisma docs - duplicate field
                    throw new ForbiddenException(
                        'Credentials are already in use',
                    );
                }
            }
            throw error;
        }
    }

    async signin(dto: AuthDto) {
        // find the user by email
        const user =
            await this.prisma.user.findUnique({
                where: {
                    email: dto.email,
                },
            });
        // if the user does not exist throw an exception
        if (!user) {
            throw new ForbiddenException(
                'Credentials are invalid',
            );
        }
        // compare the password hash
        const pwMatches = await argon.verify(
            user.hash,
            dto.password,
        );

        // if the password is incorrect throw an exception
        if (!pwMatches) {
            throw new ForbiddenException(
                'Credentials are invalid',
            );
        }

        // return the user as a jwt token
        return this.signToken(
            user.id,
            user.email,
        );
    }

    // generate a jwt token based on the user id and email
    async signToken(
        userId: number,
        email: string,
    ): Promise<{ access_token: string }> {
        const payload = {
            sub: userId,
            email: email,
        };
        const secret =
            this.config.get('JWT_SECRET');

        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '1d',
                secret: secret,
            },
        );

        return {
            access_token: token,
        };
    }
}
