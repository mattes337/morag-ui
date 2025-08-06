import { prisma } from '../database';

async function main() {
    console.log('Starting database seed...');

    // Clear existing data first
    await prisma.job.deleteMany();
    await prisma.apiKey.deleteMany();
    await prisma.document.deleteMany();
    await prisma.realm.deleteMany();
    await prisma.databaseServer.deleteMany();
    await prisma.userSettings.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleared existing data');

    // Create a default user
    const user = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: 'ADMIN',
        },
    });

    console.log('Created user:', user);

    // Create user settings
    await prisma.userSettings.create({
        data: {
            userId: user.id,
            theme: 'LIGHT',
            language: 'en',
            notifications: true,
            autoSave: true,
        },
    });

    // Create sample database servers first
    const server1 = await prisma.databaseServer.create({
        data: {
            name: 'Primary Qdrant',
            type: 'QDRANT',
            host: 'localhost',
            port: 6333,
            collection: 'documents',
            isActive: true,
            userId: user.id,
        },
    });

    const server2 = await prisma.databaseServer.create({
        data: {
            name: 'Neo4j Knowledge Graph',
            type: 'NEO4J',
            host: 'localhost',
            port: 7687,
            username: 'neo4j',
            database: 'neo4j',
            isActive: false,
            userId: user.id,
        },
    });

    console.log('Created database servers:', { server1, server2 });

    // Create sample realms
    const realm1 = await prisma.realm.create({
        data: {
            name: 'Research Papers',
            description: 'Academic papers and research documents',
            domain: 'academic',
            documentCount: 0,
            ownerId: user.id,
            ingestionPrompt: 'Process this academic document with focus on research methodologies, findings, and citations.',
            systemPrompt: 'You are an academic research assistant. Provide scholarly information with appropriate citations.',
            extractionPrompt: 'Extract academic entities including authors, institutions, research methodologies, and citations.',
            domainPrompt: 'This knowledge base contains academic research and should maintain scholarly standards.',
            userRealms: {
                create: {
                    userId: user.id,
                    role: 'OWNER'
                }
            }
        },
    });

    const realm2 = await prisma.realm.create({
        data: {
            name: 'Company Knowledge Base',
            description: 'Internal documentation and procedures',
            domain: 'business',
            documentCount: 0,
            ownerId: user.id,
            ingestionPrompt: 'Process this business document with focus on procedures, policies, and organizational information.',
            systemPrompt: 'You are a business intelligence assistant. Provide insights based on business data.',
            extractionPrompt: 'Extract business entities including companies, processes, policies, and stakeholders.',
            domainPrompt: 'This knowledge base contains business information that should be analyzed with appropriate business context.',
            userRealms: {
                create: {
                    userId: user.id,
                    role: 'OWNER'
                }
            }
        },
    });

    console.log('Created realms:', { realm1, realm2 });

    // Create sample documents
    const doc1 = await prisma.document.create({
        data: {
            name: 'Machine Learning Fundamentals.pdf',
            type: 'PDF',
            state: 'INGESTED',
            version: 2,
            chunks: 45,
            quality: 0.92,
            userId: user.id,
            realmId: realm1.id,
        },
    });

    const doc2 = await prisma.document.create({
        data: {
            name: 'AI Ethics Lecture',
            type: 'YouTube',
            state: 'INGESTING',
            version: 1,
            chunks: 0,
            quality: 0,
            userId: user.id,
            realmId: realm1.id,
        },
    });

    const doc3 = await prisma.document.create({
        data: {
            name: 'Company Website Analysis',
            type: 'Website',
            state: 'INGESTED',
            version: 1,
            chunks: 23,
            quality: 0.87,
            userId: user.id,
            realmId: realm2.id,
        },
    });

    console.log('Created documents:', { doc1, doc2, doc3 });

    // Update realm document counts
    await prisma.realm.update({
        where: { id: realm1.id },
        data: { documentCount: 2 },
    });

    await prisma.realm.update({
        where: { id: realm2.id },
        data: { documentCount: 1 },
    });

    // Create sample API keys
    const apiKey1 = await prisma.apiKey.create({
        data: {
            name: 'Production Workflow',
            key: 'mk_prod_****************************',
            userId: user.id,
            realmId: realm1.id,
        },
    });

    const apiKey2 = await prisma.apiKey.create({
        data: {
            name: 'Development Environment',
            key: 'mk_dev_****************************',
            userId: user.id,
            realmId: realm2.id,
        },
    });

    console.log('Created API keys:', { apiKey1, apiKey2 });

    // Create sample jobs
    const job1 = await prisma.job.create({
        data: {
            documentId: doc1.id,
            documentName: doc1.name,
            documentType: doc1.type,
            userId: user.id,
            realmId: realm1.id,
            status: 'FINISHED',
            percentage: 100,
            summary: 'Document successfully ingested with 45 chunks',
            endDate: new Date(),
        },
    });

    const job2 = await prisma.job.create({
        data: {
            documentId: doc2.id,
            documentName: doc2.name,
            documentType: doc2.type,
            userId: user.id,
            realmId: realm1.id,
            status: 'PROCESSING',
            percentage: 65,
            summary: 'Extracting audio and generating transcripts',
        },
    });

    console.log('Created jobs:', { job1, job2 });

    console.log('Database seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
