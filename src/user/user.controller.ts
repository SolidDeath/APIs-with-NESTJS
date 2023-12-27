import {
    Controller,
    Get,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guard';

@Controller('users')
export class UserController {
    @UseGuards(JwtGuard)
    @Get('me')
    // Because JwtGuard is applied to the getMe() method,
    // the user must be authenticated to access this route.
    // The user object is available in the request object because
    // the JwtGuard class extends the PassportStrategy class
    // and the PassportStrategy class appends the user object to the request object.
    getMe(@Req() req: Request) {
        return req.user;
    }
}
