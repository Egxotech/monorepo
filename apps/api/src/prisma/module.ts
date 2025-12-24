import { Module, Global } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "./service";

@Global()
@Module({
    imports: [ConfigModule],
    providers: [PrismaService],
    exports: [PrismaService]
})
export class PrismaModule { }