const http = require('http');
const httpProxy = require('http-proxy');
const { URL } = require('url');

const targetUrl = new URL('http://slacked-segment-turkey.ngrok-free.dev');

const proxy = httpProxy.createProxyServer({
    target: {
        protocol: targetUrl.protocol,
        host: targetUrl.hostname,
        port: targetUrl.port || 80
    },
    ws: true,
    changeOrigin: true
});

// Force-inject the bypass headers into every single request Render sends to Ngrok
proxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
    proxyReq.setHeader('User-Agent', 'EaglercraftProxy/1.0');
});

proxy.on('proxyReqWs', function(proxyReq, req, socket, options, head) {
    proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
    proxyReq.setHeader('User-Agent', 'EaglercraftProxy/1.0');
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
        res.end('Connecting to home network...');
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log("School-bypass proxy is running stable on Render!");
});
