import {
    Controller,
    Get,
    UseGuards,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    @Get('me')
    // Because JwtGuard is applied to the getMe() method,
    // the user must be authenticated to access this route.
    // The user object is available in the request object because
    // the JwtGuard class extends the PassportStrategy class
    // and the PassportStrategy class appends the user object to the request object.
    getMe(@GetUser() user: User) {
        return user;
    }
}
