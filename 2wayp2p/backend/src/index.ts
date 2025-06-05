import http from "http";
import WebSocket, { WebSocketServer } from "ws";

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200);
    res.end("OK");
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

const wss = new WebSocketServer({ server });

let senderWs: WebSocket | null = null;
let receiverWs: WebSocket | null = null;

wss.on("connection", (ws) => {
  ws.on("error", (error) => console.log(error));

  ws.on("message", (message: any) => {
    message = JSON.parse(message.toString());

    if (message.type === "sender") {
      senderWs = ws;
      console.log("Sender connected");
    } else if (message.type === "receiver") {
      receiverWs = ws;
      console.log("Receiver connected");
    }

    if (senderWs && receiverWs) {
      if (message.type === "create-offer") {
        console.log("Offer received");
        const target = ws === senderWs ? receiverWs : senderWs;
        target.send(JSON.stringify({ type: "create-offer", sdp: message.sdp }));
      }

      if (message.type === "create-answer") {
        console.log("Answer received");
        const target = ws === senderWs ? receiverWs : senderWs;
        target.send(JSON.stringify({ type: "create-answer", sdp: message.sdp }));
      }

      if (message.type === "ice-candidate") {
        console.log("ICE candidate received");
        const target = ws === senderWs ? receiverWs : senderWs;
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

// Use PORT from environment
const PORT = parseInt(process.env.PORT || "8080");
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
