import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@egxotech/database/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        console.log("Database connected.")
    }

    async onModuleDestroy() {
        await this.$disconnect();
        console.log("Database disconnected.")
    }
}