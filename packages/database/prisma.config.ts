import type { PrismaConfig } from "prisma";
import { loadEnv } from "./config/env";

loadEnv();

export default {
  schema: "./schema.prisma",
  migrations: {
    path: './migrations'
  },
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/temp"
  }
} satisfies PrismaConfig;