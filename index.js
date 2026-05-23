const http = require('http');
const WebSocket = require('ws');
const net = require('net');

// 🌟 YOUR SQUIDSERVERS HOME CONFIGURATION
const HOME_PLAYIT_HOST = 'papers-four.gl.joinmc.link';
const HOME_PLAYIT_PORT = 25565; 

// Create a basic HTTP server base
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Eaglercraft Cloud Bridge is Online!');
});

// Create a clean, compliant cloud WebSocket server for your friends to hit
const wss = new WebSocket.Server({ server });

wss.on('connection', (browserSocket, req) => {
    console.log('Player connecting from school client...');

    // Bridge the browser traffic directly down a clean TCP link into your home PC
    const homeSocket = net.connect(HOME_PLAYIT_PORT, HOME_PLAYIT_HOST, () => {
        console.log('Successfully linked school client to home PC!');
    });

    // Send data from browser down to your home PC
    browserSocket.on('message', (message, isBinary) => {
        if (homeSocket.writable) {
            homeSocket.write(isBinary ? message : message.toString());
        }
    });

    // Send data back from home PC straight to the browser
    homeSocket.on('data', (data) => {
        if (browserSocket.readyState === WebSocket.OPEN) {
            browserSocket.send(data, { binary: true });
        }
    });

    // Gracefully handle close/disconnect events
    browserSocket.on('close', () => {
        homeSocket.end();
    });

    homeSocket.on('end', () => {
        browserSocket.close();
    });

    browserSocket.on('error', (err) => console.error('Browser connection error:', err.message));
    homeSocket.on('error', (err) => console.error('Home server routing error:', err.message));
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Eaglercraft Cloud Bridge successfully listening on Render port 3000!");
});
