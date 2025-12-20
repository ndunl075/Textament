// Simple script to generate a random secret for CRON_SECRET
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log('\nGenerated CRON_SECRET:');
console.log(secret);
console.log('\nAdd this to your .env.local file as:');
console.log(`CRON_SECRET=${secret}\n`);




