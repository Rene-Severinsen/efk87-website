import { PrismaClient } from "../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

import { env } from "../config/env";

type PrismaKnownErrorLike = {
  code?: string;
};

function isPrismaKnownErrorLike(error: unknown): error is PrismaKnownErrorLike {
  return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof (error as PrismaKnownErrorLike).code === "string"
  );
}

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
        async delete({ args, query }) {
          try {
            return await query(args);
          } catch (error: unknown) {
            // P2025: record required for the operation was not found.
            if (isPrismaKnownErrorLike(error) && error.code === "P2025") {
              return null;
            }

            throw error;
          }
        },
        async deleteMany({ args, query }) {
          try {
            return await query(args);
          } catch (error: unknown) {
            if (isPrismaKnownErrorLike(error) && error.code === "P2025") {
              return { count: 0 };
            }

            throw error;
          }
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}