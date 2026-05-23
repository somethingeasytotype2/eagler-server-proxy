const net = require('net');
const http = require('http');

// 🌟 Configured to grab data directly from your Pinggy tunnel assignment
const TARGET_HOST = 'dzlve-172-59-153-246.run.pinggy-free.link';
const TARGET_PORT = 36755; 

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft CGNAT-Bypass Loop Active!');
});

// Capture raw WebSocket data packets directly at the base network level
server.on('upgrade', (req, clientSocket, head) => {
    // Reconstruct the raw HTTP upgrade request packet string
    let rawRequest = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (const [key, value] of Object.entries(req.headers)) {
        rawRequest += `${key}: ${value}\r\n`;
    }
    rawRequest += '\r\n';

    // Bridge Render's instance straight down the outbound Pinggy socket link
    const targetSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
        targetSocket.write(rawRequest);
        if (head && head.length > 0) targetSocket.write(head);

        // Splice client and host packets together cleanly on independent channels
        clientSocket.pipe(targetSocket);
        targetSocket.pipe(clientSocket);
    });

    targetSocket.on('error', (err) => {
        console.error('Home tunnel stream error:', err.message);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error('Client browser stream error:', err.message);
        targetSocket.end();
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("CGNAT-Bypass tunnel mapped successfully to Render!");
});
