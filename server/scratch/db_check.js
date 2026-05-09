const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
  const url = process.env.MYSQL_PUBLIC_URL || 'mysql://root:@localhost:3306/maison_db';
  console.log('Connecting to:', url.replace(/:[^:@]+@/, ':***@'));
  try {
    const connection = await mysql.createConnection(url);
    const [rows] = await connection.execute('SELECT count(*) as count FROM orders');
    console.log('Order count:', rows[0].count);
    const [stats] = await connection.execute('SELECT status, count(*) as count FROM orders GROUP BY status');
    console.log('Status counts:', stats);
    await connection.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
