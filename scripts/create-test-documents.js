#!/usr/bin/env node

/**
 * Document Creation Script for Testing
 * 
 * Creates test documents of different types for processing pipeline testing.
 * 
 * Usage:
 *   node scripts/create-test-documents.js --type=document --file=./test.pdf
 *   node scripts/create-test-documents.js --type=youtube --url=https://youtube.com/watch?v=xyz
 *   node scripts/create-test-documents.js --type=website --url=https://example.com
 *   node scripts/create-test-documents.js --type=all  # Creates one of each type
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Dynamic import for node-fetch (ESM module)
let fetch;
async function getFetch() {
  if (!fetch) {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
  }
  return fetch;
}

const prisma = new PrismaClient();

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const DEFAULT_API_KEY = process.env.TEST_API_KEY || 'gk_test_automation_key';

// Test document configurations
const TEST_DOCUMENTS = {
  document: {
    name: 'Test PDF Document',
    type: 'document',
    subType: 'pdf',
    file: './test-files/sample.pdf',
    content: 'This is a test PDF document for processing pipeline testing.'
  },
  youtube: {
    name: 'Test YouTube Video',
    type: 'youtube',
    subType: 'video',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  website: {
    name: 'Test Website',
    type: 'website',
    subType: 'webpage',
    url: 'https://example.com'
  },
  audio: {
    name: 'Test Audio File',
    type: 'audio',
    subType: 'mp3',
    file: './test-files/sample.mp3',
    content: 'This is a test audio file for processing pipeline testing.'
  },
  video: {
    name: 'Test Video File',
    type: 'video',
    subType: 'mp4',
    file: './test-files/sample.mp4',
    content: 'This is a test video file for processing pipeline testing.'
  }
};

class DocumentCreator {
  constructor() {
    this.useDirectDb = process.env.NODE_ENV === 'test' || process.env.SKIP_AUTH === 'true';
    this.apiKey = DEFAULT_API_KEY;
    this.baseUrl = API_BASE_URL;
    this.createdDocuments = [];
    this.testUserId = null;
    this.testRealmId = null;
  }

  async initialize() {
    console.log('🚀 Initializing Document Creator...');

    // Ensure test files directory exists
    const testFilesDir = path.join(process.cwd(), 'test-files');
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
      console.log('📁 Created test-files directory');
    }

    // Create sample files if they don't exist
    await this.createSampleFiles(testFilesDir);

    if (this.useDirectDb) {
      console.log('🔓 Using direct database access (auth skipped)');
      await this.setupTestUserAndRealm();
    } else {
      // Verify API key exists
      await this.verifyApiKey();
    }
  }

  async createSampleFiles(testFilesDir) {
    const samplePdf = path.join(testFilesDir, 'sample.pdf');
    const sampleMp3 = path.join(testFilesDir, 'sample.mp3');
    const sampleMp4 = path.join(testFilesDir, 'sample.mp4');

    // Create minimal sample files for testing
    if (!fs.existsSync(samplePdf)) {
      fs.writeFileSync(samplePdf, 'Sample PDF content for testing');
      console.log('📄 Created sample.pdf');
    }

    if (!fs.existsSync(sampleMp3)) {
      fs.writeFileSync(sampleMp3, 'Sample MP3 content for testing');
      console.log('🎵 Created sample.mp3');
    }

    if (!fs.existsSync(sampleMp4)) {
      fs.writeFileSync(sampleMp4, 'Sample MP4 content for testing');
      console.log('🎬 Created sample.mp4');
    }
  }

  async setupTestUserAndRealm() {
    try {
      // Find or create a test user
      let testUser = await prisma.user.findFirst({
        where: { email: 'test@example.com' }
      });

      if (!testUser) {
        testUser = await prisma.user.create({
          data: {
            email: 'test@example.com',
            name: 'Test User',
            role: 'USER'
          }
        });
        console.log('👤 Created test user');
      }

      this.testUserId = testUser.id;

      // Find or create a test realm
      let testRealm = await prisma.realm.findFirst({
        where: { name: 'Test Realm' }
      });

      if (!testRealm) {
        testRealm = await prisma.realm.create({
          data: {
            name: 'Test Realm',
            description: 'Test realm for automated testing',
            ownerId: testUser.id
          }
        });
        console.log('🏰 Created test realm');
      }

      this.testRealmId = testRealm.id;
      console.log('✅ Test user and realm ready');
    } catch (error) {
      console.error('❌ Failed to setup test user/realm:', error.message);
      throw error;
    }
  }

  async verifyApiKey() {
    try {
      const fetch = await getFetch();
      const response = await fetch(`${this.baseUrl}/api/v1/documents`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API key verification failed: ${response.status}`);
      }

      console.log('✅ API key verified');
    } catch (error) {
      console.error('❌ API key verification failed:', error.message);
      console.log('💡 Make sure you have a valid API key set in TEST_API_KEY environment variable');
      process.exit(1);
    }
  }

  async createDocument(type, config = {}) {
    console.log(`\n📝 Creating ${type} document...`);

    const docConfig = { ...TEST_DOCUMENTS[type], ...config };

    try {
      let document;

      if (this.useDirectDb) {
        // Direct database creation
        document = await this.createDocumentDirect(docConfig);
      } else {
        // API-based creation
        let response;

        if (docConfig.file && fs.existsSync(docConfig.file)) {
          // File upload
          response = await this.createFileDocument(docConfig);
        } else if (docConfig.url) {
          // URL-based document
          response = await this.createUrlDocument(docConfig);
        } else {
          throw new Error(`Invalid configuration for ${type} document`);
        }

        if (response.document) {
          document = response.document;
        } else {
          throw new Error('No document returned from API');
        }
      }

      this.createdDocuments.push(document);
      console.log(`✅ Created ${type} document: ${document.id}`);
      return document;
    } catch (error) {
      console.error(`❌ Failed to create ${type} document:`, error.message);
      throw error;
    }
  }

  async createFileDocument(config) {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(config.file));
    formData.append('name', config.name);
    formData.append('type', config.type);
    formData.append('subType', config.subType);
    formData.append('processingMode', 'MANUAL');

    const fetch = await getFetch();
    const response = await fetch(`${this.baseUrl}/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  }

  async createDocumentDirect(config) {
    try {
      const document = await prisma.document.create({
        data: {
          name: config.name,
          type: config.type,
          subType: config.subType || 'unknown',
          userId: this.testUserId,
          realmId: this.testRealmId,
          processingMode: 'MANUAL',
          state: 'PENDING'
        },
        include: {
          realm: true,
          user: true
        }
      });

      // If it's a URL-based document, store the URL in metadata or a file record
      if (config.url) {
        await prisma.documentFile.create({
          data: {
            documentId: document.id,
            fileType: 'ORIGINAL_DOCUMENT',
            filename: config.url,
            originalName: config.name,
            filepath: config.url,
            filesize: 0,
            contentType: 'text/url',
            content: config.url,
            metadata: JSON.stringify({ sourceUrl: config.url })
          }
        });
      }

      // If it's a file-based document, create a file record
      if (config.file && fs.existsSync(config.file)) {
        const stats = fs.statSync(config.file);
        await prisma.documentFile.create({
          data: {
            documentId: document.id,
            fileType: 'ORIGINAL_DOCUMENT',
            filename: path.basename(config.file),
            originalName: path.basename(config.file), // Use actual filename instead of config.name
            filepath: config.file,
            filesize: stats.size,
            contentType: this.getContentType(config.file),
            content: config.content || null
          }
        });
      }

      return document;
    } catch (error) {
      console.error('Failed to create document directly:', error.message);
      throw error;
    }
  }

  getContentType(filename) {
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.txt': 'text/plain'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  async createUrlDocument(config) {
    const fetch = await getFetch();
    const response = await fetch(`${this.baseUrl}/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: config.name,
        type: config.type,
        subType: config.subType,
        url: config.url,
        processingMode: 'MANUAL'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  }

  async createAllDocuments() {
    console.log('🔄 Creating all document types...');
    
    const results = {};
    
    for (const [type, config] of Object.entries(TEST_DOCUMENTS)) {
      try {
        results[type] = await this.createDocument(type);
      } catch (error) {
        console.error(`Failed to create ${type} document:`, error.message);
        results[type] = { error: error.message };
      }
    }
    
    return results;
  }

  async cleanup() {
    await prisma.$disconnect();
  }

  getCreatedDocuments() {
    return this.createdDocuments;
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      options[key] = value || true;
    }
  });

  const creator = new DocumentCreator();
  
  try {
    await creator.initialize();
    
    if (options.type === 'all') {
      const results = await creator.createAllDocuments();
      console.log('\n📊 Summary:');
      Object.entries(results).forEach(([type, result]) => {
        if (result.error) {
          console.log(`  ❌ ${type}: ${result.error}`);
        } else {
          console.log(`  ✅ ${type}: ${result.id}`);
        }
      });
    } else if (options.type && TEST_DOCUMENTS[options.type]) {
      const config = {};
      if (options.file) config.file = options.file;
      if (options.url) config.url = options.url;
      if (options.name) config.name = options.name;
      
      await creator.createDocument(options.type, config);
    } else {
      console.log('Usage:');
      console.log('  node scripts/create-test-documents.js --type=document --file=./test.pdf');
      console.log('  node scripts/create-test-documents.js --type=youtube --url=https://youtube.com/watch?v=xyz');
      console.log('  node scripts/create-test-documents.js --type=website --url=https://example.com');
      console.log('  node scripts/create-test-documents.js --type=all');
      console.log('');
      console.log('Available types:', Object.keys(TEST_DOCUMENTS).join(', '));
      process.exit(1);
    }
    
    console.log('\n✅ Document creation completed');
    console.log('📋 Created documents:', creator.getCreatedDocuments().map(d => d.id));
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  } finally {
    await creator.cleanup();
  }
}

if (require.main === module) {
  main();
}

module.exports = { DocumentCreator, TEST_DOCUMENTS };
