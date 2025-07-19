#!/usr/bin/env node

/**
 * Simple production setup script
 * Creates the User table needed for NextAuth authentication
 */

console.log('🚀 Setting up production database...')

// For production PostgreSQL environments
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgres')) {
  const { Client } = require('pg')
  
  async function setupPostgres() {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    })
    
    try {
      await client.connect()
      console.log('📡 Connected to PostgreSQL database')
      
      // Create User table with basic NextAuth compatibility
      const createUserTable = `
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
      
      await client.query(createUserTable)
      console.log('✅ User table created successfully')
      
    } catch (error) {
      console.error('❌ PostgreSQL setup failed:', error)
      throw error
    } finally {
      await client.end()
    }
  }
  
  setupPostgres()
    .then(() => {
      console.log('🎉 Production database setup completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Setup failed:', error)
      process.exit(1)
    })
    
} else {
  console.log('ℹ️  Skipping production setup - not a PostgreSQL environment')
  process.exit(0)
}