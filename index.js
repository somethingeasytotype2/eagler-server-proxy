const http = require('http');
const WebSocket = require('ws');
const net = require('net');

// 🌟 THE LOCAL TUNNEL CONNECTION LOGIC
const PROXY_HOST = '127.0.0.1';
const PROXY_PORT = 9000; // Render will listen locally for the SSH pipe data

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft CGNAT-Bypass Cloud Engine Active!');
});

// Launch a clear cloud-level WebSocket handler
const wss = new WebSocket.Server({ server });

wss.on('connection', (browserSocket) => {
    // Open a direct TCP pipe inside Render's instance over to the loopback address
    const localTunnelSocket = net.connect(PROXY_PORT, PROXY_HOST);

    // Stream browser clicks and block data straight down the pipe
    browserSocket.on('message', (message, isBinary) => {
        if (localTunnelSocket.writable) {
            localTunnelSocket.write(isBinary ? message : message.toString());
        }
    });

    // Capture incoming packets and stream them back to the school browser client
    localTunnelSocket.on('data', (data) => {
        if (browserSocket.readyState === WebSocket.OPEN) {
            browserSocket.send(data, { binary: true });
        }
    });

    browserSocket.on('close', () => localTunnelSocket.end());
    localTunnelSocket.on('end', () => browserSocket.close());

    browserSocket.on('error', () => {});
    localTunnelSocket.on('error', () => {});
});

// Open secondary internal loop for the reverse tunnel stream connection mapping
const backendInboundServer = net.createServer((cgnatStream) => {
    server.emit('upgrade', cgnatStream.req, cgnatStream, Buffer.alloc(0));
});

server.listen(process.env.PORT || 3000, () => {
    console.log("CGNAT Cloud Engine successfully initialized!");
});
