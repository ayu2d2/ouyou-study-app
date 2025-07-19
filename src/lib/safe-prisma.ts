/**
 * Safe Prisma client for build-time compatibility
 * This module handles cases where Prisma client is not generated
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let prisma: any;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  console.warn('Prisma client not available during build:', (error as Error).message);
  
  // Create a mock client that throws informative errors
  const createMockMethod = (methodName: string) => {
    return async () => {
      throw new Error(`Database not available: ${methodName} - Prisma client not initialized. Please run 'npm run db:setup' or check your database connection.`);
    };
  };

  prisma = {
    user: {
      findUnique: createMockMethod('user.findUnique'),
      findMany: createMockMethod('user.findMany'),
      create: createMockMethod('user.create'),
      update: createMockMethod('user.update'),
      delete: createMockMethod('user.delete'),
    },
    friendship: {
      findMany: createMockMethod('friendship.findMany'),
      create: createMockMethod('friendship.create'),
      update: createMockMethod('friendship.update'),
      delete: createMockMethod('friendship.delete'),
    },
    passwordResetToken: {
      findUnique: createMockMethod('passwordResetToken.findUnique'),
      create: createMockMethod('passwordResetToken.create'),
      update: createMockMethod('passwordResetToken.update'),
      delete: createMockMethod('passwordResetToken.delete'),
    },
    ranking: {
      findMany: createMockMethod('ranking.findMany'),
    },
    $disconnect: () => Promise.resolve(),
  };
}

export { prisma };
export default prisma;