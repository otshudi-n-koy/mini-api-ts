import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
});
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Connexion à Postgres réussie');
        const res = await client.query('SELECT * FROM users');
        console.log('📦 Contenu de la table users :');
        console.table(res.rows);
        client.release();
    }
    catch (err) {
        const error = err;
        console.error('❌ Erreur de connexion ou de requête :', error.message);
    }
    finally {
        await pool.end();
    }
}
testConnection();
//# sourceMappingURL=test-db.js.map