import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
};

let prisma: PrismaClient;

if (typeof window === 'undefined') {
  let dbUrl = process.env.DATABASE_URL || '';

  if (!dbUrl) {
    console.warn('⚠️ DATABASE_URL is not set. Database queries will fail.');
  }

  // The prisma+postgres:// URL embeds the real postgres URL in a base64 api_key.
  // Extract it so pg.Pool gets a real postgres:// connection string.
  if (dbUrl.startsWith('prisma+postgres://')) {
    try {
      const url = new URL(dbUrl);
      const apiKey = url.searchParams.get('api_key') || '';
      const decoded = JSON.parse(Buffer.from(apiKey, 'base64').toString('utf-8'));
      dbUrl = decoded.databaseUrl || decoded.DATABASE_URL || decoded.databaseurl || dbUrl;
    } catch (e) {
      console.warn('Could not decode prisma+postgres API key, using URL as-is:', e);
    }
  }

  const pool =
  globalForPrisma.pgPool ??
  new pg.Pool({
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,       // 30s — reasonable, not 1ms
    connectionTimeoutMillis: 10000, // 10s to establish a new connection
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle pg client', err);
  });

  const adapter = new PrismaPg(pool);

  prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
    globalForPrisma.pgPool = pool;
  }
} else {
  prisma = {} as any;
}

export { prisma };
export * from '../generated/prisma/client';