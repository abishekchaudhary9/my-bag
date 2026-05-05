const mysql = require("mysql2/promise");
const env = require("../config/env");

(async () => {
  const c = await mysql.createConnection({
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
    connectTimeout: env.database.connectTimeout,
  });
  
  try {
    await c.query(`CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      link VARCHAR(255) DEFAULT NULL,
      is_read TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);
    
    // Also inject a promotional notification for the test user (user_id = 2)
    await c.query(`INSERT INTO notifications (user_id, title, message, link) VALUES 
      (2, 'Exclusive Offer!', 'Get 20% off all Backpacks this weekend. Use code BACKPACK20 at checkout.', '/shop')`);
    console.log('notifications table created and seeded');
  } catch(e) {
    console.log(e.message);
  }
  
  await c.end();
})();
