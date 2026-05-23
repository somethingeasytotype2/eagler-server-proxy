const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    // 🌟 Added your exact Playit address!
    target: 'ws://papers-four.gl.joinmc.link', 
    ws: true,
    changeOrigin: true
});

const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

// Forward Eaglercraft game connections as raw WebSocket traffic
server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

// Keep your server alive and log information cleanly
proxy.on('error', (err, req, res) => {
    console.error('Proxy Error Context:', err.message);
    if (res && res.writeHead) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Routing connection...');
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Playit School Proxy is live and tuned to WebSocket data!");
});
