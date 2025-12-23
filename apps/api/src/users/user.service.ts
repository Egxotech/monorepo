import { PrismaService } from "src/prisma/service";
import * as bcrypt from 'bcrypt'
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        return this.prisma.user.create({
            data: {
                firstName: data.first_name,
                lastName: data.last_name,
                email: data.email,
                name: data.first_name + " " + data.last_name,
                password: hashedPassword
            }
        })
    }

}