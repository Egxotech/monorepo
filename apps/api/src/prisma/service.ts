import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@egxotech/database/client'
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(configService: ConfigService) {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (!databaseUrl) {
            throw new Error('DATABASE_URL is not defined in environment variables');
        }

        const pool = new Pool({ connectionString: databaseUrl });
        const adapter = new PrismaPg(pool);
        super({ adapter });
    }

    async onModuleInit() {
        await this.$connect();
        console.log("Database connected.")
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log("Database disconnected.")
    }
}