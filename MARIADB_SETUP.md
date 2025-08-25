# MariaDB Setup for Morag UI

This document describes the MariaDB configuration added to the Docker Compose setup.

## Configuration

The MariaDB service is configured with the following features:

- **Image**: MariaDB 11.4 (latest stable)
- **Character Set**: UTF8MB4 with Unicode collation
- **Persistent Storage**: Named volume `mariadb_data`
- **Initialization Scripts**: Located in `./mariadb/init/`
- **Performance Tuning**: Optimized for development/small production use

## Environment Variables

The following environment variables control the MariaDB configuration:

```bash
DB_ROOT_PASSWORD=morag_root_password  # Root user password
DB_NAME=morag                         # Database name
DB_USER=morag_user                    # Application user
DB_PASSWORD=morag_password            # Application user password
```

## Database URL

The Prisma DATABASE_URL is automatically constructed from the environment variables:

```bash
DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@mariadb:3306/${DB_NAME}"
```

## Starting the Services

1. **Start all services** (app + MariaDB):
   ```bash
   docker-compose up -d
   ```

2. **Start only MariaDB**:
   ```bash
   docker-compose up -d mariadb
   ```

3. **View logs**:
   ```bash
   docker-compose logs mariadb
   ```

## Database Management

### Connect to MariaDB

```bash
# Using docker exec
docker exec -it morag-mariadb mysql -u root -p

# Using external client (if port 3306 is exposed)
mysql -h localhost -P 3306 -u morag_user -p morag
```

### Run Prisma Migrations

After starting the services, run Prisma migrations:

```bash
# Generate Prisma client
docker exec morag-ui npm run db:generate

# Push schema to database
docker exec morag-ui npm run db:push

# Or run migrations
docker exec morag-ui npm run db:migrate
```

## Data Persistence

- Database data is stored in the `mariadb_data` Docker volume
- Data persists across container restarts
- To reset the database, remove the volume: `docker volume rm morag-ui_mariadb_data`

## Initialization Scripts

Custom SQL scripts can be placed in `./mariadb/init/` and will be executed when the container starts for the first time. The included `01-init.sql` script:

- Creates the database with proper character set
- Grants privileges to the application user
- Sets performance optimizations

## Troubleshooting

### Connection Issues

1. Ensure MariaDB container is running: `docker-compose ps`
2. Check MariaDB logs: `docker-compose logs mariadb`
3. Verify environment variables in `.env` file
4. Test connection: `docker exec morag-ui npx prisma db pull`

### Performance Tuning

The MariaDB service includes basic performance optimizations:
- InnoDB buffer pool: 256MB
- Max connections: 200
- UTF8MB4 character set for full Unicode support

For production use, consider adjusting these values based on your server resources.
