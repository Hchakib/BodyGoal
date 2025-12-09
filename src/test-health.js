#!/usr/bin/env node

// Script pour tester que tous les services sont en ligne
// Usage: node test-health.js

const http = require('http');

const services = [
  { name: 'API Gateway', port: 3000 },
  { name: 'Auth Service', port: 3001 },
  { name: 'Workouts Service', port: 3002 },
  { name: 'Nutrition Service', port: 3003 },
  { name: 'PR Service', port: 3004 },
  { name: 'Templates Service', port: 3005 },
  { name: 'Chatbot Service', port: 3006 },
];

console.log('🏥 Test de santé des services...\n');

function checkService(service) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: service.port,
      path: '/health',
      method: 'GET',
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${service.name} (port ${service.port}) - OK`);
          resolve(true);
        } else {
          console.log(`❌ ${service.name} (port ${service.port}) - Error ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${service.name} (port ${service.port}) - ${error.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log(`❌ ${service.name} (port ${service.port}) - Timeout`);
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function checkAllServices() {
  const results = [];
  
  for (const service of services) {
    const result = await checkService(service);
    results.push(result);
  }

  const successCount = results.filter(r => r).length;
  const totalCount = services.length;

  console.log(`\n📊 Résultat: ${successCount}/${totalCount} services opérationnels`);

  if (successCount === totalCount) {
    console.log('🎉 Tous les services sont en ligne !');
    process.exit(0);
  } else {
    console.log('⚠️  Certains services ne sont pas accessibles.');
    process.exit(1);
  }
}

checkAllServices();
