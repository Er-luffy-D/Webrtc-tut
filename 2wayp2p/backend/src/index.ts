import http, { IncomingMessage, ServerResponse } from "http";
import WebSocket, { WebSocketServer } from "ws";

// Create HTTP server for health check
const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server });

// Track sender and receiver
let senderWs: WebSocket | null = null;
let receiverWs: WebSocket | null = null;

// Handle WebSocket connections
wss.on("connection", (ws: WebSocket) => {
  ws.on("error", (error) => console.error("WebSocket error:", error));

  ws.on("message", (data: WebSocket.RawData) => {
    let message: any;
    try {
      message = JSON.parse(data.toString());
    } catch (e) {
      console.error("Invalid JSON:", data.toString());
      return;
    }

    if (message.type === "sender") {
      senderWs = ws;
      console.log("Sender connected");
    } else if (message.type === "receiver") {
      receiverWs = ws;
      console.log("Receiver connected");
    }

    if (senderWs && receiverWs) {
      const target = ws === senderWs ? receiverWs : senderWs;

      if (message.type === "create-offer") {
        console.log("Offer received");
        target.send(JSON.stringify({ type: "create-offer", sdp: message.sdp }));
      }

      if (message.type === "create-answer") {
        console.log("Answer received");
        target.send(JSON.stringify({ type: "create-answer", sdp: message.sdp }));
      }

      if (message.type === "ice-candidate") {
        console.log("ICE candidate received");
        target.send(JSON.stringify({ type: "ice-candidate", candidate: message.candidate }));
      }
    }
  });

  ws.on("close", () => {
    if (ws === senderWs) senderWs = null;
    if (ws === receiverWs) receiverWs = null;
    console.log("Client disconnected");
  });
});

// Start server
const PORT = parseInt(process.env.PORT || "8080", 10);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
