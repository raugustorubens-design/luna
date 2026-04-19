import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("HTTP OK");
});

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("🔥 RAW HTTP OK", process.env.PORT);
});