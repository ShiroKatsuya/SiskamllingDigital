import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: 'postgres', // Connect to default DB first
    });

    try {
        await client.connect();
        console.log('Connected to postgres database');

        const dbName = process.env.DB_NAME || 'siskamling';
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);

        if (res.rowCount === 0) {
            console.log(`Database ${dbName} not found, creating...`);
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database ${dbName} created`);
        } else {
            console.log(`Database ${dbName} already exists`);
        }

        await client.end();

        // Connect to the new DB to enable PostGIS
        const dbClient = new Client({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            user: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: dbName,
        });

        await dbClient.connect();
        console.log(`Connected to ${dbName} database`);

        await dbClient.query('CREATE EXTENSION IF NOT EXISTS postgis');
        console.log('PostGIS extension enabled');

        await dbClient.end();
    } catch (error) {
        console.error('Error setting up database:', error);
        process.exit(1);
    }
}

bootstrap();
