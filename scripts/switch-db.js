const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

function switchDatabase(provider) {
    if (!['postgresql', 'mysql'].includes(provider)) {
        console.error('Invalid provider. Use "postgresql" or "mysql"');
        process.exit(1);
    }

    try {
        let schema = fs.readFileSync(schemaPath, 'utf8');

        // Replace the provider line
        schema = schema.replace(/provider\s*=\s*"(postgresql|mysql)"/, `provider = "${provider}"`);

        fs.writeFileSync(schemaPath, schema);
        console.log(`✅ Database provider switched to: ${provider}`);
        console.log("📝 Don't forget to update your DATABASE_URL environment variable!");

        if (provider === 'postgresql') {
            console.log(
                '🔗 PostgreSQL URL format: postgresql://username:password@localhost:5432/database_name?schema=public',
            );
        } else {
            console.log(
                '🔗 MySQL/MariaDB URL format: mysql://username:password@localhost:3306/database_name',
            );
        }
    } catch (error) {
        console.error('Error updating schema:', error.message);
        process.exit(1);
    }
}

const provider = process.argv[2];
if (!provider) {
    console.log('Usage: node scripts/switch-db.js <postgresql|mysql>');
    process.exit(1);
}

switchDatabase(provider);
