const { Client } = require('pg');

// Local PostgreSQL Configuration
// Set DB_PASSWORD environment variable before running:
// Windows: $env:DB_PASSWORD="your_password"; node test-db-connection.js
// Linux/Mac: DB_PASSWORD="your_password" node test-db-connection.js

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: 'advancia_payledger',
  ssl: false
});

async function testConnection() {
  console.log('🔌 Testing Local PostgreSQL Connection...\n');
  
  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to PostgreSQL successfully!\n');
    
    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:');
    console.log('   ' + versionResult.rows[0].version.split(',')[0]);
    console.log('');
    
    // Get database size
    const dbSizeResult = await client.query(
      "SELECT pg_size_pretty(pg_database_size('advancia_payledger')) as size"
    );
    console.log('💾 Database Size:', dbSizeResult.rows[0].size);
    
    // Check current connections
    const connectionsResult = await client.query(
      "SELECT count(*) as active_connections FROM pg_stat_activity WHERE datname = 'advancia_payledger'"
    );
    console.log('🔗 Active Connections:', connectionsResult.rows[0].active_connections);
    
    // Check connection limit
    const limitResult = await client.query(
      "SELECT setting::int as max_connections FROM pg_settings WHERE name = 'max_connections'"
    );
    console.log('⚡ Max Connections:', limitResult.rows[0].max_connections);
    
    // Calculate connection usage
    const activeConnections = parseInt(connectionsResult.rows[0].active_connections);
    const maxConnections = parseInt(limitResult.rows[0].max_connections);
    const usagePercent = ((activeConnections / maxConnections) * 100).toFixed(2);
    
    console.log(`📈 Connection Usage: ${usagePercent}% (${activeConnections}/${maxConnections})`);
    
    if (activeConnections > maxConnections * 0.7) {
      console.log('⚠️  WARNING: Connection usage is high! Consider connection pooling.');
    } else {
      console.log('✅ Connection usage is healthy.');
    }
    
    // Test simple query
    console.log('\n🧪 Testing Simple Query...');
    const testQuery = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful! Server time:', testQuery.rows[0].current_time);
    
    // List existing tables (if any)
    console.log('\n📋 Existing Tables:');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('   No tables found. Database is empty (ready for Prisma migrations).');
    } else {
      tablesResult.rows.forEach(row => {
        console.log('   -', row.table_name);
      });
    }
    
    // Close connection
    await client.end();
    console.log('\n✅ Connection closed successfully');
    console.log('\n🎉 All tests passed! Database is ready to use.');
    
    // Print next steps
    console.log('\n📝 NEXT STEPS:');
    console.log('   1. Run Prisma migrations: npx prisma migrate deploy');
    console.log('   2. Set up connection pooling in your application');
    console.log('   3. Configure environment variables for production');
    console.log('   4. Create application-specific database user (not doadmin)');
    
  } catch (err) {
    console.error('❌ Connection Error:', err.message);
    console.error('\n🔍 Troubleshooting Tips:\n');
    console.error('   1. Ensure PostgreSQL is running locally\n');
    console.error('   2. Verify database credentials are correct\n');
    console.error('   3. Check if database advancia_payledger exists\n');
    console.error('   4. Verify local network connectivity\n');
    console.error('\n📖 Full error details:');
    console.error(err);
    process.exit(1);
  }
}

// Run the test
testConnection();
