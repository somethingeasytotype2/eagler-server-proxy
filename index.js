const net = require('net');
const http = require('http');

const TARGET_HOST = 'papers-four.gl.joinmc.link';
const TARGET_PORT = 25565; // Playit's external listener port

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft pipe active.');
});

// Intercept the handshake data streams directly at the base socket level
server.on('upgrade', (req, clientSocket, head) => {
    // Manually pass the exact data request format down the line
    let rawRequest = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (const [key, value] of Object.entries(req.headers)) {
        rawRequest += `${key}: ${value}\r\n`;
    }
    rawRequest += '\r\n';

    // Hook Render up to your Playit data tunnel
    const targetSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
        targetSocket.write(rawRequest);
        if (head && head.length > 0) targetSocket.write(head);

        // Tunnel player data in and out simultaneously without protocol blocks
        clientSocket.pipe(targetSocket);
        targetSocket.pipe(clientSocket);
    });

    targetSocket.on('error', (err) => {
        console.error('Home stream drop:', err.message);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error('Browser client drop:', err.message);
        targetSocket.end();
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Raw connection mapping active!");
});
