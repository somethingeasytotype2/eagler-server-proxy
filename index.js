const http = require('http');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
    target: 'YOUR_NGROK_ADDRESS_HERE', // Put your http://ngrok-free.app here
    ws: true,
    changeOrigin: true
});

const server = http.createServer((req, res) => {
    proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
    proxy.ws(req, socket, head);
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Proxy is running!");
});
