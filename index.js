const net = require('net');
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft Cloud Bridge is active via GitHub files.');
});

// Intercept the Eaglercraft game connection
server.on('upgrade', (req, clientSocket, head) => {
    try {
        // Automatically read the text file containing your current home link
        const tunnelData = JSON.parse(fs.readFileSync(path.join(__dirname, 'tunnel.json'), 'utf8'));
        
        const TARGET_HOST = tunnelData.host;
        const TARGET_PORT = parseInt(tunnelData.port, 10);

        console.log(`[ROUTING] Channeling player to active tunnel -> ${TARGET_HOST}:${TARGET_PORT}`);

        let rawRequest = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
        for (const [key, value] of Object.entries(req.headers)) {
            rawRequest += `${key}: ${value}\r\n`;
        }
        rawRequest += '\r\n';

        const targetSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
            targetSocket.write(rawRequest);
            if (head && head.length > 0) targetSocket.write(head);

            clientSocket.pipe(targetSocket);
            targetSocket.pipe(clientSocket);
        });

        targetSocket.on('error', () => clientSocket.end());
        clientSocket.on('error', () => targetSocket.end());
    } catch (err) {
        console.error('Failed to read tunnel config:', err.message);
        clientSocket.end();
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log("File-based bridge is listening on Render!");
});
