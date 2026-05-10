const http = require('http');

function test(path) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let d = '';
      res.on('data', (c) => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          resolve(`[${path}] ${res.statusCode}: ${d.substring(0, 200)}`);
        } catch {
          resolve(`[${path}] ${res.statusCode}: ${d.substring(0, 200)}`);
        }
      });
    }).on('error', (e) => resolve(`[${path}] ERROR: ${e.message}`));
  });
}

async function main() {
  console.log("Products list:", await test('/api/products'));
  console.log("Product detail:", await test('/api/products/atelier-tote'));
  console.log("Coupons:", await test('/api/coupons'));
  console.log("Health:", await test('/api/health'));
}

main().catch(console.error);