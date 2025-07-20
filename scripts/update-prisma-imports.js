#!/usr/bin/env node

/**
 * Script to update all API routes to use safe-prisma
 */

const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function updateFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already using safe-prisma
  if (content.includes('@/lib/safe-prisma')) {
    return false;
  }
  
  // Replace Prisma imports
  let newContent = content.replace(
    /import { PrismaClient } from '@prisma\/client'\s*\n\s*const prisma = new PrismaClient\(\)/g,
    'import { prisma } from \'@/lib/safe-prisma\''
  );
  
  // Also handle standalone imports
  newContent = newContent.replace(
    /import { PrismaClient } from '@prisma\/client'/g,
    'import { prisma } from \'@/lib/safe-prisma\''
  );
  
  // Remove standalone prisma initialization
  newContent = newContent.replace(
    /const prisma = new PrismaClient\(\)/g,
    '// Using shared prisma instance from safe-prisma'
  );
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      updateFile(filePath);
    }
  }
}

console.log('Updating API routes to use safe-prisma...');
processDirectory(apiDir);
console.log('Done!');