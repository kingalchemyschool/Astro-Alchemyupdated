// Dev proxy: forwards port 5000 → 24827 (astral forge vite dev server)
// Handles both HTTP and WebSocket (WS) upgrades so Vite HMR and
// the Replit cartographer plugin work through the proxy.
import http from "http";
import net from "net";

const TARGET_PORT = 24827;
const LISTEN_PORT = 5000;

const server = http.createServer((req, res) => {
  const options = {
    hostname: "localhost",
    port: TARGET_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxy = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxy.on("error", (err) => {
    res.writeHead(502);
    res.end(`Proxy error: ${err.message}`);
  });

  req.pipe(proxy, { end: true });
});

// Forward WebSocket upgrades (Vite HMR + cartographer sync)
server.on("upgrade", (req, clientSocket, head) => {
  const targetSocket = net.connect(TARGET_PORT, "localhost", () => {
    // Replay the HTTP upgrade request to the target
    const reqLine = `${req.method} ${req.url} HTTP/1.1\r\n`;
    const headers = Object.entries(req.headers)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\r\n");
    targetSocket.write(`${reqLine}${headers}\r\n\r\n`);
    if (head && head.length) targetSocket.write(head);
  });

  targetSocket.on("error", (err) => {
    console.error("WS proxy error:", err.message);
    clientSocket.destroy();
  });

  clientSocket.on("error", () => targetSocket.destroy());

  targetSocket.pipe(clientSocket, { end: true });
  clientSocket.pipe(targetSocket, { end: true });
});

server.listen(LISTEN_PORT, "0.0.0.0", () => {
  console.log(`Proxy: http://0.0.0.0:${LISTEN_PORT} → localhost:${TARGET_PORT} (HTTP + WS)`);
});
