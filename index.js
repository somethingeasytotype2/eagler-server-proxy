const http = require('http');

const TARGET_HOST = 'slacked-segment-turkey.ngrok-free.dev';
const TARGET_PORT = 80;

const server = http.createServer((req, res) => {
    // Standard HTTP request forwarding
    const options = {
        hostname: TARGET_HOST,
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': TARGET_HOST,
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'EaglercraftProxy/1.0'
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('HTTP Proxy Error:', err.message);
        if (!res.headersSent) {
            res.writeHead(502, { 'Content-Type': 'text/plain' });
            res.end('Connecting to home network pipeline...');
        }
    });

    req.pipe(proxyReq, { end: true });
});

// Fixed Native WebSocket Handshake Upgrading
server.on('upgrade', (req, socket, head) => {
    const options = {
        hostname: TARGET_HOST,
        port: TARGET_PORT,
        path: req.url,
        method: req.method,
        headers: {
            ...req.headers,
            'host': TARGET_HOST,
            'ngrok-skip-browser-warning': 'true',
            'User-Agent': 'EaglercraftProxy/1.0'
        }
    };

    const proxyReq = http.request(options);
    
    proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
        // Construct standard-compliant raw headers
        let responseHeaders = 'HTTP/1.1 101 Switching Protocols\r\n';
        for (const [key, value] of Object.entries(proxyRes.headers)) {
            responseHeaders += `${key}: ${value}\r\n`;
        }
        responseHeaders += '\r\n';

        socket.write(responseHeaders);
        proxySocket.write(proxyHead);

        // 🌟 FIX: Split data routing safely onto independent lines to prevent data drops
        proxySocket.pipe(socket);
        socket.pipe(proxySocket);
    });

    proxyReq.on('error', (err) => {
        console.error('WebSocket Upgrade Error:', err.message);
        socket.end('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    });

    proxyReq.end();
});

server.listen(process.env.PORT || 3000, () => {
    console.log("School-bypass proxy is fully operational via native streams!");
});
