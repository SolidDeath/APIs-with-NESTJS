import {
    Body,
    Controller,
    Get,
    Patch,
    UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { EditUserDto } from './dto';
import { UserService } from './user.service';
import { JwtGuard } from '@/auth/guard';
import { GetUser } from '@/auth/decorator';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
    constructor(
        private userService: UserService,
    ) {}
    @Get('me')
    // Because JwtGuard is applied to the getMe() method,
    // the user must be authenticated to access this route.
    // The user object is available in the request object because
    // the JwtGuard class extends the PassportStrategy class
    // and the PassportStrategy class appends the user object to the request object.
    getMe(@GetUser() user: User) {
        return user;
    }

    @Patch()
    editUser(
        @GetUser('id') userId: number,
        @Body() dto: EditUserDto,
    ) {
        return this.userService.editUser(
            userId,
            dto,
        );
    }
}
