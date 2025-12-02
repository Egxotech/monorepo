import { PrismaService } from "src/prisma/service";
import { CreateUserDto } from "./dtos";
import * as bcrypt from 'bcrypt'
import { Injectable } from "@nestjs/common";

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(data.password, 10)
        return this.prisma.user.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                name: data.firstName + " " + data.lastName,
                password: hashedPassword
            }
        })
    }

}