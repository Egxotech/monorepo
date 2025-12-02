import type { PrismaConfig } from "prisma";
import { loadEnv } from "./config/env";

loadEnv();

export default {
  schema: "./schema.prisma",
} satisfies PrismaConfig;