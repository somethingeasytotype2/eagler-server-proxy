const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    target: 'http://papers-four.gl.joinmc.link', // 🌟 Put your playit.gg link here
    ws: true,
    changeOrigin: true
});

const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err.message);
    if (res && res.writeHead) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Establishing backend link...');
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Playit School Proxy is live!");
});
