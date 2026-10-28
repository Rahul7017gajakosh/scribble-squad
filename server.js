const http = require("http"), fs = require("fs"), path = require("path");
const { WebSocketServer } = require("ws");
const rooms = new Map();
const server = http.createServer((req, res) => {
  fs.readFile(path.join(__dirname, "public", "index.html"), (err, data) => {
    res.writeHead(err ? 500 : 200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(err ? "Error" : data);
  });
});
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws, req) => {
  const code = (new URL(req.url, "http://x").searchParams.get("room") || "x").slice(0, 12);
  if (!rooms.has(code)) rooms.set(code, new Set());
  const room = rooms.get(code);
  if (room.size >= 8) return ws.close();
  room.add(ws);
  ws.on("message", (d) => {
    if (d.length > 4096) return;
    for (const c of room) if (c.readyState === 1) c.send(d.toString());
  });
  ws.on("close", () => { room.delete(ws); if (!room.size) rooms.delete(code); });
});
server.listen(process.env.PORT || 3000, () => console.log("Scribble Squad running"));
