const net = require('net');
const http = require('http');

const TARGET_HOST = 'papers-four.gl.joinmc.link';
// Playit's standard external port for Minecraft Java tunnels is 25565
const TARGET_PORT = 25565; 

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft socket pipeline active via Playit.');
});

// Capture raw WebSocket upgrade signals directly at the hardware socket level
server.on('upgrade', (req, clientSocket, head) => {
    // Reconstruct the raw HTTP upgrade request text block manually
    let rawRequest = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
    for (const [key, value] of Object.entries(req.headers)) {
        rawRequest += `${key}: ${value}\r\n`;
    }
    rawRequest += '\r\n';

    // Establish a direct TCP stream tunnel from Render directly to your Playit tunnel
    const targetSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
        targetSocket.write(rawRequest);
        if (head && head.length > 0) targetSocket.write(head);

        // Splice the incoming and outgoing sockets permanently together with zero logic drops
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
    console.log("Raw TCP stream tunnel successfully established via Playit!");
});
