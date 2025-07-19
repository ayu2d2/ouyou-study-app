#!/usr/bin/env node

/**
 * Production migration script for PostgreSQL
 * This script creates the necessary tables in production PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client')

async function createProductionTables() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🚀 Starting production database migration...')
    
    // Create tables using raw SQL for PostgreSQL
    const createUserTable = `
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "totalXP" INTEGER NOT NULL DEFAULT 0,
        "level" INTEGER NOT NULL DEFAULT 1,
        "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
        "totalProblems" INTEGER NOT NULL DEFAULT 0,
        "totalCorrect" INTEGER NOT NULL DEFAULT 0
      );
    `
    
    const createFriendshipsTable = `
      CREATE TABLE IF NOT EXISTS "friendships" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "senderId" TEXT NOT NULL,
        "receiverId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "friendships_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "friendships_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE("senderId", "receiverId")
      );
    `
    
    const createStudiesTable = `
      CREATE TABLE IF NOT EXISTS "studies" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "duration" INTEGER NOT NULL,
        "xpGained" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "studies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `
    
    const createQuestionsTable = `
      CREATE TABLE IF NOT EXISTS "questions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "options" TEXT NOT NULL,
        "correctAnswer" TEXT NOT NULL,
        "explanation" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "difficulty" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `
    
    const createAnswersTable = `
      CREATE TABLE IF NOT EXISTS "answers" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "questionId" TEXT NOT NULL,
        "userAnswer" TEXT NOT NULL,
        "isCorrect" BOOLEAN NOT NULL,
        "timeSpent" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "answers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `
    
    const createStreaksTable = `
      CREATE TABLE IF NOT EXISTS "streaks" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "studyTime" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "streaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE("userId", "date")
      );
    `
    
    // Execute table creation
    await prisma.$executeRawUnsafe(createUserTable)
    console.log('✅ Users table created/verified')
    
    await prisma.$executeRawUnsafe(createFriendshipsTable)
    console.log('✅ Friendships table created/verified')
    
    await prisma.$executeRawUnsafe(createStudiesTable)
    console.log('✅ Studies table created/verified')
    
    await prisma.$executeRawUnsafe(createQuestionsTable)
    console.log('✅ Questions table created/verified')
    
    await prisma.$executeRawUnsafe(createAnswersTable)
    console.log('✅ Answers table created/verified')
    
    await prisma.$executeRawUnsafe(createStreaksTable)
    console.log('✅ Streaks table created/verified')
    
    console.log('🎉 Production database migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// For backward compatibility with existing Prisma migration approach
async function createCompatibilityTables() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🔄 Creating compatibility tables for NextAuth...')
    
    // Create User table (capitalized) as an alias/view for the users table
    const createUserAlias = `
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "totalXP" INTEGER NOT NULL DEFAULT 0,
        "level" INTEGER NOT NULL DEFAULT 1,
        "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
        "totalProblems" INTEGER NOT NULL DEFAULT 0,
        "totalCorrect" INTEGER NOT NULL DEFAULT 0
      );
    `
    
    await prisma.$executeRawUnsafe(createUserAlias)
    console.log('✅ User compatibility table created/verified')
    
  } catch (error) {
    console.error('❌ Compatibility table creation failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  createProductionTables()
    .then(() => createCompatibilityTables())
    .then(() => {
      console.log('Database migration completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Database migration failed:', error)
      process.exit(1)
    })
}

module.exports = { createProductionTables, createCompatibilityTables }