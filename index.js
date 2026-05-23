const net = require('net');
const http = require('http');

const TARGET_HOST = 'slacked-segment-turkey.ngrok-free.dev';
const TARGET_PORT = 80;

// Create a bare TCP server instead of an HTTP web server
const server = http.createServer((req, res) => {
    // This just clears regular web traffic hits
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft socket pipeline active.');
});

// Capture raw WebSocket upgrade signals directly at the hardware socket level
server.on('upgrade', (req, clientSocket, head) => {
    // Inject the mandatory ngrok bypass headers into the raw text request block
    req.headers['host'] = TARGET_HOST;
    req.headers['ngrok-skip-browser-warning'] = 'true';
    req.headers['User-Agent'] = 'EaglercraftProxy/1.0';

    // Reconstruct the raw HTTP upgrade request text block manually
    let rawRequest = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (const [key, value] of Object.entries(req.headers)) {
        rawRequest += `${key}: ${value}\r\n`;
    }
    rawRequest += '\r\n';

    // Establish a direct TCP stream tunnel from Render directly to your house network
    const targetSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
        // Shovel the raw handshake request data down the pipe
        targetSocket.write(rawRequest);
        if (head && head.length > 0) targetSocket.write(head);

        // Splice the incoming and outgoing sockets permanently together with zero logic drops
        clientSocket.pipe(targetSocket);
        targetSocket.pipe(clientSocket);
    });

    // Guard rails against random drops
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
    console.log("Raw TCP stream tunnel successfully established!");
});
