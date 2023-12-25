import {
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

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

            delete user.hash; //temp solution

            // return the saved user
            return user;
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

        // return the user
        delete user.hash; //temp solution
        return user;
    }
}
