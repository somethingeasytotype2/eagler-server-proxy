const net = require('net');
const http = require('http');

let TARGET_HOST = ''; 
let TARGET_PORT = 0; 

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // Accept and permanently cache incoming tunnel updates from your home script
    if (url.pathname === '/update-tunnel') {
        const newHost = url.searchParams.get('host');
        const newPort = parseInt(url.searchParams.get('port'), 10);
        
        if (newHost && newPort) {
            TARGET_HOST = newHost;
            TARGET_PORT = newPort;
            console.log(`[TUNNEL] Route established -> ${TARGET_HOST}:${TARGET_PORT}`);
            res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            return res.end('Koyeb memory map updated successfully!');
        }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft Cloud Engine Active.');
});

// Channel incoming Eaglercraft WebSockets straight to your active Pinggy link
server.on('upgrade', (req, clientSocket, head) => {
    if (!TARGET_HOST || !TARGET_PORT) {
        console.error('Handshake dropped: Waiting for home PC to ping the cloud.');
        clientSocket.end('HTTP/1.1 503 Service Unavailable\r\n\r\n');
        return;
    }

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
});

server.listen(process.env.PORT || 8080, () => {
    console.log("Koyeb Dynamic Eaglercraft Proxy Initialized!");
});
