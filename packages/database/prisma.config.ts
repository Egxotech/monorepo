import type { PrismaConfig } from "prisma";
import { loadEnv } from "./config/env";
import { env } from "prisma/config";

loadEnv();

export default {
  schema: "./schema.prisma",
  migrations: {
    path: './migrations'
  },
  datasource: {
    url: env("DATABASE_URL")
  }
} satisfies PrismaConfig;