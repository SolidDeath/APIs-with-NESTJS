import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(config: ConfigService) {
        //calls the constructor of the parent class
        super({
            datasources: {
                db: {
                    url: config.get(
                        'DATABASE_URL',
                    ),
                },
            },
        });
    }
}
