const net = require('net');
const http = require('http');

// Global variables that Render will update dynamically
let TARGET_HOST = 'dzlve-172-59-153-246.run.pinggy-free.link'; 
let TARGET_PORT = 36755; 

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    
    // 🌟 THE HEALING LINK API: Your home computer will talk to this to update the link
    if (url.pathname === '/update-tunnel') {
        const newHost = url.searchParams.get('host');
        const newPort = parseInt(url.searchParams.get('port'), 10);
        
        if (newHost && newPort) {
            TARGET_HOST = newHost;
            TARGET_PORT = newPort;
            console.log(`[SYSTEM] Link updated automatically! New Target -> ${TARGET_HOST}:${TARGET_PORT}`);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            return res.end('Render tracking link successfully updated!');
        }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft Automated Bridge Online.');
});

// Player network data mapping
server.on('upgrade', (req, clientSocket, head) => {
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

    targetSocket.on('error', (err) => {
        console.error('Home stream drop:', err.message);
        clientSocket.end();
    });

    clientSocket.on('error', (err) => {
        console.error('Client browser drop:', err.message);
        targetSocket.end();
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Automated Smart Tracker Proxy loaded onto Render!");
});
