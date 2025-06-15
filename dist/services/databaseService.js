"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabase = createDatabase;
exports.getAllDatabases = getAllDatabases;
exports.getDatabasesByUser = getDatabasesByUser;
exports.getDatabaseById = getDatabaseById;
exports.updateDatabase = updateDatabase;
exports.deleteDatabase = deleteDatabase;
exports.updateDocumentCount = updateDocumentCount;
const database_1 = require("../database");
async function createDatabase(data) {
    return await database_1.prisma.database.create({
        data,
        include: {
            documents: true,
            user: true,
            server: true,
            _count: {
                select: {
                    documents: true,
                },
            },
        },
    });
}
async function getAllDatabases() {
    return await database_1.prisma.database.findMany({
        include: {
            documents: true,
            user: true,
            server: true,
            _count: {
                select: {
                    documents: true,
                },
            },
        },
    });
}
async function getDatabasesByUser(userId) {
    return await database_1.prisma.database.findMany({
        where: { userId },
        include: {
            documents: true,
            user: true,
            server: true,
            _count: {
                select: {
                    documents: true,
                },
            },
        },
    });
}
async function getDatabaseById(id) {
    return await database_1.prisma.database.findUnique({
        where: { id },
        include: {
            documents: true,
            user: true,
            server: true,
            _count: {
                select: {
                    documents: true,
                },
            },
        },
    });
}
async function updateDatabase(id, data) {
    return await database_1.prisma.database.update({
        where: { id },
        data,
        include: {
            documents: true,
            user: true,
            server: true,
            _count: {
                select: {
                    documents: true,
                },
            },
        },
    });
}
async function deleteDatabase(id) {
    return await database_1.prisma.database.delete({
        where: { id },
    });
}
async function updateDocumentCount(databaseId) {
    const count = await database_1.prisma.document.count({
        where: { databaseId },
    });
    return await database_1.prisma.database.update({
        where: { id: databaseId },
        data: { documentCount: count },
    });
}
