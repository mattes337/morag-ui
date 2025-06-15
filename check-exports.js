import * as service from './lib/services/databaseService.js';
console.log('Exports:', Object.keys(service));
console.log('updateDocumentCount:', typeof service.updateDocumentCount);
console.log('updateDocumentCount exists:', 'updateDocumentCount' in service);