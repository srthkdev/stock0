#!/usr/bin/env bun
/**
 * Setup script for Appwrite collections
 * Run with: bun run scripts/setup-appwrite.ts
 */

import { Client, Databases, ID } from 'node-appwrite';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Load environment variables from .env.local
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  for (const line of envLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=');
        process.env[key] = value;
      }
    }
  }
}

// Configuration
const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'your_project_id_here';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'your_api_key_here';
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'stock0_db';

class AppwriteSetup {
  private client: Client;
  private databases: Databases;

  constructor() {
    this.client = new Client();
    this.client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID)
      .setKey(APPWRITE_API_KEY);
    
    this.databases = new Databases(this.client);
  }

  async setupDatabase() {
    console.log('🚀 Setting up Appwrite database and collections...\n');

    try {
      // Create database
      await this.createDatabase();
      
      // Create collections
      await this.createPortfoliosCollection();
      await this.createChatMessagesCollection();
      
      console.log('\n✅ Appwrite setup completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('1. Update your backend/.env file with these Appwrite credentials');
      console.log('2. Install backend requirements: cd backend && pip install -r requirements.txt');
      console.log('3. Run the backend: cd backend && python app.py --server');
      
    } catch (error) {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    }
  }

  async createDatabase() {
    try {
      console.log(`📦 Creating database: ${DATABASE_ID}`);
      await this.databases.create(DATABASE_ID, 'Stock Portfolio Database');
      console.log('✅ Database created successfully');
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️ Database already exists, skipping...');
      } else if (error.code === 403 && error.type === 'additional_resource_not_allowed') {
        console.log('⚠️ Database limit reached on your plan. Using existing database...');
        console.log('💡 Please make sure you have a database in your Appwrite project.');
        console.log('   You can either:');
        console.log('   1. Use an existing database ID in your .env.local file');
        console.log('   2. Delete an unused database to make room');
        console.log('   3. Upgrade your Appwrite plan');
        console.log('\n🔄 Continuing with collections setup...');
      } else {
        throw error;
      }
    }
  }

  async createPortfoliosCollection() {
    try {
      console.log('\n📋 Creating portfolios collection...');
      
      const collection = await this.databases.createCollection(
        DATABASE_ID,
        'portfolios',
        'User Portfolios'
      );

      // Create attributes
      const attributes = [
        { key: 'user_id', type: 'string', size: 255, required: true },
        { key: 'name', type: 'string', size: 255, required: true },
        { key: 'description', type: 'string', size: 1000, required: false },
        { key: 'preferences', type: 'string', size: 10000, required: true }, // JSON string
        { key: 'holdings', type: 'string', size: 50000, required: true }, // JSON string
        { key: 'total_invested', type: 'double', required: true },
        { key: 'current_value', type: 'double', required: false },
        { key: 'cash_remaining', type: 'double', required: true },
        { key: 'total_gain_loss', type: 'double', required: false },
        { key: 'total_gain_loss_percent', type: 'double', required: false },
        { key: 'created_at', type: 'datetime', required: true },
        { key: 'updated_at', type: 'datetime', required: true },
        { key: 'is_active', type: 'boolean', required: true }
      ];

      for (const attr of attributes) {
        console.log(`  - Adding attribute: ${attr.key}`);
        
        if (attr.type === 'string') {
          await this.databases.createStringAttribute(
            DATABASE_ID,
            'portfolios',
            attr.key,
            attr.size!,
            attr.required
          );
        } else if (attr.type === 'double') {
          await this.databases.createFloatAttribute(
            DATABASE_ID,
            'portfolios',
            attr.key,
            attr.required
          );
        } else if (attr.type === 'boolean') {
          await this.databases.createBooleanAttribute(
            DATABASE_ID,
            'portfolios',
            attr.key,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await this.databases.createDatetimeAttribute(
            DATABASE_ID,
            'portfolios',
            attr.key,
            attr.required
          );
        }
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create indexes
      console.log('  - Creating indexes...');
      await this.databases.createIndex(
        DATABASE_ID,
        'portfolios',
        'user_id_index',
        'key' as any,
        ['user_id']
      );

      await this.databases.createIndex(
        DATABASE_ID,
        'portfolios',
        'active_portfolios',
        'key' as any,
        ['user_id', 'is_active']
      );

      console.log('✅ Portfolios collection created successfully');
      
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️ Portfolios collection already exists, skipping...');
      } else {
        throw error;
      }
    }
  }

  async createChatMessagesCollection() {
    try {
      console.log('\n💬 Creating chat_messages collection...');
      
      const collection = await this.databases.createCollection(
        DATABASE_ID,
        'chat_messages',
        'Portfolio Chat Messages'
      );

      // Create attributes
      const attributes = [
        { key: 'portfolio_id', type: 'string', size: 255, required: true },
        { key: 'user_id', type: 'string', size: 255, required: true },
        { key: 'role', type: 'string', size: 50, required: true }, // 'user' or 'assistant'
        { key: 'content', type: 'string', size: 10000, required: true },
        { key: 'timestamp', type: 'datetime', required: true },
        { key: 'metadata', type: 'string', size: 5000, required: false } // JSON string
      ];

      for (const attr of attributes) {
        console.log(`  - Adding attribute: ${attr.key}`);
        
        if (attr.type === 'string') {
          await this.databases.createStringAttribute(
            DATABASE_ID,
            'chat_messages',
            attr.key,
            attr.size!,
            attr.required
          );
        } else if (attr.type === 'datetime') {
          await this.databases.createDatetimeAttribute(
            DATABASE_ID,
            'chat_messages',
            attr.key,
            attr.required
          );
        }
        
        // Wait a bit between attribute creations
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create indexes
      console.log('  - Creating indexes...');
      await this.databases.createIndex(
        DATABASE_ID,
        'chat_messages',
        'portfolio_messages',
        'key' as any,
        ['portfolio_id', 'timestamp']
      );

      await this.databases.createIndex(
        DATABASE_ID,
        'chat_messages',
        'user_messages',
        'key' as any,
        ['user_id', 'timestamp']
      );

      console.log('✅ Chat messages collection created successfully');
      
    } catch (error: any) {
      if (error.code === 409) {
        console.log('ℹ️ Chat messages collection already exists, skipping...');
      } else {
        throw error;
      }
    }
  }
}

// Main execution
async function main() {
  console.log('🔧 Appwrite Setup for Stock Portfolio App\n');
  
  // Check environment variables
  if (APPWRITE_PROJECT_ID === 'your_project_id_here' || APPWRITE_API_KEY === 'your_api_key_here') {
    console.log('❌ Please set your Appwrite credentials:');
    console.log('\n1. Create a .env.local file in the frontend directory');
    console.log('2. Copy from env.local.example and fill in your values:');
    console.log('   NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id');
    console.log('   APPWRITE_API_KEY=your_api_key');
    console.log('   NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 (optional)');
    console.log('   NEXT_PUBLIC_APPWRITE_DATABASE_ID=stock0_db (optional)');
    console.log('\nAlternatively, set these as environment variables before running the script.');
    process.exit(1);
  }

  const setup = new AppwriteSetup();
  await setup.setupDatabase();
}

// Run the main function
main().catch(console.error); 