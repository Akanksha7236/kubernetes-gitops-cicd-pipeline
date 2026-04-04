const http = require("http");

const port = Number(process.env.PORT || 3000);
const started = Date.now();

const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/healthz") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", uptimeSec: Math.floor((Date.now() - started) / 1000) }));
    return;
  }
  if (req.url === "/ready") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hi Devops Team");
    return;
  }
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(`Demo API is up and running (v1) on port ${port}`);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`listening on ${port}`);
});
