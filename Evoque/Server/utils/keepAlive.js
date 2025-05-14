const https = require('https');

const ping = () => {
    const options = {
        hostname: 'evoqueclothing.vercel.app',
        port: 443,
        path: '/api/health',
        method: 'GET'
    };

    const req = https.request(options, res => {
        console.log(`Health check status: ${res.statusCode}`);
    });

    req.on('error', error => {
        console.error('Health check failed:', error);
    });

    req.end();
};

// Ping every 5 minutes
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
setInterval(ping, PING_INTERVAL);

module.exports = { ping }; 