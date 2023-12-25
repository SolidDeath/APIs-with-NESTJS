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

    signin() {
        return { msg: 'I am logged in' };
    }
}
