import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {
    ExtractJwt,
    Strategy,
} from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    'jwt',
) {
    constructor(
        config: ConfigService,
        private prisma: PrismaService, // to get information about the user directly from the database
    ) {
        super({
            jwtFromRequest:
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get('JWT_SECRET'),
        });
    }

    // The validate() method is called by Passport after it has decoded the JWT.
    async validate(payload: {
        // the payload is the decoded JWT tok.endsWith(searchString, endPosition)
        sub: number;
        email: string;
    }) {
        const user =
            await this.prisma.user.findUnique({
                where: {
                    id: payload.sub,
                },
            });

        delete user.hash; // remove the hash from the user object

        return user;
    }
}
