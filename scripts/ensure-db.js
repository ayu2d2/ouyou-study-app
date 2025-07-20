#!/usr/bin/env node

/**
 * Ensure database tables exist for production deployment
 * This script is designed to work with Vercel PostgreSQL databases
 */

console.log('🚀 Ensuring database tables exist...')

async function ensureUserTable() {
  try {
    // Only run in production with PostgreSQL
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.includes('postgres')) {
      console.log('ℹ️  Not a PostgreSQL environment, skipping setup')
      return
    }

    console.log('📡 Checking PostgreSQL database...')
    
    // Use pg library if available, otherwise try with Prisma
    let client
    try {
      const { Client } = require('pg')
      client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
      })
      await client.connect()
      console.log('✅ Connected to PostgreSQL using pg driver')
    } catch (pgError) {
      console.log('⚠️  pg driver not available, trying Prisma...')
      
      try {
        const { PrismaClient } = require('@prisma/client')
        const prisma = new PrismaClient()
        client = {
          query: (sql) => prisma.$executeRawUnsafe(sql),
          end: () => prisma.$disconnect()
        }
        console.log('✅ Connected to PostgreSQL using Prisma')
      } catch (prismaError) {
        console.log('⚠️  Neither pg nor Prisma available, creating table script...')
        
        // Create a SQL script file that can be executed manually
        const fs = require('fs')
        const sqlScript = `
-- Production Database Setup Script
-- Run this SQL on your PostgreSQL database if automatic setup fails

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");
        `
        
        fs.writeFileSync('setup-database.sql', sqlScript.trim())
        console.log('📝 Created setup-database.sql file')
        console.log('ℹ️  Please run this SQL script on your PostgreSQL database manually')
        return
      }
    }
    
    if (client && client.query) {
      // Create User table
      const createUserTable = `
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "totalXP" INTEGER NOT NULL DEFAULT 0,
          "level" INTEGER NOT NULL DEFAULT 1,
          "totalStudyTime" INTEGER NOT NULL DEFAULT 0,
          "totalProblems" INTEGER NOT NULL DEFAULT 0,
          "totalCorrect" INTEGER NOT NULL DEFAULT 0,
          CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "User_email_key" UNIQUE ("email"),
          CONSTRAINT "User_username_key" UNIQUE ("username")
        );
      `
      
      await client.query(createUserTable)
      console.log('✅ User table created/verified')
      
      // Create additional essential tables
      const createFriendshipTable = `
        CREATE TABLE IF NOT EXISTS "Friendship" (
          "id" TEXT NOT NULL,
          "senderId" TEXT NOT NULL,
          "receiverId" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'pending',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Friendship_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Friendship_senderId_receiverId_key" UNIQUE ("senderId", "receiverId")
        );
      `
      
      await client.query(createFriendshipTable)
      console.log('✅ Friendship table created/verified')
      
      await client.end()
    }
    
    console.log('🎉 Database setup completed successfully!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    console.log('ℹ️  This might be expected in some deployment environments')
    console.log('ℹ️  If you see this error in production, manually create the User table:')
    console.log(`
CREATE TABLE "User" (
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
    `)
    // Don't fail the build for database setup issues
    process.exit(0)
  }
}

if (require.main === module) {
  ensureUserTable()
    .then(() => {
      console.log('Database setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Setup script failed:', error)
      process.exit(0) // Don't fail the build
    })
}

module.exports = { ensureUserTable }