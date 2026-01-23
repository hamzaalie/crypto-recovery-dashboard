const { Client } = require('pg');

async function resetDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_FUXrW6mKVEN8@ep-solitary-voice-ahyweh9x-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Drop all enum types
    const enumTypes = [
      'users_role_enum',
      'users_status_enum',
      'wallets_type_enum',
      'wallets_status_enum',
      'cases_status_enum',
      'cases_priority_enum',
      'cases_type_enum',
      'tickets_status_enum',
      'tickets_priority_enum',
      'tickets_category_enum',
      'email_templates_type_enum',
      'audit_logs_action_enum',
    ];

    // Drop tables first
    const tables = [
      'files',
      'settings',
      'audit_logs',
      'email_templates',
      'ticket_messages',
      'tickets',
      'cases',
      'wallets',
      'users',
      'typeorm_metadata',
    ];

    for (const table of tables) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
        console.log(`Dropped table: ${table}`);
      } catch (err) {
        console.log(`Could not drop table ${table}: ${err.message}`);
      }
    }

    for (const enumType of enumTypes) {
      try {
        await client.query(`DROP TYPE IF EXISTS "public"."${enumType}" CASCADE`);
        console.log(`Dropped type: ${enumType}`);
      } catch (err) {
        console.log(`Could not drop type ${enumType}: ${err.message}`);
      }
    }

    console.log('Database reset complete!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

resetDatabase();
