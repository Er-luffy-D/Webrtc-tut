import WebSocket, { WebSocketServer } from "ws";

// all message types are
// sender,reciever,create-offer,create-answer,ice-candidate

const server = new WebSocketServer({ port: 8080 });
let senderWs: WebSocket | null = null;
let receiverWs: WebSocket | null = null;
server.on("connection", (ws) => {
	ws.on("error", (error) => {
		console.log(error);
	});

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
				if (ws === senderWs) {
					receiverWs.send(JSON.stringify({ type: "create-offer", sdp: message.sdp }));
				} else {
					senderWs.send(JSON.stringify({ type: "create-offer", sdp: message.sdp }));
				}
			}
			if (message.type === "create-answer") {
				console.log("answer received");
				if (ws === senderWs) {
					receiverWs.send(JSON.stringify({ type: "create-answer", sdp: message.sdp }));
				} else {
					senderWs.send(JSON.stringify({ type: "create-answer", sdp: message.sdp }));
				}
			}
			if (message.type === "ice-candidate") {
				console.log("icy icy");
				if (ws === senderWs) {
					receiverWs.send(JSON.stringify({ type: "ice-candidate", candidate: message.candidate }));
				} else {
					senderWs.send(JSON.stringify({ type: "ice-candidate", candidate: message.candidate }));
				}
			}
		}
	});
	ws.on("close", () => {
		if (ws === senderWs) senderWs = null;
		if (ws === receiverWs) receiverWs = null;
		console.log("Client disconnected");
	});
});
