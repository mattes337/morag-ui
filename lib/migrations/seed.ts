import { prisma } from '../database';
import { UserRole, Theme, DocumentState, DatabaseType, JobStatus } from '@prisma/client';

export async function seedDatabase() {
    console.log('Starting database seeding...');

    try {
        // Create a default user
        const user = await prisma.user.upsert({
            where: { email: 'john.doe@example.com' },
            update: {},
            create: {
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: UserRole.ADMIN,
            },
        });

        // Create user settings
        await prisma.userSettings.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                theme: Theme.LIGHT,
                language: 'en',
                notifications: true,
                autoSave: true,
            },
        });

        // Create databases
        const researchDb = await prisma.database.upsert({
            where: { name: 'Research Papers' },
            update: {},
            create: {
                name: 'Research Papers',
                description: 'Academic papers and research documents',
                documentCount: 0,
            },
        });

        const knowledgeDb = await prisma.database.upsert({
            where: { name: 'Company Knowledge Base' },
            update: {},
            create: {
                name: 'Company Knowledge Base',
                description: 'Internal documentation and procedures',
                documentCount: 0,
            },
        });

        // Create documents
        const doc1 = await prisma.document.create({
            data: {
                name: 'Machine Learning Fundamentals.pdf',
                type: 'PDF',
                state: DocumentState.INGESTED,
                version: 2,
                chunks: 45,
                quality: 0.92,
                databaseId: researchDb.id,
            },
        });

        const doc2 = await prisma.document.create({
            data: {
                name: 'AI Ethics Lecture',
                type: 'YouTube',
                state: DocumentState.INGESTING,
                version: 1,
                chunks: 0,
                quality: 0,
                databaseId: researchDb.id,
            },
        });

        const doc3 = await prisma.document.create({
            data: {
                name: 'Company Website Analysis',
                type: 'Website',
                state: DocumentState.INGESTED,
                version: 1,
                chunks: 23,
                quality: 0.87,
                databaseId: knowledgeDb.id,
            },
        });

        // Create API keys
        await prisma.apiKey.create({
            data: {
                name: 'Production Workflow',
                key: 'mk_prod_****************************',
                userId: user.id,
            },
        });

        await prisma.apiKey.create({
            data: {
                name: 'Development Environment',
                key: 'mk_dev_****************************',
                userId: user.id,
            },
        });

        // Create database servers with predefined UUIDs
        const qdrantServerId = '550e8400-e29b-41d4-a716-446655440001';
        const neo4jServerId = '550e8400-e29b-41d4-a716-446655440002';

        await prisma.databaseServer.create({
            data: {
                id: qdrantServerId,
                name: 'Primary Qdrant',
                type: DatabaseType.QDRANT,
                host: 'localhost',
                port: 6333,
                collection: 'documents',
                isActive: true,
                lastConnected: new Date('2024-01-15T10:30:00Z'),
            },
        });

        await prisma.databaseServer.create({
            data: {
                id: neo4jServerId,
                name: 'Neo4j Knowledge Graph',
                type: DatabaseType.NEO4J,
                host: 'localhost',
                port: 7687,
                username: 'neo4j',
                database: 'neo4j',
                isActive: false,
            },
        });

        // Create jobs
        await prisma.job.create({
            data: {
                documentId: doc1.id,
                documentName: doc1.name,
                documentType: doc1.type,
                userId: user.id,
                status: JobStatus.FINISHED,
                percentage: 100,
                summary: 'Document successfully ingested with 45 chunks',
                endDate: new Date('2024-01-10T09:15:00Z'),
            },
        });

        await prisma.job.create({
            data: {
                documentId: doc2.id,
                documentName: doc2.name,
                documentType: doc2.type,
                userId: user.id,
                status: JobStatus.PROCESSING,
                percentage: 65,
                summary: 'Extracting audio and generating transcripts',
            },
        });

        await prisma.job.create({
            data: {
                documentId: doc3.id,
                documentName: doc3.name,
                documentType: doc3.type,
                userId: user.id,
                status: JobStatus.FINISHED,
                percentage: 100,
                summary: 'Website crawled and content extracted successfully',
                endDate: new Date('2024-01-12T11:08:00Z'),
            },
        });

        // Update database document counts
        await prisma.database.update({
            where: { id: researchDb.id },
            data: { documentCount: 2 },
        });

        await prisma.database.update({
            where: { id: knowledgeDb.id },
            data: { documentCount: 1 },
        });

        console.log('Database seeding completed successfully!');
        console.log(`User ID: ${user.id}`);
        console.log(`Research DB ID: ${researchDb.id}`);
        console.log(`Knowledge DB ID: ${knowledgeDb.id}`);
    } catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}

// Run seeding if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}
