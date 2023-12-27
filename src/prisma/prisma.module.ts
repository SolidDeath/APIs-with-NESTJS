import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

@Global() //makes the PrismaService available everywhere in the app
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
