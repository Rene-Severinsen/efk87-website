import { PrismaClient } from "../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { env } from "../config/env";

const prismaClientSingleton = () => {
  const pool = new pg.Pool({
    connectionString: env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({
    adapter,
    log: ["query", "info", "warn", "error"],
  });

  return client.$extends({
    query: {
      session: {
        async delete({ model, operation, args, query }) {
          try {
            return await query(args);
          } catch (error: any) {
            // P2025: An operation failed because it depends on one or more records that were required but not found.
            if (error.code === 'P2025') {
              return null;
            }
            throw error;
          }
        },
        async deleteMany({ model, operation, args, query }) {
          try {
            return await query(args);
          } catch (error: any) {
            if (error.code === 'P2025') {
              return { count: 0 };
            }
            throw error;
          }
        }
      }
    }
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;
