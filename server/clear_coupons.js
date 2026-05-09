const pool = require('./src/config/database');
async function clear() {
  try {
    await pool.query('DELETE FROM coupons');
    console.log('All coupons cleared');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
clear();
