const net = require('net');
const http = require('http');

// 🌟 CONFIGURATION: Update this with your exact GitHub profile name!
const GITHUB_USERNAME = 'somethingeasytotype2'; 
const REPO_NAME = 'eagler-server-proxy';

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft Live Web Bridge Active.');
});

// Capture raw Eaglercraft browser handshakes
server.on('upgrade', (req, clientSocket, head) => {
    // 🌟 Live Fetch: Force Render to query GitHub's public raw CDN servers for your changing link
    const rawUrl = `http://githubusercontent.com{GITHUB_USERNAME}/${REPO_NAME}/main/tunnel.json`;

    http.get(rawUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        
        res.on('end', () => {
            try {
                const tunnelData = JSON.parse(data);
                const TARGET_HOST = tunnelData.host;
                const TARGET_PORT = parseInt(tunnelData.port, 10);

                console.log(`[ROUTING] Channeling player to live tunnel -> ${TARGET_HOST}:${TARGET_PORT}`);

                let rawRequest = `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`;
                for (const [key, value] of Object.entries(req.headers)) {
                    rawRequest += `${key}: ${value}\r\n`;
                }
                rawRequest += '\r\n';

                // Connect straight down your outbound Pinggy socket stream
                const targetSocket = net.connect(TARGET_PORT, TARGET_HOST, () => {
                    targetSocket.write(rawRequest);
                    if (head && head.length > 0) targetSocket.write(head);

                    clientSocket.pipe(targetSocket);
                    targetSocket.pipe(clientSocket);
                });

                targetSocket.on('error', () => clientSocket.end());
                clientSocket.on('error', () => targetSocket.end());

            } catch (err) {
                console.error('Failed to parse live GitHub text content:', err.message);
                clientSocket.end();
            }
        });
    }).on('error', (err) => {
        console.error('Failed to hit GitHub live CDN:', err.message);
        clientSocket.end();
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Live network data proxy fully live on Render!");
});
